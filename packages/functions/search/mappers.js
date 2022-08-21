const { mapPhoneNumber, mapTimestamp } = require("../lib/typesense/handler");

/**
 * Maps a Firestore client record to a search record.
 *
 * @param {DocumentSnapshot} clientSnapshot Document snapshot of client document
 * @return {object} Search record data.
 */
function mapClientSnapshot(clientSnapshot) {
  const phoneNumberFields = ["mobilePhone", "homePhone", "homePhoneNew", "workPhone", "otherPhone"];

  // Collect all of the possible phone number fields, filter out any that aren't valid strings then
  // build a final flat array of the phone numbers in different formats.
  const phoneNumbers = phoneNumberFields
    .map((field) => clientSnapshot.get(field))
    .filter((number) => number)
    .flatMap((number) => mapPhoneNumber(number));

  return {
    id: clientSnapshot.id,
    timestamp: mapTimestamp(clientSnapshot.data().timestamp),
    name: clientSnapshot.data().displayName,
    phone_number: phoneNumbers,
    mobile_phone_number: clientSnapshot.data().mobilePhone ?? null,
    home_phone_number:
      clientSnapshot.data().homePhone ?? clientSnapshot.data().homePhoneNew ?? null,
    work_phone_number: clientSnapshot.data().workPhone ?? null,
    other_phone_number: clientSnapshot.data().otherPhone ?? null,
  };
}

/**
 *  Maps a firestore message record to a search record.
 *
 * @param {DocumentSnapshot} messageSnapshot Document snapshot of message document
 * @param {DocumentSnapshot} conversationSnapshot Document snapshot of conversation message belongs to
 * @return {object} Search record data
 */
function mapMessageSnapshot(messageSnapshot, conversationSnapshot) {
  return {
    id: messageSnapshot.id,
    timestamp: mapTimestamp(messageSnapshot.data().timestamp),
    body: messageSnapshot.data().body,
    labels: conversationSnapshot.data().labels || [],
    "client.name": conversationSnapshot.data().client.name || "",
    "client.phone_number": mapPhoneNumber(conversationSnapshot.data().client.phoneNumber),
    conversationId: conversationSnapshot.id,
  };
}

exports.mapClientSnapshot = mapClientSnapshot;
exports.mapMessageSnapshot = mapMessageSnapshot;
