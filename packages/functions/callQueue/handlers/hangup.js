const callQueueStore = require("../../lib/db/callQueue");
const { parseNumber } = require("../../lib/phone");
const { logger } = require("../../lib/init");

exports.hangup = async (data) => {
  const normalizedNumber = parseNumber(data.caller.number);
  const activeCall = await callQueueStore.findActiveCall(normalizedNumber);

  if (!activeCall.empty) {
    await callQueueStore.callEnded(activeCall.docs[0].id);
  } else {
    logger.warn(`No active call found for phone number ${normalizedNumber}`, {
      structuredData: true,
    });
  }
};
