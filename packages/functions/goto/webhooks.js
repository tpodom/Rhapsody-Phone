require("../lib/init");
const functions = require("firebase-functions");
const crypto = require("crypto");
const webhooksStore = require("../lib/db/webhooks");
const { createExpressRequest } = require("../lib/express");

// TODO implement webhook signature verification
const expressApp = createExpressRequest();

expressApp.post("/incoming", async (request, response) => {
  functions.logger.info(request.body, { structuredData: true });
  const eventId = request.body.CALL_ID;

  if (!(await webhooksStore.eventExists(webhooksStore.eventTypes.call, eventId))) {
    webhooksStore.saveEvent(
      webhooksStore.eventTypes.call,
      eventId,
      mapNotifyToEvent(request.body, "CREATED"),
    );
  }

  response.sendStatus(202);
});

expressApp.post("/missed", async (request, response) => {
  functions.logger.info(request.body, { structuredData: true });
  const eventId = request.body.CALL_ID;

  if (!(await webhooksStore.eventExists(webhooksStore.eventTypes.call, eventId))) {
    webhooksStore.saveEvent(
      webhooksStore.eventTypes.call,
      eventId,
      mapNotifyToEvent(request.body, "HUNGUP"),
    );
  }

  response.sendStatus(202);
});

expressApp.post("/subscription", async (request, response) => {
  functions.logger.info(request.body, { structuredData: true });

  // Check to see if we already processed this event

  if (request.body.source === "realtime-api") {
    const eventId = hashBody(JSON.stringify(request.body.data));

    if (!(await webhooksStore.eventExists(webhooksStore.eventTypes.call, eventId))) {
      const { state, caller, callee, direction } = request.body.data;
      await webhooksStore.saveEvent(webhooksStore.eventTypes.call, eventId, {
        timestamp: request.body.timestamp,
        direction,
        state,
        caller,
        callee,
      });
    }
  } else if (request.body.source === "messaging") {
    if (
      !(await webhooksStore.eventExists(
        webhooksStore.eventTypes.messaging,
        request.body.content.id,
      ))
    ) {
      const { direction, body, timestamp, contactPhoneNumbers } = request.body.content;

      await webhooksStore.saveEvent(webhooksStore.eventTypes.messaging, request.body.content.id, {
        timestamp,
        contactPhoneNumbers,
        direction,
        body,
      });
    }
  } else {
    functions.logger.warn(`Received unexpected webhooks source ${request.body.source}`);
  }

  response.sendStatus(202);
});

/**
 * We don't receive a unique id on the webhook so we hash it to generate a fingerprint.
 *
 * @param {string} body content string to hash
 * @return {string} base64 encoded sha-256 hash
 */
function hashBody(body) {
  return crypto.createHash("sha256").update(body).digest("base64");
}

/**
 * Maps an HTTP Notify message to a Webhook call event format
 *
 * @param {object} body HTTP Notify body
 * @param {string} state Call state
 * @return {object} Webhook event formatted object
 */
function mapNotifyToEvent(body, state) {
  return {
    timestamp: new Date().toISOString(),
    direction: "recipient",
    state,
    caller: {
      name: body.CALLER_ID_NAME,
      number: body.CALLER_ID_NUMBER,
    },
    callee: {
      number: body.DIALED_NUMBER,
    },
  };
}

exports = functions.https.onRequest(expressApp);
