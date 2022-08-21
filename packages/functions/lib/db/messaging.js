const { db } = require("../init");
const dayjs = require("dayjs");

/**
 * Retrieves a single conversation.
 *
 * @param {string} conversationId Conversation ID
 * @return {Promise<DocumentSnapshot | null>} Conversation data if found or null if it does not exist
 */
async function getConversation(conversationId) {
  const conversationSnapshot = await getConversationsRef().doc(conversationId).get();

  return conversationSnapshot.exists ? conversationSnapshot : null;
}

/**
 * Returns a query snapshot of all conversations.
 *
 * @return {Promise<QuerySnapshot>}
 */
function getConversationsQuerySnapshot() {
  return getConversationsRef().get();
}

/**
 * Returns a query snapshot of all messages for a conversation.
 *
 * @param {string} conversationId The ID of the conversation containing the messages.
 *
 * @return {Promise<QuerySnapshot>}
 */
function getMessagesQuerySnapshot(conversationId) {
  return getConversationsRef().doc(conversationId).collection("messages").get();
}

/**
 * Retrieves a single message.
 *
 * @param {string} conversationId Conversation ID
 * @param {string} messageId Message ID
 * @return {Promise<DocumentSnapshot | null>} Message data if found or null if it does not exist
 */
async function getMessage(conversationId, messageId) {
  const messageSnapshot = await getConversationsRef()
    .doc(conversationId)
    .collection("messages")
    .doc(messageId)
    .get();

  return messageSnapshot.exists ? messageSnapshot : null;
}

/**
 * Adds or updates a conversation
 *
 * @param {object} conversation The conversation data
 *
 * @return {Promise<object>} modified conversation
 */
async function upsertConversation(conversation) {
  const conversationRef = getConversationsRef().doc(conversation.id);

  await conversationRef.set(conversation, { merge: true });
  return conversationRef.get();
}

/**
 * Adds or updates a message in a conversation.
 *
 * @param {string} conversationId The ID of the conversation to add the message to.
 * @param {object} message The message to add/update.
 *
 * @return {Promise<object>} modified message
 */
async function upsertMessage(conversationId, message) {
  const conversationRef = getConversationsRef().doc(conversationId);
  const messageRef = conversationRef.collection("messages").doc(message.id);
  await messageRef.set(message, { merge: true });
  return messageRef.get();
}

/**
 * Updates the conversation aggregation values based on the changes to the message.
 *
 * @param {string} conversationId ID of the conversation that was modified
 * @param {Change<DocumentSnapshot>} messageBefore Message in previous state
 * @param {Change<DocumentSnapshot>} messageAfter Message in new state
 */
async function updateConversationAggregations(conversationId, messageBefore, messageAfter) {
  const conversationRef = getConversationsRef().doc(conversationId);

  await db.runTransaction(async (transaction) => {
    const conversationSnapshot = await transaction.get(conversationRef);

    if (!conversationSnapshot.exists) {
      return;
    }

    let { timestamp, errorCount, unreadCount, latestMessage } = conversationSnapshot.data();

    if (!latestMessage || messageAfter.data().timestamp > timestamp) {
      timestamp = messageAfter.data().timestamp;
      latestMessage = messageAfter.data();
    }

    const wasUnread = messageBefore.data() && !messageBefore.data().read;
    const isRead = messageAfter.data() && messageAfter.data().read;

    if (wasUnread && isRead) {
      unreadCount -= 1;
    } else if (!isRead) {
      unreadCount += 1;
    }

    const wasError = messageBefore.data() && messageBefore.data().sentStatus === "ERROR";
    const isError = messageAfter.data() && messageAfter.data().sentStatus === "ERROR";

    if (wasError && !isError) {
      errorCount -= 1;
    } else if (isError) {
      errorCount += 1;
    }

    transaction.update(conversationRef, {
      timestamp,
      errorCount,
      unreadCount,
      latestMessage: latestMessage || null,
    });
  });
}

/**
 * Finds the most recent conversation for a client or phone number.
 *
 * @param {string} clientId ID of client associated to conversation
 * @param {string} phoneNumber Phone number associated to conversation
 *
 * @return {Promise<DocumentSnapshot | null>} Most recent conversation
 */
async function findLatestConversation(clientId, phoneNumber) {
  const queries = [];

  if (clientId) {
    queries.push(
      getConversationsRef()
        .where("client.id", "==", clientId)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get(),
    );
  }

  if (phoneNumber) {
    queries.push(
      getConversationsRef()
        .where("client.phoneNumber", "==", phoneNumber)
        .orderBy("timestamp", "desc")
        .limit(1)
        .get(),
    );
  }

  const results = await Promise.all(queries);
  let latestConversation = null;

  for (const result of results) {
    if (!result.empty) {
      const conversationSnapshot = result.docs[0];
      const snapshotDay = dayjs(conversationSnapshot.data().timestamp.toDate());
      const isNewer =
        !latestConversation ||
        snapshotDay.diff(dayjs(latestConversation.data().timestamp.toDate())) > 0;
      if (isNewer) {
        latestConversation = conversationSnapshot;
      }
    }
  }

  return latestConversation;
}

/**
 * Retrieves conversations collection
 *
 * @return {CollectionReference} Reference to conversations collection
 */
function getConversationsRef() {
  return db.collection("conversations");
}

exports.getConversation = getConversation;
exports.getConversationsQuerySnapshot = getConversationsQuerySnapshot;
exports.getMessagesQuerySnapshot = getMessagesQuerySnapshot;
exports.getMessage = getMessage;
exports.upsertConversation = upsertConversation;
exports.upsertMessage = upsertMessage;
exports.updateConversationAggregations = updateConversationAggregations;
exports.findLatestConversation = findLatestConversation;
