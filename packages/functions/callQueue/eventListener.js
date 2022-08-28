const functions = require("firebase-functions");
const { created } = require("./handlers/created");
const { hangup } = require("./handlers/hangup");
const { logger } = require("../lib/init");

const handlers = {
  CREATED: created,
  ENDED: hangup,
};

exports.callQueueListener = functions
  .runWith({
    failurePolicy: true,
    timeoutSeconds: 540,
  })
  .firestore.document("call_webhook_events/{docId}")
  .onCreate(async (snapshot, context) => {
    const eventAgeMs = Date.now() - Date.parse(context.timestamp);

    // If we've retried for 5 minutes then give up
    if (eventAgeMs > 300000) {
      logger.warn("Giving up trying to process call event", snapshot.data());
      return;
    }

    const callData = snapshot.data();
    // The call queue only shows inbound calls
    if (callData.direction === "recipient") {
      const stateHandler = handlers[callData.state];
      if (stateHandler) {
        await stateHandler(snapshot);
      }
    }
  });
