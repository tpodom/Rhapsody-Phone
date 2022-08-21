const functions = require("firebase-functions");
const { logger } = require("../lib/init");
const { validateIsAdmin } = require("../lib/auth");
const { indexQuerySnapshot } = require("../lib/typesense/handler");
const { mapClientSnapshot, mapMessageSnapshot } = require("./mappers");
const clientsStore = require("../lib/db/clients");
const messagingStore = require("../lib/db/messaging");

exports.syncSearch = functions
  .runWith({ secrets: ["TYPESENSE_API_KEY"], timeoutSeconds: 300, memory: "256MB" })
  .https.onCall(async (params, { auth }) => {
    validateIsAdmin(auth?.token);

    try {
      await indexQuerySnapshot(
        "clients",
        await clientsStore.getClientsQuerySnapshot(),
        mapClientSnapshot,
      );

      const conversationsSnapshot = await messagingStore.getConversationsQuerySnapshot();

      conversationsSnapshot.forEach(async (conversationSnapshot) => {
        const messagesSnapshot = await messagingStore.getMessagesQuerySnapshot(
          conversationSnapshot.id,
        );

        await indexQuerySnapshot("messages", messagesSnapshot, (messagesSnapshot) => {
          return mapMessageSnapshot(messagesSnapshot, conversationSnapshot);
        });
      });
    } catch (err) {
      logger.error(err);
      throw new functions.https.HttpsError("internal", err.message);
    }
  });
