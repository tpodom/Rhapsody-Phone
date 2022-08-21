const { logger } = require("../lib/init");
const config = require("../lib/config");
const functions = require("firebase-functions");
const { createClient } = require("../lib/goto/client");
const messagingStore = require("../lib/db/messaging");
const clientStore = require("./db/clients");
const dayjs = require("dayjs");
const { generateId } = require("./generator");

/**
 * Determines whether or not the conversation was recently active.
 *
 * @param {DocumentSnapshot} conversationSnapshot Conversation snapshot
 * @return {boolean} true if conversation was within the past day
 */
function isRecentConversation(conversationSnapshot) {
  const maxAge = dayjs().subtract(24, "hours");
  const conversationDate = dayjs(conversationSnapshot.data().timestamp.toDate());
  const diff = conversationDate.diff(maxAge);

  logger.info(`Date diff result: ${diff}`, maxAge.format(), conversationDate.format());

  return diff > 0;
}
/**
 * Logs error and updates message to indicate failure.
 *
 * @param {Error} err Error that was thrown
 * @param {string} conversationId ID of conversation message belongs to
 * @param {string} messageId ID of message being sent
 */
async function handleSendError(err, conversationId, messageId) {
  logger.error("Error sending message", err);

  try {
    await messagingStore.upsertMessage(conversationId, {
      id: messageId,
      sentStatus: "ERROR",
    });
  } catch (updateErr) {
    logger.error(updateErr);
  }
}

/**
 * Sends the message asynchronously
 *
 * @param {DocumentSnapshot} conversationSnapshot Conversation message belongs to
 * @param {DocumentSnapshot} messageSnapshot Message to send
 */
async function sendAsync(conversationSnapshot, messageSnapshot) {
  try {
    const gotoClient = await createClient();

    await gotoClient.sendMessage(
      config.mainPhoneNumber,
      conversationSnapshot.data().client?.phoneNumber,
      messageSnapshot.data().body,
      messageSnapshot.data().files,
    );

    await messagingStore.upsertMessage(conversationSnapshot.id, {
      id: messageSnapshot.id,
      sentStatus: "SUCCESSFUL",
    });
  } catch (err) {
    handleSendError(err, conversationSnapshot.id, messageSnapshot.id);
  }
}

/**
 * Prepares the message and sends it asynchronously
 *
 * @param {DocumentSnapshot} conversationSnapshot Conversation message belongs to
 * @param {object} messageData Message data to send
 */
async function send(conversationSnapshot, messageData) {
  try {
    const messageSnapshot = await messagingStore.upsertMessage(
      conversationSnapshot.id,
      messageData,
    );

    sendAsync(conversationSnapshot, messageSnapshot);

    return messageSnapshot.data();
  } catch (err) {
    handleSendError(err, conversationSnapshot, messageData.id);

    throw new functions.https.HttpsError("internal", err.message);
  }
}

/**
 * Chooses an existing conversation to link a message to or creates a
 * new conversation if no suitable conversation is found.
 *
 * @param {string} phoneNumber E164 format phone number of client
 *
 * @return {Promise<DocumentSnapshot>} Snapshot of the conversation
 */
async function pickConversationForMessage(phoneNumber) {
  const client = {
    phoneNumber,
  };

  try {
    const rhapsodyClient = await clientStore.findClientByPhone(phoneNumber);

    if (rhapsodyClient) {
      logger.debug(`Received a new message from client ${rhapsodyClient.id}`);
      client.id = rhapsodyClient.id;
      client.name = rhapsodyClient.displayName;
    }
  } catch (err) {
    logger.error(`Error looking up client by phone number ${phoneNumber}.`, err);
  }

  const latestConversation = await messagingStore.findLatestConversation(
    client.id,
    client.phoneNumber,
  );

  if (latestConversation && isRecentConversation(latestConversation)) {
    logger.debug(
      `Found existing conversation for phone number ${phoneNumber}`,
      latestConversation.data(),
    );
    return latestConversation;
  } else {
    logger.debug(
      `Starting new conversation for phone number ${phoneNumber}`,
      latestConversation?.data(),
    );
  }

  const newConversationData = {
    id: generateId(),
    deleted: false,
    errorCount: 0,
    unreadCount: 0,
    timestamp: new Date(),
    labels: [],
    client,
  };

  return messagingStore.upsertConversation(newConversationData);
}

exports.pickConversationForMessage = pickConversationForMessage;
exports.send = send;
