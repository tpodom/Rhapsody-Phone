const functions = require("firebase-functions");
const {initializeApp} = require("firebase-admin/app");
initializeApp(functions.config().firebase);
