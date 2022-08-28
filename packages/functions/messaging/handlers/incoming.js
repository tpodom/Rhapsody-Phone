const { normalizePhoneNumber } = require("../../lib/phone");
const messagingStore = require("../../lib/db/messaging");
const { logger } = require("../../lib/init");
const messaging = require("../../lib/messaging");

/**
 * Processes incoming webhook SMS event and associates it to a conversation.
 *
 * @param {DocumentSnapshot} webhookMessageSnapshot Webhook message data
 */
exports.incoming = async (webhookMessageSnapshot) => {
  const { authorPhoneNumber, body, timestamp } = webhookMessageSnapshot.data();

  try {
    const normalizedPhoneNumber = normalizePhoneNumber(authorPhoneNumber) || authorPhoneNumber;

    const conversationSnapshot = await messaging.pickConversationForMessage(normalizedPhoneNumber);
    const messageData = {
      id: webhookMessageSnapshot.id,
      conversationId: conversationSnapshot.id,
      body,
      timestamp: new Date(timestamp),
      direction: "IN",
      read: false,
      client: conversationSnapshot.data().client,
    };
    await messagingStore.upsertMessage(conversationSnapshot.id, messageData);
  } catch (err) {
    logger.error(`Error processing the received message from ${authorPhoneNumber}.`, err);
    throw err;
  }
};
