const config = require("../config");
const { logger } = require("../init");
const { formatPhoneNumber } = require("../phone");
const { isConfigured, createClient } = require("./client");

/**
 * Maps document snapshot to search data with standard fields added.
 *
 * @param {DocumentSnapshot} documentSnapshot Document snapshot to convert to Typesense
 * @param {function(DocumentSnapshot): object} mapper Maps snapshot to search data
 * @return {object} Search document data
 */
function mapDocument(documentSnapshot, mapper) {
  return {
    deployment: config.deployment,
    ...mapper(documentSnapshot),
  };
}

/**
 * Maps a Firestore timestamp to a Unix time. Typesense does
 * not have a built-in date or timestamp type and recommends
 * mapping to an int64 unix time representation.
 *
 * @param {Timestamp} timestamp Firestore timestamp
 * @return {number}
 */
function mapTimestamp(timestamp) {
  return Math.floor(timestamp.toDate().getTime() / 1000);
}

/**
 * Maps an E164 phone number string to an array of formats for better searching.
 *
 * @param {string} value E164 formatted phone number
 *
 * @return {string[]} Array of formats to index
 */
function mapPhoneNumber(value) {
  if (!value) {
    return [];
  }
  return [value, formatPhoneNumber(value)];
}

/**
 * Indexes a Firestore document in Typesense.
 *
 * This is adapted from the Typesense firebase extension:
 * - https://github.com/typesense/firestore-typesense-search
 *
 * @param {string} collectionName Name of the Typesense collection
 * @param {Change<DocumentSnapshot>} change Document change record
 * @param {function(DocumentSnapshot): object} mapper Maps snapshot to search data
 *
 * @return {Promise<Document>} Typesense document
 */
function indexDocumentChange(collectionName, change, mapper) {
  if (!isConfigured()) {
    logger.debug("Skipping document indexing, Typesense is not configured.");
    return;
  }

  const client = createClient();

  if (change.before.data() == null) {
    // Create
    const typesenseDocument = mapDocument(change.after, mapper);
    logger.debug(`Creating ${collectionName} document ${JSON.stringify(typesenseDocument)}`);

    return client
      .collections(encodeURIComponent(collectionName))
      .documents()
      .create(typesenseDocument);
  } else if (change.after.data() == null) {
    // Delete
    const documentId = change.before.id;
    logger.debug(`Deleting ${collectionName} document ${documentId}`);

    return client.collections(encodeURIComponent(collectionName)).documents(documentId).delete();
  } else {
    // Update
    const typesenseDocument = mapDocument(change.after, mapper);
    logger.debug(`Upserting ${collectionName} document ${JSON.stringify(typesenseDocument)}`);

    return client
      .collections(encodeURIComponent(collectionName))
      .documents()
      .upsert(typesenseDocument);
  }
}

/**
 * Indexes all of the documents in the query result in Typesense.
 *
 * This is adapted from the Typesense firebase extension:
 * - https://github.com/typesense/firestore-typesense-search
 *
 * @param {string} collectionName Name of the Typesense collection
 * @param {QuerySnapshot} querySnapshot Query snapshot
 * @param {function(DocumentSnapshot): object} mapper Maps document snapshot to search data
 * @param {number} batchSize Size of batches to send to Typesense. Defaults to 1000.
 *
 * @return {Promise<Document>} Typesense document
 */
async function indexQuerySnapshot(collectionName, querySnapshot, mapper, batchSize = 1000) {
  if (!isConfigured()) {
    logger.debug("Skipping document indexing, Typesense is not configured.");
    return;
  }

  let currentDocumentNumber = 0;
  let currentDocumentsBatch = [];
  const client = createClient();

  const importBatch = async () => {
    try {
      await client
        .collections(encodeURIComponent(collectionName))
        .documents()
        .import(currentDocumentsBatch);

      currentDocumentsBatch = [];
      logger.info(`Imported ${currentDocumentNumber} documents into Typesense`);
    } catch (error) {
      logger.error("Import error", error);
    }
  };

  if (!querySnapshot.empty) {
    querySnapshot.forEach(async (documentSnapshot) => {
      currentDocumentNumber += 1;
      currentDocumentsBatch.push(mapDocument(documentSnapshot, mapper));

      if (currentDocumentNumber === batchSize) {
        await importBatch();
      }
    });

    if (currentDocumentsBatch.length > 0) {
      await importBatch();
    }
  }
}

exports.indexDocumentChange = indexDocumentChange;
exports.indexQuerySnapshot = indexQuerySnapshot;
exports.mapPhoneNumber = mapPhoneNumber;
exports.mapTimestamp = mapTimestamp;
