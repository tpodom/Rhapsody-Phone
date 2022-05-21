const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

exports.app = initializeApp(functions.config().firebase);
exports.db = getFirestore();
