require("../init");
const functions = require("firebase-functions");

exports.register = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onRequest(async (request, response) => {
    const redirectUri = "https://atriumcat.odom.dev/goto/callback";
    response.redirect(
      `https://authentication.logmeininc.com/oauth/authorize?client_id=${process.env.GOTO_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}`
    );
  });
