const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAdmin } = require("../lib/auth");
const { updateWebhooks } = require("../lib/goto/updateWebhooks");

exports.update = functions
  .runWith({
    secrets: ["GOTO_WEBHOOK_SECRET", "GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"],
    timeoutSeconds: 300,
  })
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

exports.updateTask = functions
  .runWith({
    secrets: ["GOTO_WEBHOOK_SECRET", "GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"],
    timeoutSeconds: 540,
  })
  .pubsub.schedule("15 6,18 * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      logger.debug(process.env);
      return await updateWebhooks();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });
