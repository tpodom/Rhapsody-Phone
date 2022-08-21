const { db } = require("../init");

/**
 * Loads the GoTo Connect settings
 *
 * @return {Promise<object>} Current value of GoTo Connect settings
 */
async function getSettingsData() {
  const settingsSnap = await getSettingsDoc().get();

  if (settingsSnap.exists) {
    return settingsSnap.data();
  }
  return {};
}

/**
 * Removes GoTo Connect settings
 *
 * @return {Promise<void>}
 */
async function removeSettings() {
  return getSettingsDoc().delete();
}

/**
 * Saves the GoTo account key to GoTo settings.
 *
 * @param {string} accountKey GoTo account key
 * @return {Promise<object>} Modified settings
 */
async function updateAccount(accountKey) {
  getSettingsDoc().set({ accountKey }, { merge: true });
  return getSettingsData();
}

/**
 * Saves the GoTo Connect notification channel id
 *
 * @param {string} channelId GoTo Connect notification channel id
 * @return {Promise<object>} Modified settings
 */
async function updateChannelId(channelId) {
  getSettingsDoc().set({ channelId }, { merge: true });
  return getSettingsData();
}

/**
 * Saves the GoTo Connect notification session urls
 *
 * @param {string} sessionUrl GoTo Connect notification session url
 * @param {string} subscriptionsUrl GoTo Connect notification session subscriptions url
 * @return {Promise<object>} Modified settings
 */
async function updateSessionUrls(sessionUrl, subscriptionsUrl) {
  getSettingsDoc().set({ sessionUrl, subscriptionsUrl }, { merge: true });
  return getSettingsData();
}

/**
 * Updates the last sync time for GoTo Connect.
 *
 * @param {DateTime} lastSyncTime Last sync time
 * @return {Promise<object>} Updated settings
 */
async function updateLastSyncTime(lastSyncTime) {
  await getSettingsDoc().set({ lastSyncTime }, { merge: true });
  return getSettingsData();
}
/**
 * Builds reference to GoTo settings document.
 *
 * @return {DocumentReference} Reference to GoTo settings document
 */
function getSettingsDoc() {
  return db.collection("settings").doc("gotoConnect");
}

exports.getSettingsData = getSettingsData;
exports.removeSettings = removeSettings;
exports.updateAccount = updateAccount;
exports.updateChannelId = updateChannelId;
exports.updateSessionUrls = updateSessionUrls;
exports.updateLastSyncTime = updateLastSyncTime;
