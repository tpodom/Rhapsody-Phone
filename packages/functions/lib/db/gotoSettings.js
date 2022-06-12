const { db } = require("../init");

/**
 * Loads the GoTo Connect settings
 *
 * @return {Promise<object>} Current value of GoTo Connect settings
 */
exports.getSettings = async () => {
  const settingsSnap = await getSettingsDoc().get();

  if (settingsSnap.exists) {
    return settingsSnap.data();
  }
  return {};
};

/**
 * Removes GoTo Connect settings
 *
 * @return {Promise<void>}
 */
exports.removeSettings = async () => {
  return getSettingsDoc().delete();
};

/**
 * Saves the GoTo account key to GoTo settings.
 *
 * @param {string} accountKey GoTo account key
 * @return {Promise<object>} Modified settings
 */
exports.updateAccount = async (accountKey) => {
  getSettingsDoc().set({ accountKey }, { merge: true });
  return exports.getSettings();
};

/**
 * Saves the GoTo Connect notification channel id
 *
 * @param {string} channelId GoTo Connect notification channel id
 * @return {Promise<object>} Modified settings
 */
exports.updateChannelId = async (channelId) => {
  getSettingsDoc().set({ channelId }, { merge: true });
  return exports.getSettings();
};

/**
 * Saves the GoTo Connect notification session urls
 *
 * @param {string} sessionUrl GoTo Connect notification session url
 * @param {string} subscriptionsUrl GoTo Connect notification session subscriptions url
 * @return {Promise<object>} Modified settings
 */
exports.updateSessionUrls = async (sessionUrl, subscriptionsUrl) => {
  getSettingsDoc().set({ sessionUrl, subscriptionsUrl }, { merge: true });
  return exports.getSettings();
};

/**
 * Updates the last sync time for GoTo Connect.
 *
 * @param {DateTime} lastSyncTime Last sync time
 * @return {Promise<object>} Updated settings
 */
exports.updateLastSyncTime = async (lastSyncTime) => {
  await getSettingsDoc().set({ lastSyncTime }, { merge: true });
  return exports.getSettings();
};
/**
 * Builds reference to GoTo settings document.
 *
 * @return {DocumentReference} Reference to GoTo settings document
 */
function getSettingsDoc() {
  return db.collection("settings").doc("gotoConnect");
}
