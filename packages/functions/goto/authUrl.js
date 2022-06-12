require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAdmin } = require("../lib/auth");
const oauth = require("../lib/goto/oauth");

exports.authUrl = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onCall(async (data, context) => {
    validateIsAdmin(context.auth?.token);

    return {
      url: await oauth.buildAuthorizationUrl(),
    };
  });
