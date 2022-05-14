require("./init");
const calls = require("./webhooks/calls");
const { sms } = require("./webhooks/sms");

exports.webhookCallsIncoming = calls.incoming;
exports.webhookCallsAnswered = calls.answered;
exports.webhookCallsMissed = calls.missed;
exports.webhookSMS = sms;
