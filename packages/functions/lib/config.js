const config = {
  baseUrl: process.env.BASE_URL,
  emulator: process.env.FUNCTIONS_EMULATOR === "true",
  mainPhoneNumber: process.env.MAIN_PHONE_NUMBER,
  gotoConnect: {
    authUrl: process.env.GOTO_OAUTH_SERVICE_URL || "https://authentication.logmeininc.com",
    adminApiBaseUrl: "https://api.getgo.com/admin/rest/v1",
    connectApiBaseUrl: "https://api.jive.com",
    connectRealtimeApiBaseUrl: "https://realtime.jive.com",
    messagingApiBaseUrl: "https://api.jive.com/messaging",
    channelName: process.env.GOTO_CONNECT_CHANNEL_NAME || "vet-connect",
  },
  typesense: {
    hosts: (process.env.TYPESENSE_HOSTS || "")
      .split(",")
      .map((host) => host.trim())
      .filter((host) => !!host),
    port: process.env.TYPESENSE_PORT || "443",
    protocol: process.env.TYPESENSE_PROTOCOL || "https",
    apiKey: process.env.TYPESENSE_API_KEY,
    backfillBatchSize: 1000,
  },
};

module.exports = config;
