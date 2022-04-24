require("./init");
const {realtime} = require("./zoom/realtime");
const {log} = require("./zoom/log");

exports.zoomLog = log;
exports.zoomRealtime = realtime;
