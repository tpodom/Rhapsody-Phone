const { normalizePhoneNumber } = require("../../lib/phone");
const messagingStore = require("../../lib/db/messaging");
const { logger } = require("../../lib/init");
const { generateId } = require("../../lib/generator");
const messaging = require("../../lib/messaging");

/**
 * Processes incoming webhook SMS event and associates it to a conversation.
 *
 * @param {object} webhookMessage Webhook message data
 */
exports.incoming = async (webhookMessage) => {
  const { authorPhoneNumber, body, timestamp } = webhookMessage;
  const normalizedPhoneNumber = normalizePhoneNumber(authorPhoneNumber) || authorPhoneNumber;

  const conversationSnapshot = await messaging.pickConversationForMessage(normalizedPhoneNumber);
  const messageData = {
    id: generateId(),
    conversationId: conversationSnapshot.id,
    body,
    timestamp: new Date(timestamp),
    direction: "IN",
    read: false,
    client: conversationSnapshot.data().client,
  };

  try {
    await messagingStore.upsertMessage(conversationSnapshot.id, messageData);
  } catch (err) {
    logger.error(`Error saving the received message from ${authorPhoneNumber}.`, err);
  }
};
