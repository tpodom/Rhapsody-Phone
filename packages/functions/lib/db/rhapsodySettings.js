const { db } = require("../init");

/**
 * Loads the Rhapsody settings
 *
 * @return {Promise<object>} Current value of Rhapsody settings
 */
exports.getSettings = async () => {
  const settingsSnap = await getSettingsDoc().get();

  if (settingsSnap.exists) {
    return settingsSnap.data();
  }
  return {};
};

/**
 * Updates the last sync time for Rhapsody.
 *
 * @param {DateTime} lastSyncTime Last sync time
 * @return {Promise<object>} Updated settings
 */
exports.updateLastSyncTime = async (lastSyncTime) => {
  await getSettingsDoc().set({ lastSyncTime }, { merge: true });
  return exports.getSettings();
};

/**
 * Updates the Rhapsody business info
 *
 * @param {object} business The business id and name
 * @return {Promise<object>} Updated settings
 */
exports.updateBusiness = async (business) => {
  await getSettingsDoc().set({ business }, { merge: true });
  return exports.getSettings();
};

/**
 * Builds reference to GoTo settings document.
 *
 * @return {DocumentReference} Reference to GoTo settings document
 */
function getSettingsDoc() {
  return db.collection("settings").doc("rhapsody");
}
