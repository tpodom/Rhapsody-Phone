const functions = require("firebase-functions");
const { getConversation, getMessage } = require("../lib/db/messaging");
const { validateIsAuthenticated } = require("../lib/auth");
const messaging = require("../lib/messaging");
const { generateId } = require("../lib/generator");

exports.resendMessage = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onCall(async ({ conversationId, messageId }, { auth }) => {
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

    const conversationSnapshot = await getConversation(conversationId);

    if (!conversationSnapshot) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified conversation was not found.",
      );
    }

    const messageSnapshot = await getMessage(conversationId, messageId);

    if (!messageSnapshot) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified message was not found.",
      );
    }

    return messaging.send(conversationSnapshot, messageSnapshot.data());
  });

exports.sendMessage = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onCall(async ({ conversationId, body, files }, { auth }) => {
    validateIsAuthenticated(auth?.token);

    files = files || [];

    if (!conversationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You must specify a conversation id.",
      );
    }

    if (!body && files.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "You must specify either a body or list of files to send.",
      );
    }

    for (const file of files) {
      if (!file.filename) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Uploaded files must specify a filename.",
        );
      }

      if (!file.contentType) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Uploaded files must specify a content type.",
        );
      }

      if (!file.size) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Uploaded files must specify a file size.",
        );
      }
    }

    const conversationSnapshot = await getConversation(conversationId);

    if (!conversationSnapshot) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified conversation was not found.",
      );
    }

    const message = {
      id: generateId(),
      conversationId: conversationSnapshot.id,
      timestamp: new Date(),
      body,
      direction: "OUT",
      sentStatus: "SENDING",
      read: true,
    };

    return messaging.send(conversationSnapshot, message);
  });
