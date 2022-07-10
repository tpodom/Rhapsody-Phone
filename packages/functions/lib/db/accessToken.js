const { db } = require("../init");

/**
 * Retrieves the service's access token value.
 *
 * @param {string} serviceName Name of the service
 * @return {Promise<object>} Promise that resolves to the service access token.
 */
function get(serviceName) {
  return getDocRef(serviceName).get();
}

/**
 * Updates the service's access token value.
 *
 * @param {string} serviceName Name of the service
 * @param {object} data The updated data values
 * @return {Promise<object>} Promise that resolves to the modified token.
 */
async function update(serviceName, data) {
  console.log(`Setting ${serviceName} with value ${JSON.stringify(data)}`);
  const docRef = getDocRef(serviceName);
  await docRef.set(data);
  return docRef.get();
}

/**
 * Deletes the service's access token value.
 *
 * @param {string} serviceName Name of the service
 * @return {Promise<void>}
 */
function remove(serviceName) {
  return getDocRef(serviceName).delete();
}
/**
 * Builds a doc reference to firestore document for a service account access tokens.
 *
 * @param {string} serviceName Name of the service
 * @return {DocumentReference} The doc ref to the GoTo access token
 */
function getDocRef(serviceName) {
  return db.collection("access_tokens").doc(serviceName);
}

exports.get = get;
exports.update = update;
exports.remove = remove;
