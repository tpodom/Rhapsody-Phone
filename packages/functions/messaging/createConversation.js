const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAuthenticated } = require("../lib/auth");
const { getClient } = require("../lib/db/clients");
const { upsertConversation } = require("../lib/db/messaging");
const { generateId } = require("../lib/generator");
const { normalizePhoneNumber } = require("../lib/phone");

exports.createConversation = functions.https.onCall(async ({ clientId, phoneNumber }, { auth }) => {
  validateIsAuthenticated(auth?.token);

  if (!clientId && !phoneNumber) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "You must specify either a client id or a phone number.",
    );
  }

  let clientPhoneNumber;
  let clientName;

  if (clientId) {
    const client = await getClient(clientId);

    if (!client) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The specified client could not be found.",
      );
    }

    // TODO normalize this when we sync and make it smarter
    clientName = `${client.firstName} ${client.lastName}`;
    clientPhoneNumber = client.mobilePhone;
  }

  if (phoneNumber) {
    clientPhoneNumber = normalizePhoneNumber(phoneNumber);
    clientName = null;

    if (!clientPhoneNumber) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The phone number is not a recognized format.",
      );
    }
  }

  if (!clientPhoneNumber) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The client does not have a mobile phone set. Please specify a phone number to use.",
    );
  }

  const conversationId = generateId();
  try {
    logger.info("Creating a new conversation", { clientName, clientPhoneNumber });

    const result = await upsertConversation({
      id: conversationId,
      deleted: false,
      unreadCount: 0,
      latestMessage: null,
      timestamp: new Date(),
      tags: [],
      client: {
        name: clientName,
        phoneNumber: clientPhoneNumber,
      },
    });

    return result.data();
  } catch (error) {
    logger.error(error);
    throw new functions.https.HttpsError(
      "internal",
      "An internal error occurred. If the problem persists, please contact support.",
    );
  }
});
