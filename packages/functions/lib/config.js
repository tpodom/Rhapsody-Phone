const config = {
  baseUrl: process.env.BASE_URL || "https://atriumcat.odom.dev",
  emulator: process.env.FUNCTIONS_EMULATOR === "true",
  mainPhoneNumber: process.env.MAIN_PHONE_NUMBER,
  gotoConnect: {
    authUrl: process.env.GOTO_OAUTH_SERVICE_URL || "https://authentication.logmeininc.com",
    adminApiBaseUrl: "https://api.getgo.com/admin/rest/v1",
    connectApiBaseUrl: "https://api.jive.com",
    connectRealtimeApiBaseUrl: "https://realtime.jive.com",
    messagingApiBaseUrl: "https://api.jive.com/messaging",
  },
};

module.exports = config;
