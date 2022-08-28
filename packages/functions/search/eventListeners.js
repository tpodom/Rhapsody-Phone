const functions = require("firebase-functions");
const messagingStore = require("../lib/db/messaging");
const { mapClientSnapshot, mapMessageSnapshot } = require("./mappers");
const { indexDocumentChange } = require("../lib/typesense/handler");
const { logger } = require("../lib/init");

exports.searchMessagesListener = functions
  .runWith({
    failurePolicy: true,
    timeoutSeconds: 240,
  })
  .firestore.document("conversations/{conversationId}/messages/{messageId}")
  .onWrite(async (change, context) => {
    const { conversationId } = context.params;

    const eventAgeMs = Date.now() - Date.parse(context.timestamp);

    // If we've retried for 5 minutes then give up
    if (eventAgeMs > 300000) {
      logger.warn("Giving up trying to search index message event", change.after.data());
      return;
    }

    const conversationSnapshot = await messagingStore.getConversation(conversationId);

    await indexDocumentChange("messages", change, (messageSnapshot) => {
      return mapMessageSnapshot(messageSnapshot, conversationSnapshot);
    });
  });

exports.searchClientsListener = functions
  .runWith({
    failurePolicy: true,
    timeoutSeconds: 240,
  })
  .firestore.document("clients/{clientId}")
  .onWrite(async (change, context) => {
    const eventAgeMs = Date.now() - Date.parse(context.timestamp);

    // If we've retried for 5 minutes then give up
    if (eventAgeMs > 300000) {
      logger.warn("Giving up trying to search index client event", change.after.data());
      return;
    }

    await indexDocumentChange("clients", change, mapClientSnapshot);
  });
