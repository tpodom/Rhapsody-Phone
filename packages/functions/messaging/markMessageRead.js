const functions = require("firebase-functions");
const messaginStore = require("../lib/db/messaging");
const { validateIsAuthenticated } = require("../lib/auth");

exports.markMessageRead = functions.https.onCall(
  async ({ conversationId, messageId }, { auth }) => {
    validateIsAuthenticated(auth?.token);

    if (!conversationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You must specify a conversation id.",
      );
    }

    if (!messageId) {
      throw new functions.https.HttpsError("invalid-argument", "You must specify a message id.");
    }

    const conversationSnapshot = await messaginStore.getConversation(conversationId);

    if (!conversationSnapshot) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified conversation was not found.",
      );
    }

    const messageSnapshot = await messaginStore.getMessage(conversationId, messageId);

    if (!messageSnapshot) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified message was not found.",
      );
    }

    return messaginStore.upsertMessage(conversationId, {
      id: messageId,
      read: true,
    });
  },
);
