require("../lib/init");
const functions = require("firebase-functions");
const oauth = require("../lib/goto/oauth");
const settings = require("../lib/db/gotoSettings");
const { validateIsAdmin } = require("../lib/auth");

exports.disconnect = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onCall(async (data, { auth }) => {
    validateIsAdmin(auth?.token);
    await oauth.disconnectApp();
    await settings.removeSettings();
  });
