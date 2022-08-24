const functions = require("firebase-functions");
const messagingStore = require("../lib/db/messaging");
const { mapClientSnapshot, mapMessageSnapshot } = require("./mappers");
const { indexDocumentChange } = require("../lib/typesense/handler");

exports.searchMessagesListener = functions
  .runWith({
    timeoutSeconds: 60,
  })
  .firestore.document("conversations/{conversationId}/messages/{messageId}")
  .onWrite(async (change, context) => {
    const { conversationId } = context.params;
    const conversationSnapshot = await messagingStore.getConversation(conversationId);

    await indexDocumentChange("messages", change, (messageSnapshot) => {
      return mapMessageSnapshot(messageSnapshot, conversationSnapshot);
    });
  });

exports.searchClientsListener = functions
  .runWith({
    timeoutSeconds: 60,
  })
  .firestore.document("clients/{clientId}")
  .onWrite(async (change, context) => {
    await indexDocumentChange("clients", change, mapClientSnapshot);
  });
