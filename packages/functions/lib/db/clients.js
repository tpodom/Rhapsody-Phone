const { db } = require("../init");

/**
 * Looks up client by E.164 formatted phone number
 *
 * @param {string} phoneNumber E.164 formatted phone number
 * @return {Promise<object | null>} Promise that resolves to a matching client or null if not found.
 */
async function findClientByPhone(phoneNumber) {
  // Search through to see if we find a match on any of the possible phone fields. Firestore
  // doesn't have a way to query on multiple fields with OR logic.
  const phoneFields = ["mobilePhone", "homePhone", "homePhoneNew", "workPhone", "otherPhone"];
  for (const field of phoneFields) {
    const result = await getClientsCollectionRef().where(field, "==", phoneNumber).limit(1).get();
    if (!result.empty) {
      return result.docs[0].data();
    }
  }
  return null;
}

/**
 * Retrieves a single client.
 *
 * @param {string} clientId Client ID
 * @return {Promise<object | null>} Client data if found or null if it does not exist
 */
async function getClient(clientId) {
  const clientRef = await getClientsCollectionRef().doc(clientId).get();

  if (clientRef.exists) {
    return clientRef;
  }
  return null;
}

/**
 * Adds or updates a client
 *
 * @param {object} client Rhapsody client data
 * @return {Promise<void>}
 */
async function upsertClient(client) {
  const { patients, ...clientData } = client;
  const clientRef = getClientsCollectionRef().doc(client.id);
  await clientRef.set(clientData, { merge: true });
  await updatePets(clientRef, patients);
  return clientRef.get();
}

/**
 * Retrieves a single pet for a client.
 *
 * @param {string} clientId Rhapsody client ID that is owner of pet
 * @param {string} petId Rhapsody patient ID
 * @return {Promise<object | null>} Pet record or null if it does not exist
 */
async function getPet(clientId, petId) {
  const clientRef = getClientsCollectionRef().doc(clientId);
  const petRef = await getClientPetsCollectionRef(clientRef).doc(petId).get();

  if (petRef.exists) {
    return petRef;
  }
  return null;
}

/**
 * Adds or updates pet information.
 *
 * @param {string} clientId Rhapsody client ID
 * @param {object} pet Pet data
 * @return {Promise<object>} Updated pet
 */
async function upsertPet(clientId, pet) {
  const clientRef = getClientsCollectionRef().doc(clientId);
  const petRef = getClientPetsCollectionRef(clientRef).doc(pet.id);
  await petRef.set(convertDates(pet, "dateOfBirth"), { merge: true });
  return petRef.get();
}

/**
 * Adds or updates appointment information.
 *
 * @param {string} clientId Rhapsody client ID
 * @param {object} appointment Appointment data
 * @return {Promise<object>} Updated appointment
 */
async function upsertAppointment(clientId, appointment) {
  const clientRef = getClientsCollectionRef().doc(clientId);
  const appointmentRef = getClientAppointmentsCollectionRef(clientRef).doc(appointment.id);

  const data = convertDates(appointment, "scheduledStartDatetime", "scheduledEndDatetime");
  await appointmentRef.set(data, { merge: true });
  return appointmentRef.get();
}

/**
 * Updates client's pets list.
 *
 * @param {DocumentRef} clientRef Client document reference
 * @param {object[]} pets List of client's pets
 * @return {Promise<void>}
 */
async function updatePets(clientRef, pets) {
  const batch = db.batch();
  const petsCollectionRef = getClientPetsCollectionRef(clientRef);

  for (const pet of pets) {
    const petRef = petsCollectionRef.doc(pet.id);

    if (petRef.deleted) {
      batch.delete(petRef);
    } else {
      batch.set(petRef, convertDates(pet, "dateOfBirth"));
    }
  }

  await batch.commit();
}

/**
 * Creates reference to clients collection.
 *
 * @return {CollectionRef} Clients collection reference
 */
function getClientsCollectionRef() {
  return db.collection("clients");
}

/**
 * Creates reference to client pets collection.
 *
 * @param {DocumentRef} clientRef Client document reference
 * @return {CollectionRef} Client pets collection reference
 */
function getClientPetsCollectionRef(clientRef) {
  return clientRef.collection("pets");
}

/**
 * Creates reference to client appointments collection.
 *
 * @param {DocumentRef} clientRef Client document reference
 * @return {CollectionRef} Client appointments collection reference
 */
function getClientAppointmentsCollectionRef(clientRef) {
  return clientRef.collection("appointments");
}

/**
 * Converts fields on object from ISO-8601 to Date
 *
 * @param {object} obj Object containing fields to convert
 * @return {object} Modified object with dates converted to Date
 */
function convertDates(obj, ...fields) {
  const data = { ...obj };

  for (const field of fields) {
    data[field] = new Date(obj[field]);
  }

  return data;
}

exports.findClientByPhone = findClientByPhone;
exports.getClient = getClient;
exports.upsertClient = upsertClient;
exports.getPet = getPet;
exports.upsertPet = upsertPet;
exports.upsertAppointment = upsertAppointment;
