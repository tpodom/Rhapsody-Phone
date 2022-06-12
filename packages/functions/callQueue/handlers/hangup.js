const functions = require("firebase-functions");
const callQueueStore = require("../../lib/db/callQueue");
const { parseNumber } = require("../../lib/phone");

exports.hangup = async (data) => {
  const normalizedNumber = parseNumber(data.caller.number);
  const activeCall = await callQueueStore.findActiveCall(normalizedNumber);

  if (!activeCall.empty) {
    await callQueueStore.callEnded(activeCall.docs[0].id);
  } else {
    functions.logger.warn(`No active call found for phone number ${normalizedNumber}`, {
      structuredData: true,
    });
  }
};
