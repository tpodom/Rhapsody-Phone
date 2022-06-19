const functions = require("firebase-functions");
const { created } = require("./handlers/created");
const { hangup } = require("./handlers/hangup");

const handlers = {
  CREATED: created,
  ENDED: hangup,
};

exports.callQueueListener = functions.firestore
  .document("call_webhook_events/{docId}")
  .onCreate(async (event) => {
    const callData = event.data();
    // The call queue only shows inbound calls
    if (callData.direction === "recipient") {
      const stateHandler = handlers[callData.state];
      if (stateHandler) {
        await stateHandler(callData);
      }
    }
  });
