const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAdmin } = require("../lib/auth");
const { updateWebhooks } = require("../lib/goto/updateWebhooks");

exports.update = functions
  .runWith({ secrets: ["GOTO_WEBHOOK_SECRET"] })
  .https.onCall(async (data, context) => {
    validateIsAdmin(context.auth?.token);
    try {
      await updateWebhooks();
    } catch (err) {
      logger.error(err);
      throw new functions.https.HttpsError("internal", err.message);
    }
    return true;
  });
