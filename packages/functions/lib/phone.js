const { logger } = require("./init");

const { PhoneNumberFormat, PhoneNumberUtil } = require("google-libphonenumber");
const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Attempts to parse and normalize a phone number to E.164 format.
 *
 * @param {string} number Phone number
 * @return {string} The E.164 normalized number or null if it couldn't be parsed.
 */
exports.normalizePhoneNumber = (number) => {
  try {
    const parsedNumber = phoneUtil.parse(number, "US");
    return phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
  } catch (error) {
    logger.debug(`Failed to parse phone number ${number}`, error);
    return null;
  }
};
