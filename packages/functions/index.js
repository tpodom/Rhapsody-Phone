const calls = require("./webhooks/calls");
const { sms } = require("./webhooks/sms");
const { register } = require("./goto/register");
const { callback } = require("./goto/callback");

exports.webhookCallsIncoming = calls.incoming;
exports.webhookCallsMissed = calls.missed;
exports.webhookSMS = sms;
exports.gotoRegister = register;
exports.gotoCallback = callback;
