require("../init");
const functions = require("firebase-functions");
// const { doc, setDoc, getDoc } = require("firebase-admin/firestore");

exports.incoming = functions.https.onRequest(async (request, response) => {
  functions.logger.info(request.body, { structuredData: true });
  response.send({});
});

exports.missed = functions.https.onRequest(async (request, response) => {
  functions.logger.info(request.body, { structuredData: true });
  response.send({});
});
