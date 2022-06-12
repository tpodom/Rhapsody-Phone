/**
 * An authentication error occurred
 */
class AuthenticationError extends Error {
  /**
   * Creates a new AuthenticationError
   *
   * @param {string} message Error message
   */
  constructor(message) {
    super(message);
  }
}

exports.AuthenticationError = AuthenticationError;
