const { logger } = require("../init");
const { AuthorizationCode } = require("simple-oauth2");
const config = require("../config");
const accessTokenStore = require("../db/accessToken");
const { generateId } = require("../generator");

const GOTO_CONNECT_SERVICE_NAME = "goto_connect";

/**
 * Builds a URL to the GoTo OAuth server.
 *
 * @return {string} The authorization URL
 */
exports.buildAuthorizationUrl = async () => {
  const oauthConfig = createConfig();
  const client = new AuthorizationCode(oauthConfig);
  const state = generateId();
  const result = await accessTokenStore.update(GOTO_CONNECT_SERVICE_NAME, { state });
  logger.log("Stored state ", result);
  return client.authorizeURL({
    redirect_uri: createRedirectUri(),
    state,
  });
};

/**
 * Exchanges an auth code for access & refresh tokens and persists the access token.
 *
 * @param {string} authCode The returned authorization code.
 * @param {string} state Returned state value, should match stored value
 *
 * @return {Promise<AccessToken>} Access token information
 */
exports.connectApp = async (authCode, state) => {
  const accessTokenSnapshot = await accessTokenStore.get(GOTO_CONNECT_SERVICE_NAME);
  const storedState = accessTokenSnapshot.exists ? accessTokenSnapshot.data()?.state : null;
  logger.log(`Stored state value: ${storedState}, state value: ${state}`);

  if (storedState !== state) {
    throw new Error("Invalid state");
  }

  const client = createOAuthClient();
  const tokenParams = {
    code: authCode,
    redirect_uri: createRedirectUri(),
    scope:
      "identity: cr.v1.read realtime.v2.notifications.manage users.v1.lines.read messaging.v1.read messaging.v1.send messaging.v1.notifications.manage webrtc.v1.read",
  };

  const accessToken = await client.getToken(tokenParams);
  await accessTokenStore.update(GOTO_CONNECT_SERVICE_NAME, JSON.parse(JSON.stringify(accessToken)));
  logger.debug("GoTo Connect authorization completed", JSON.parse(JSON.stringify(accessToken)), {
    structuredData: true,
  });
  return accessToken;
};

/**
 * Revokes the issued access and refresh tokens and deletes our copy.
 *
 * @return {Promise<void>}
 */
exports.disconnectApp = async () => {
  const accessToken = await exports.loadAccessToken();
  if (accessToken) {
    try {
      await accessToken.revokeAll();
    } catch (error) {
      // warn and continue with deleting our copy
      logger.warn(`Error revoking tokens: ${error.message}`, error, {
        structuredData: true,
      });
    }

    await accessTokenStore.remove(GOTO_CONNECT_SERVICE_NAME);
  }

  return accessToken;
};

/**
 * Attempts to retrieve the access token for GoTo from the DB.
 *
 * @return {Promise<AccessToken>} A promise resolving to an AccessToken for GoTo or null if not available.
 */
exports.loadAccessToken = async () => {
  const EXPIRATION_WINDOW_IN_SECONDS = 300;
  const accessTokenSnapshot = await accessTokenStore.get(GOTO_CONNECT_SERVICE_NAME);

  if (accessTokenSnapshot.exists) {
    const accessToken = createOAuthClient().createToken(accessTokenSnapshot.data());

    if (accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
      try {
        return await accessToken.refresh();
      } catch (error) {
        logger.error(
          `Error refreshing GoTo Connect access token, deleting tokens: ${error.message}`,
          {
            structuredData: true,
          },
        );

        await accessTokenStore.remove(GOTO_CONNECT_SERVICE_NAME);
        return null;
      }
    }

    return accessToken;
  }

  return null;
};

/**
 * Creates a simple-oauth2 client config from configured env vars.
 *
 * @return {object} simple-oauth2 client config
 */
function createConfig() {
  return {
    client: {
      id: process.env.GOTO_CLIENT_ID,
      secret: process.env.GOTO_CLIENT_SECRET,
    },
    auth: {
      tokenHost: config.gotoConnect.authUrl,
    },
  };
}

/**
 * Builds a redirect URI to either the real one or the emulator one.
 *
 * @return {string} redirect URL for our auth callback
 */
function createRedirectUri() {
  logger.debug("Config: ", config);
  return `${config.baseUrl}/goto/callback`;
}

/**
 *
 * @return {AuthorizationCode} OAuth2 client
 */
function createOAuthClient() {
  const oauthConfig = createConfig();
  return new AuthorizationCode(oauthConfig);
}
