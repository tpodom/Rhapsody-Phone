const { logger } = require("./init");

const { PhoneNumberFormat, PhoneNumberUtil } = require("google-libphonenumber");
const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Attempts to parse and normalize a phone number to E.164 format.
 *
 * @param {string} number Phone number
 * @return {string} The E.164 normalized number or null if it couldn't be parsed.
 */
function normalizePhoneNumber(number) {
  return formatPhoneNumber(number, PhoneNumberFormat.E164);
}

/**
 * Attempts to parse and format a phone number to the desired format.
 *
 * @param {string} number Phone number
 * @param {string} format PhoneNumberFormat to use to format the number. Defaults to NATIONAL.
 * @return {string} The formatted  number or null if it couldn't be parsed.
 */
function formatPhoneNumber(number, format = PhoneNumberFormat.NATIONAL) {
  try {
    const parsedNumber = phoneUtil.parse(number, "US");
    return phoneUtil.format(parsedNumber, format);
  } catch (error) {
    logger.debug(`Failed to parse phone number ${number}`, error);
    return null;
  }
}

exports.formatPhoneNumber = formatPhoneNumber;
exports.normalizePhoneNumber = normalizePhoneNumber;
