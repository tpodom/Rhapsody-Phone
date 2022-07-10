const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const messagingStore = require("../lib/db/messaging");
const { incoming } = require("./handlers/incoming");

exports.messageListener = functions.firestore
  .document("conversations/{conversationId}/messages/{messageId}")
  .onWrite(async (change, context) => {
    const { conversationId } = context.params;

    logger.info(`Updating aggregations for conversation ${conversationId}`);

    return messagingStore.updateConversationAggregations(
      conversationId,
      change.before,
      change.after,
    );
  });

exports.messagingWebhookListener = functions.firestore
  .document("messaging_webhook_events/{docId}")
  .onCreate(async (event) => {
    logger.info("Processing messaging webhook", event.data());
    const messageData = event.data();

    if (messageData.direction === "IN") {
      incoming(messageData);
    }
  });
