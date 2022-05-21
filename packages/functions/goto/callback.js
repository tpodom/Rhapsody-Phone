require("../init");
const functions = require("firebase-functions");

exports.callback = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onRequest(async (request, response) => {
    response.send({});
  });
