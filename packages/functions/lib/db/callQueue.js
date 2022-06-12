const { db } = require("../init");

const CALL_STATES = {
  ANSWERED: "answered",
  CALLING: "calling",
  ENDED: "ended",
};

/**
 * Finds an active call for the caller phone number
 *
 * @param {string} callerNumber Caller phone number
 * @return {Promise<object>} Call data
 */
async function findActiveCall(callerNumber) {
  return getCallQueue()
    .where("state", "!=", CALL_STATES.ENDED)
    .where("caller.phoneNumber", "==", callerNumber)
    .limit(1)
    .get();
}

/**
 * Records a new incoming call.
 *
 * @param {string} callId
 * @param {string} callerNumber
 * @param {string} callerName
 */
async function callStarted(callId, callerNumber, callerName) {
  return getCallQueue()
    .doc(callId)
    .create({
      startTime: new Date(),
      endTime: null,
      state: CALL_STATES.CALLING,
      caller: {
        phoneNumber: callerNumber,
        name: callerName,
      },
    });
}

/**
 * Modifies call record with extra details.
 *
 * @param {string} callId Call ID
 * @param {object} details Call details
 * @return {Promise<object>} Modified call record
 */
function updateCallDetails(callId, details) {
  return getCallQueue().doc(callId).set(details, { merge: true });
}

/**
 * Updates the call to mark it ended
 *
 * @param {string} callId The ID of the call
 * @return {Promise<object>} Modified call record
 */
async function callEnded(callId) {
  return getCallQueue().doc(callId).set(
    {
      state: CALL_STATES.ENDED,
      endTime: new Date(),
    },
    { merge: true },
  );
}

/**
 * Retrieves call queue collection
 *
 * @return {CollectionReference} Reference to call queue collection
 */
function getCallQueue() {
  return db.collection("call_queue");
}

exports.callStarted = callStarted;
exports.updateCallDetails = updateCallDetails;
exports.callEnded = callEnded;
exports.findActiveCall = findActiveCall;
