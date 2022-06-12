const { db } = require("../init");

/**
 * Looks up client by E.164 formatted phone number
 *
 * @param {string} phoneNumber E.164 formatted phone number
 * @return {Promise<object | null>} Promise that resolves to a matching client or null if not found.
 */
exports.findClientByPhone = async (phoneNumber) => {
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
};

/**
 * Retrieves a single client.
 *
 * @param {string} clientId Client ID
 * @return {Promise<object | null>} Client data if found or null if it does not exist
 */
exports.getClient = async (clientId) => {
  const clientRef = await getClientsCollectionRef().doc(clientId).get();

  if (clientRef.exists) {
    return clientRef.data();
  }
  return null;
};

/**
 * Adds or updates a client
 *
 * @param {object} client Rhapsody client data
 * @return {Promise<void>}
 */
exports.upsertClient = async (client) => {
  const { patients, ...clientData } = client;
  const clientRef = getClientsCollectionRef().doc(client.id);
  await clientRef.set(clientData, { merge: true });
  await updatePets(clientRef, patients);
};

/**
 * Retrieves a single pet for a client.
 *
 * @param {string} clientId Rhapsody client ID that is owner of pet
 * @param {string} petId Rhapsody patient ID
 * @return {Promise<object | null>} Pet record or null if it does not exist
 */
exports.getPet = async (clientId, petId) => {
  const clientRef = getClientsCollectionRef().doc(clientId);
  const petRef = await getClientPetsCollectionRef(clientRef).doc(petId).get();

  if (petRef.exists) {
    return petRef.data();
  }
  return null;
};

/**
 * Adds or updates pet information.
 *
 * @param {string} clientId Rhapsody client ID
 * @param {object} pet Pet data
 * @return {Promise<object>} Updated pet
 */
exports.upsertPet = async (clientId, pet) => {
  const clientRef = getClientsCollectionRef().doc(clientId);
  const petRef = getClientPetsCollectionRef(clientRef).doc(pet.id);
  return petRef.set(convertDates(pet, "dateOfBirth"), { merge: true });
};

/**
 * Adds or updates appointment information.
 *
 * @param {string} clientId Rhapsody client ID
 * @param {object} appointment Appointment data
 * @return {Promise<object>} Updated appointment
 */
exports.upsertAppointment = async (clientId, appointment) => {
  const clientRef = getClientsCollectionRef().doc(clientId);
  const appointmentRef = getClientAppointmentsCollectionRef(clientRef).doc(appointment.id);

  const data = convertDates(appointment, "scheduledStartDatetime", "scheduledEndDatetime");
  return appointmentRef.set(data, { merge: true });
};

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
