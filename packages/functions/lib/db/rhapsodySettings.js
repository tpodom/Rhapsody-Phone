const { db } = require("../init");

/**
 * Loads the Rhapsody settings
 *
 * @return {Promise<object>} Current value of Rhapsody settings
 */
async function getSettingsData() {
  const settingsSnap = await getSettingsDoc().get();

  if (settingsSnap.exists) {
    return settingsSnap.data();
  }
  return {};
}

/**
 * Updates the last sync time for Rhapsody.
 *
 * @param {DateTime} lastSyncTime Last sync time
 * @return {Promise<object>} Updated settings
 */
async function updateLastSyncTime(lastSyncTime) {
  await getSettingsDoc().set({ lastSyncTime }, { merge: true });
  return getSettingsData();
}

/**
 * Updates the Rhapsody business info
 *
 * @param {object} business The business id and name
 * @return {Promise<object>} Updated settings
 */
async function updateBusiness(business) {
  await getSettingsDoc().set({ business }, { merge: true });
  return getSettingsData();
}

/**
 * Builds reference to GoTo settings document.
 *
 * @return {DocumentReference} Reference to GoTo settings document
 */
function getSettingsDoc() {
  return db.collection("settings").doc("rhapsody");
}

exports.getSettingsData = getSettingsData;
exports.updateLastSyncTime = updateLastSyncTime;
exports.updateBusiness = updateBusiness;
