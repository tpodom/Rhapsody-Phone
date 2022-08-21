const Typesense = require("typesense");
const config = require("../config");

/**
 * Returns whether or not Typesense is configured.
 *
 * @return {boolean}
 */
function isConfigured() {
  return config.typesense.hosts.length > 0;
}

/**
 * Instantiates a Typesense client.
 *
 * @return {Typesense.Client} Typesense client
 */
function createClient() {
  return new Typesense.Client({
    nodes: config.typesense.hosts.map((h) => {
      return {
        host: h,
        port: config.typesense.port,
        protocol: config.typesense.protocol,
      };
    }),
    apiKey: config.typesense.apiKey,
    connectionTimeoutSeconds: 120,
    retryIntervalSeconds: 120,
  });
}

exports.isConfigured = isConfigured;
exports.createClient = createClient;
