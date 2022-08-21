const { createClient } = require("./client");
const {
  getSettingsData,
  updateBusiness,
  updateLastSyncTime,
} = require("../../lib/db/rhapsodySettings");
const clientsStore = require("../db/clients");
const { logger } = require("../init");

const IGNORED_APPOINTMENT_TYPES = ["OTC Sale"];

/**
 * Performs bi-directional sync with Rhapsody
 *
 * @param {string} apiKey Rhapsody API Key
 * @return {Promise<void>}
 */
exports.sync = async (apiKey) => {
  const client = createClient(apiKey);
  let settings = await getSettingsData();

  try {
    if (!settings.business) {
      const business = await client.getBusiness();
      settings = await updateBusiness(business);
    }

    const lastSyncTime = new Date();
    await syncClients(client, settings);
    await syncAppointments(client, settings);
    await syncMessages(client, settings);
    await syncCalls(client, settings);

    await updateLastSyncTime(lastSyncTime);
  } catch (error) {
    logger.error("Rhapsody sync failed", error);
  }
};

/**
 * Syncs clients from Rhapsody to local store.
 *
 * @param {Client} client Rhapsody API client
 * @param {object} settings Rhapsody settings
 */
async function syncClients(client, settings) {
  const clients = await client.findUpdatedClients(
    settings.business.id,
    settings.lastSyncTime ? settings.lastSyncTime.toDate() : undefined,
  );

  for (const clientRecord of clients) {
    try {
      logger.debug(
        `Syncing client ${clientRecord.id} - ${clientRecord.lastName}, ${clientRecord.firstName}`,
      );

      clientRecord.displayName = [
        (clientRecord.firstName || "").trim(),
        (clientRecord.lastName || "").trim(),
      ].join(" ");

      await clientsStore.upsertClient({ ...clientRecord, timestamp: new Date() });
    } catch (error) {
      logger.error(
        `Failed to sync client ${clientRecord.id} - ${clientRecord.lastName}, ${clientRecord.firstName}: ${error.message}`,
      );
    }
  }
}

/**
 * Syncs appointments from Rhapsody to local store.
 *
 * @param {Client} client Rhapsody API client
 * @param {object} settings Rhapsody settings
 */
async function syncAppointments(client, settings) {
  const appointments = await client.findUpdatedAppointments(
    settings.business.id,
    settings.lastSyncTime ? settings.lastSyncTime.toDate() : undefined,
  );

  for (const appointment of appointments) {
    try {
      if (IGNORED_APPOINTMENT_TYPES.includes(appointment.type?.name)) {
        logger.debug(
          `Skipping ${appointment.type.name} appointment for client ${appointment.clientId} at ${appointment.scheduledStartDatetime}`,
        );
        continue;
      }

      logger.debug(
        `Found appointment ${appointment.id} for client ${appointment.clientId} at ${appointment.scheduledStartDatetime}`,
      );

      let clientRecord = await clientsStore.getClient(appointment.clientId);

      if (!clientRecord) {
        logger.info(`Client ${appointment.clientId} was not found, syncing them now.`);
        clientRecord = await client.getClient(appointment.clientId);
        clientRecord = await clientsStore
          .upsertClient({ ...clientRecord, timestamp: new Date() })
          .data();
      }

      let petRecord = await clientsStore.getPet(appointment.clientId, appointment.patientId);

      if (!petRecord) {
        logger.info(
          `Pet ${appointment.patientId} for client ${appointment.clientId} was not found, syncing them now.`,
        );
        petRecord = await client.getPet(appointment.patientId);
        petRecord = await clientsStore.upsertPet(appointment.clientId, petRecord).data();
      }

      await clientsStore.upsertClient({ id: appointment.clientId, timestamp: new Date() });
      await clientsStore.upsertAppointment(appointment.clientId, appointment);
    } catch (error) {
      logger.error(
        `Failed to sync appointment ${appointment.id} - ${appointment.scheduledStartDatetime}: ${error.message}`,
      );
    }
  }
}

/**
 * Syncs messages to Rhapsody
 *
 * @param {Client} client Rhapsody API client
 * @param {Date} lastSyncTime Last sync time with Rhapsody
 */
async function syncMessages(client, lastSyncTime) {}

/**
 * Syncs calls to Rhapsody
 *
 * @param {Client} client Rhapsody API client
 * @param {object} settings Rhapsody settings
 */
async function syncCalls(client, settings) {}
