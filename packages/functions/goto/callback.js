const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const oauth = require("../lib/goto/oauth");
const { createClient } = require("../lib/goto/client");
const settings = require("../lib/db/gotoSettings");
const { validateIsAdmin } = require("../lib/auth");

exports.callback = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onCall(async ({ code, state }, context) => {
    validateIsAdmin(context.auth?.token);

    if (!code) {
      throw new functions.https.HttpsError("invalid-argument", "Authorization code is required.");
    }

    if (!state) {
      throw new functions.https.HttpsError("invalid-argument", "State is required.");
    }

    try {
      const tokens = await oauth.connectApp(code, state);
      logger.info(tokens, { structuredData: true });

      const client = await createClient();
      const account = await client.getAccount();
      const updatedSettings = await settings.updateAccount(account);
      logger.info(updatedSettings, { structuredData: true });
    } catch (err) {
      logger.error(err);
      throw new functions.https.HttpsError("internal", err.message);
    }
  });
