const { normalizePhoneNumber } = require("../../lib/phone");
const clientStore = require("../../lib/db/clients");
const callQueueStore = require("../../lib/db/callQueue");
const { logger } = require("../../lib/init");

exports.created = async (snapshot) => {
  const callId = snapshot.id;
  const data = snapshot.data();
  const normalizedNumber = normalizePhoneNumber(data.caller.number) || data.caller.number;

  await callQueueStore.callStarted(callId, normalizedNumber, data.caller.name);
  try {
    const rhapsodyClient = await clientStore.findClientByPhone(normalizedNumber);
    logger.debug(`Found matching client for phone number ${normalizedNumber}`, rhapsodyClient);
    if (rhapsodyClient) {
      await callQueueStore.updateCallDetails(callId, {
        rhapsodyClientId: rhapsodyClient.id,
      });
    }
  } catch (error) {
    logger.error(
      `Error processing call created event from phone number ${normalizedNumber}`,
      error,
    );
    throw error;
  }
};
