require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAdmin } = require("../lib/auth");
const { updateWebhooks } = require("../lib/goto/updateWebhooks");

exports.update = functions
  .runWith({ secrets: ["GOTO_WEBHOOK_SECRET"] })
  .https.onCall(async (data, context) => {
    validateIsAdmin(context.auth?.token);
    await updateWebhooks();
    return true;
  });

exports.updateTask = functions
  .runWith({ secrets: ["GOTO_WEBHOOK_SECRET"] })
  .pubsub.schedule("15 6,18 * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    await updateWebhooks();
  });
