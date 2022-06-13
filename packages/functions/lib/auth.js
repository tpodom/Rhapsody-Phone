const admin = require("firebase-admin");
const { logger } = require("./init");

/**
 * Checks if the auth data has the admin claim.
 *
 * @param {IdToken} token ID token
 * @return {boolean} true if the user has admin claim, false otherwise.
 */
exports.isAdmin = (token) => {
  return !!token?.admin;
};

/**
 * Ensures the authenticated user has the admin claim. Throws an error if not an admin.
 *
 * @param {IdToken} token ID token
 */
exports.validateIsAdmin = (token) => {
  if (!exports.isAdmin(token)) {
    throw new Error("You are not authorized.");
  }
};

/**
 * Creates an express middleware that validates auth status.
 *
 * @param {string | undefined} requiredClaim Required claim to check for on the token
 *
 * @return {function(req, res, next)} express middleware
 */
function createAuthMiddleware(requiredClaim) {
  return async (req, res, next) => {
    logger.log("Check if request is authorized with Firebase ID token");

    if (
      (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) &&
      !(req.cookies && req.cookies.__session)
    ) {
      logger.error(
        "No Firebase ID token was passed as a Bearer token in the Authorization header.",
        "Make sure you authorize your request by providing the following HTTP header:",
        "Authorization: Bearer <Firebase ID Token>",
        "or by passing a __session cookie.",
      );
      res.status(403).send("Unauthorized");
      return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      logger.log("Found Authorization header");
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies) {
      logger.log("Found __session cookie");
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
    } else {
      // No cookie
      res.status(403).send("Unauthorized");
      return;
    }

    try {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      logger.log("ID Token correctly decoded", decodedIdToken);
      req.idToken = decodedIdToken;
    } catch (error) {
      logger.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
      return;
    }

    if (requiredClaim && !req.idToken[requiredClaim]) {
      logger.log(`Required claim ${requiredClaim} was not found on ID token.`);
      res.status(403).send("Unauthorized");
      return;
    }

    next();
    return;
  };
}

exports.validateAuthenticatedMiddleware = createAuthMiddleware();
exports.validateAdminMiddleware = createAuthMiddleware("admin");
