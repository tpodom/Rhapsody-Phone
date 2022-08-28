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

exports.messagingWebhookListener = functions
  .runWith({
    failurePolicy: true,
    timeoutSeconds: 540,
  })
  .firestore.document("messaging_webhook_events/{docId}")
  .onCreate(async (snapshot, context) => {
    const eventAgeMs = Date.now() - Date.parse(context.timestamp);

    // If we've retried for 5 minutes then give up
    if (eventAgeMs > 300000) {
      logger.warn("Giving up trying to process message event", snapshot.data());
      return;
    }

    logger.info("Processing messaging webhook", snapshot.data());
    const messageData = snapshot.data();

    if (messageData.direction === "IN") {
      await incoming(snapshot);
    }
  });
