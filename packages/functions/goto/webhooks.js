const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const crypto = require("crypto");
const webhooksStore = require("../lib/db/webhooks");
const { createExpressRequest } = require("../lib/express");
const express = require("express");

// TODO implement webhook signature verification
const expressApp = createExpressRequest();
// eslint-disable-next-line new-cap
const router = express.Router();

// Add GET operation to allow GoTo Connect HEAD operation to work
router.get("/incoming", (request, response) => {
  response.send(200);
});

router.post("/incoming", async (request, response) => {
  logger.info(request.body, { structuredData: true });
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

// Add GET operation to allow GoTo Connect HEAD operation to work
router.get("/missed", (request, response) => {
  response.send(200);
});

router.post("/missed", async (request, response) => {
  logger.info(request.body, { structuredData: true });
  const eventId = request.body.CALL_ID;

  // Don't filter on call id, it will have same id as initial notification
  // and we always want to make sure we process the hangup event.
  webhooksStore.saveEvent(
    webhooksStore.eventTypes.call,
    eventId,
    mapNotifyToEvent(request.body, "HUNGUP"),
  );

  response.sendStatus(202);
});

// Add GET operation to allow GoTo Connect HEAD operation to work
router.get("/subscription", (request, response) => {
  response.send(200);
});

router.post("/subscription", async (request, response) => {
  logger.info(request.body, { structuredData: true });

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
    logger.warn(`Received unexpected webhooks source ${request.body.source}`);
  }

  response.sendStatus(202);
});

expressApp.use("/webhooks", router);

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

module.exports = functions.https.onRequest(expressApp);
