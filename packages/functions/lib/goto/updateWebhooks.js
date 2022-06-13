const { logger } = require("../init");
const { createClient } = require("./client");
const { AuthenticationError } = require("../errors");
const settings = require("../db/gotoSettings");
const config = require("../config");

const CHANNEL_NAME = "vet-connect";

/**
 * Subscribes to GoTo Connect webhooks (calls and SMS).
 */
async function updateWebhooks() {
  const gotoSettings = await settings.getSettings();

  if (!gotoSettings?.accountKey) {
    logger.info("Skipping update, GoTo Connect is not configured.");
    return;
  }

  let client;
  try {
    client = await createClient();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      await settings.removeSettings();
    }

    throw error;
  }

  const channelId = await prepareChannel(client, gotoSettings);
  const subscriptionsUrl = await prepareSessionForsubscriptions(client, gotoSettings, channelId);
  await subscribeLines(client, gotoSettings, subscriptionsUrl);
  await subscribeSMS(client, channelId);
  await settings.updateLastSyncTime(new Date());
}

/**
 * Ensures a GoTo Connect channel has been created and its lifetime is refreshed.
 *
 * @param {client} client GoTo Connect client
 * @param {object} gotoSettings GoTo Connect settings doc
 *
 * @return {string} GoTo Connect channel ID
 */
async function prepareChannel(client, gotoSettings) {
  let channelId = gotoSettings?.channelId;

  // Verify channel still exists
  if (channelId) {
    const channelExists = await client.doesChannelExist(CHANNEL_NAME, channelId);

    if (!channelExists) {
      logger.info(`Channel ${CHANNEL_NAME} with id ${channelId} no longer exists.`);
      await settings.updateChannelId(null);
      channelId = null;
    }
  }

  // If so, refresh it. If not, create a channel.
  if (channelId) {
    logger.info(`Updating the lifetime for channel ${CHANNEL_NAME} with id ${channelId}`);

    await client.updateChannelLifetime(CHANNEL_NAME, gotoSettings?.channelId);
  } else {
    logger.info(`Creating new channel ${CHANNEL_NAME}`);
    channelId = await client.createChannel(CHANNEL_NAME, process.env.GOTO_WEBHOOK_SECRET);

    if (!channelId) {
      throw new Error(`Error creating new channel ${CHANNEL_NAME}, no channel id returned.`);
    }

    logger.info(`Created new channel ${CHANNEL_NAME} with id ${channelId}`);
    await settings.updateChannelId(channelId);
  }

  return channelId;
}

/**
 * Ensures a GoTo Connect session has been created
 *
 * @param {client} client GoTo Connect client
 * @param {object} gotoSettings GoTo Connect settings doc
 * @param {string} channelId GoTo Connect channel ID
 *
 * @return {string} GoTo Connect session subscriptions URL
 */
async function prepareSessionForsubscriptions(client, gotoSettings, channelId) {
  let sessionUrl = gotoSettings?.sessionUrl;
  let subscriptionsUrl = gotoSettings?.subscriptionsUrl;

  // Verify session still exists
  if (sessionUrl) {
    const sessionExists = await client.doesUrlExist(sessionUrl);

    if (!sessionExists) {
      logger.info(`Session ${sessionUrl} no longer exists.`);

      await settings.updateSessionUrls(null, null);
      sessionUrl = null;
    }
  }

  // If no session for the channel, create one
  if (!sessionUrl) {
    logger.info(`Creating new session for channel ${channelId}`);
    const urls = await client.createSession(channelId);

    if (!urls?.sessionUrl) {
      throw new Error(`Error creating new session for channel ${channelId}.`);
    }

    logger.info(`Created new session ${urls.sessionUrl}`);
    await settings.updateSessionUrls(urls.sessionUrl, urls.subscriptionsUrl);
    subscriptionsUrl = urls.subscriptionsUrl;
  }

  return subscriptionsUrl;
}

/**
 * Ensures that all of the lines on the account are subscribed to our webhook.
 *
 * @param {Client} client GoTo Connect client
 * @param {object} gotoSettings GoTo Connect settings
 * @param {string} subscriptionsUrl GoTo Connect session subscriptions URL
 */
async function subscribeLines(client, gotoSettings, subscriptionsUrl) {
  const users = await client.listUsers(gotoSettings?.accountKey);
  const lines = users.map((user) => user.lines).flat();
  const subscriptionResult = await client.subscribeLines(subscriptionsUrl, lines);
  logger.info("Call subscription results", subscriptionResult, { structuredData: true });
}

/**
 * Subscribes to SMS messaging for the main phone number.
 *
 * @param {Client} client GoTo Connect client
 * @param {string} channelId Notification channel id
 */
async function subscribeSMS(client, channelId) {
  const subscriptions = await client.getMessagingSubscriptions();
  const subscribed = subscriptions.some((sub) => sub.ownerPhoneNumber === config.mainPhoneNumber);

  if (subscribed) {
    logger.info("SMS subscription exists, skipping.");
    return;
  }

  const result = await client.createMessagingSubscription(channelId, config.mainPhoneNumber, [
    "INCOMING_MESSAGE",
    "OUTGOING_MESSAGE",
  ]);
  logger.info("SMS subscription results", result);
}

exports.updateWebhooks = updateWebhooks;
