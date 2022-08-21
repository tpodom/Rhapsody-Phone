const { validateIsAuthenticated } = require("../lib/auth");
const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const messagingStore = require("../lib/db/messaging");

exports.updateConversationLabels = functions.https.onCall(
  async ({ conversationId, labelIds }, { auth }) => {
    validateIsAuthenticated(auth?.token);

    if (!conversationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You must specify a conversation id to update.",
      );
    }

    const conversationSnapshot = await messagingStore.getConversation(conversationId);

    if (!conversationSnapshot) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified conversation was not found.",
      );
    }

    logger.info(`upading labels for ${conversationId}`, { conversationId, labelIds });

    return messagingStore.upsertConversation({
      id: conversationId,
      labels: labelIds || [],
    });
  },
);
