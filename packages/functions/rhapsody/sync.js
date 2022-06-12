require("../lib/init");
const functions = require("firebase-functions");
const { sync } = require("../lib/rhapsody/sync");
const { validateIsAdmin } = require("../lib/auth");

exports.sync = functions
  .runWith({ secrets: ["RHAPSODY_API_KEY"], timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    validateIsAdmin(context.auth?.token);
    await sync(process.env.RHAPSODY_API_KEY);
    return true;
  });

exports.syncTask = functions
  .runWith({ secrets: ["RHAPSODY_API_KEY"] })
  .pubsub.schedule("15 6,18 * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    await sync(process.env.RHAPSODY_API_KEY);
  });
