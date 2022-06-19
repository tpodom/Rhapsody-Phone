const { db } = require("../init");

const eventTypes = {
  call: "call",
  messaging: "messaging",
};

/**
 * Checks whether or not the event with the id exists
 *
 * @param {string} eventType Type of event
 * @param {string} eventId Event id to look up
 * @return {Promise<boolean>} True if event exists, false otherwise
 */
async function eventExists(eventType, eventId) {
  return !!(await getEvent(eventType, eventId));
}

/**
 * Finds webhook event with the matching id.
 *
 * @param {string} eventType Type of event
 * @param {string} eventId Event id to look up
 * @return {Promise<DocumentSnapshot | null>} Webhook event data
 */
async function getEvent(eventType, eventId) {
  const eventSnapshot = await getEventCollection(eventType).doc(eventId).get();

  return eventSnapshot.exists ? eventSnapshot : null;
}

/**
 * Stores webhook event data
 *
 * @param {string} eventType Type of event
 * @param {string} eventId Event id
 * @param {object} data Webhook data to store
 * @return {Promise<void>}
 */
async function saveEvent(eventType, eventId, data = {}) {
  return getEventCollection(eventType)
    .doc(eventId)
    .set({ ...data, createdAt: new Date() });
}

/**
 * Creates reference to webhooks events collection.
 *
 * @param {string} eventType Type of event
 * @return {CollectionReference} Reference to webhook events collection
 */
function getEventCollection(eventType) {
  return db.collection(`${eventType}_webhook_events`);
}

exports.eventExists = eventExists;
exports.getEvent = getEvent;
exports.saveEvent = saveEvent;
exports.eventTypes = eventTypes;
