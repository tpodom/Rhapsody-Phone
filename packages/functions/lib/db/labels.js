const { db } = require("../init");

/**
 * Retrieves a single label.
 *
 * @param {string} labelId Label ID
 * @return {Promise<DocumentSnapshot | null>} Label snapshot if found or null if it does not exist
 */
async function getLabel(labelId) {
  const labelSnapshot = await getLabelsRef().doc(labelId).get();

  return labelSnapshot.exists ? labelSnapshot : null;
}

/**
 * Retrieves the label with the matching name if it exists.
 *
 * @param {string} name Label name to find
 * @return {DocumentSnapshot} Label or null if it does not exist
 */
async function findLabelByName(name) {
  const labelSnapshot = getLabelsRef()
    .where("name", "==", name)
    .where("deleted", "==", false)
    .limit(1)
    .get();

  if (!labelSnapshot.exists) {
    return null;
  }

  return labelSnapshot;
}

/**
 * Adds or updates a label.
 *
 * @param {object} labelData Label data containing id, name, and RGB hex color
 */
async function upsertLabel(labelData) {
  const labelRef = getLabelsRef().doc(labelData.id);
  await labelRef.set(labelData, { merge: true });
  return labelRef.get();
}

/**
 * Retrieves labels collection
 *
 * @return {CollectionReference} Reference to labels collection
 */
function getLabelsRef() {
  return db.collection("labels");
}

exports.getLabel = getLabel;
exports.findLabelByName = findLabelByName;
exports.upsertLabel = upsertLabel;
