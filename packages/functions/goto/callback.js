require("../lib/init");
const functions = require("firebase-functions");
const oauth = require("../lib/goto/oauth");
const { createClient } = require("../lib/goto/client");
const settings = require("../lib/db/gotoSettings");

exports.callback = functions
  .runWith({ secrets: ["GOTO_CLIENT_ID", "GOTO_CLIENT_SECRET"] })
  .https.onRequest(async (request, response) => {
    if (!request.query.code) {
      return response.status(400).send("Authorization code is required.");
    }

    if (!request.query.state) {
      return response.status(400).send("State is required.");
    }

    try {
      const tokens = await oauth.connectApp(request.query.code, request.query.state);
      functions.logger.info(tokens, { structuredData: true });

      const client = await createClient();
      const account = await client.getAccount();
      const updatedSettings = await settings.updateAccount(account);
      functions.logger.info(updatedSettings, { structuredData: true });

      response.status(200).send(`
      <html>
      <body>
      GoTo Connect has been successfully connected. This window is safe to close.
      <script>window.close()</script>
      </body>
      </html>
      `);
    } catch (err) {
      functions.logger.error(`Error connecting the GoTo Connect client: ${err.message}`, err);
      response.status(500).send(`
      <html>
      <body>
      An error occurred connecting the GoTo Connect service.
      </body>
      </html>
      `);
    }
  });
