const got = require("got");
const { loadAccessToken } = require("./oauth");
const { AuthenticationError } = require("../errors");
const FormData = require("form-data");
const config = require("../config");

const MAX_PAGES = 10;

/**
 * Client to access GoTo Connect APIs
 */
class Client {
  /**
   * Creates a new client with an authenticated got instance.
   *
   * @param {got} got got instance
   */
  constructor(got) {
    this.got = got;
  }

  /**
   * Retrieves the GoTo account key associated with the authenticated user.
   *
   * @return {Promise<string>} The account key
   */
  async getAccount() {
    const { accountKey } = await this.got.get(`${config.gotoConnect.adminApiBaseUrl}/me`).json();
    return accountKey;
  }

  /**
   * Returns array of users associated with the account.
   *
   * @param {string} accountKey GoTo Connect account key
   * @return {Promise<object[]>} List of users
   */
  async listUsers(accountKey) {
    return this.fetchPaginated(`${config.gotoConnect.connectApiBaseUrl}/users/v1/users`, {
      accountKey,
    });
  }

  /**
   * Creates a webhook channel for subscriptions.
   *
   * @param {string} channelNickname The name of the channel
   * @param {string} webhookSecret Secret key to validate webhook origin
   * @return {Promise<string>} Created channel id
   */
  async createChannel(channelNickname, webhookSecret) {
    const { channelId } = await this.got
      .post(
        `${config.gotoConnect.connectApiBaseUrl}/notification-channel/v1/channels/${channelNickname}`,
        {
          json: {
            channelType: "Webhook",
            webhookChannelData: {
              webhook: {
                url: `${config.baseUrl}/webhooks/subscription`,
              },
              signature: {
                sharedSecret: webhookSecret,
              },
            },
            channelLifetime: config.emulator ? 600 : 604800, // 7 days
          },
        },
      )
      .json();

    return channelId;
  }

  /**
   * Verifies the channel still exists.
   *
   * @param {string} channelNickname The name of the channel
   * @param {string} channelId The GoTo Connect ID of the channel
   *
   * @return {Promise<boolean>} true if channel was found, false if a 404 was returned.
   */
  async doesChannelExist(channelNickname, channelId) {
    return this.doesUrlExist(
      `${config.gotoConnect.connectApiBaseUrl}/notification-channel/v1/channels/${channelNickname}/${channelId}`,
    );
  }

  /**
   * Refreshes the channel lifetime to keep it alive.
   *
   * @param {string} channelNickname The name of the channel
   * @param {string} channelId The channel id
   *
   * @return {Promise<void>}
   */
  async updateChannelLifetime(channelNickname, channelId) {
    await this.got.put(
      `${config.gotoConnect.connectApiBaseUrl}/notification-channel/v1/channels/${channelNickname}/${channelId}/channel-lifetime`,
    );
  }

  /**
   * Creates a new realtime session for a notification channel.
   *
   * @param {string} channelId The notification channel id
   *
   * @return {Promise<{
   *  sessionUrl: string,
   *  sessionSubscriptionsUrl: string
   * }>} An object containing the session URL and subscriptions URL
   */
  async createSession(channelId) {
    const { self, subscriptions } = await this.got
      .post(`${config.gotoConnect.connectRealtimeApiBaseUrl}/v2/session`, {
        json: {
          channelId,
        },
      })
      .json();

    return {
      sessionUrl: self,
      subscriptionsUrl: subscriptions,
    };
  }

  /**
   * Subscribes webhook session to each line.
   *
   * @param {string} sessionSubscriptionsUrl Session subscription URL
   * @param {[{
   *   id: string,
   *   name: string,
   *   organization: {
   *     id: string
   *   }
   * }]} lines Array of lines to subscribe
   */
  async subscribeLines(sessionSubscriptionsUrl, lines) {
    const linesRequest = lines.map((line) => {
      const lineName = line.name.replace(" ", "_").toLowerCase();
      return {
        id: lineName,
        type: "dialog",
        entity: {
          id: line.id,
          type: "line.v2",
          account: line.organization?.id,
        },
      };
    });

    return this.got
      .post(sessionSubscriptionsUrl, {
        json: linesRequest,
      })
      .json();
  }

  /**
   * Returns a list of Messaging subscriptions
   *
   * @return {Promise<[object]>} List of existing subscriptions
   */
  getMessagingSubscriptions() {
    return this.fetchPaginated(`${config.gotoConnect.messagingApiBaseUrl}/v1/subscriptions`);
  }

  /**
   * Creates a Messaging subscription for a phone number.
   *
   * @param {string} channelId Notification channel id
   * @param {string} ownerPhoneNumber E164 phone number
   * @param {[string]} eventTypes List of event types to subscribe to
   *
   * @return {Promise<object>}
   */
  createMessagingSubscription(channelId, ownerPhoneNumber, eventTypes) {
    return this.got
      .post(`${config.gotoConnect.messagingApiBaseUrl}/v1/subscriptions`, {
        json: {
          ownerPhoneNumber,
          eventTypes,
          channelId,
        },
      })
      .json();
  }

  /**
   * Sends an SMS message to a customer.
   *
   * @param {string} ownerPhoneNumber E164 phone number to send message from
   * @param {string} clientPhoneNumber E164 phone number to send message to
   * @param {string} body Message body to send to customer.
   * @param {object[]} files List of storage files to send.
   *
   * @return {Promise<object>}
   */
  sendMessage(ownerPhoneNumber, clientPhoneNumber, body, files) {
    const form = new FormData();
    form.append("ownerPhoneNumber", ownerPhoneNumber);
    form.append("contactPhoneNumbers", clientPhoneNumber);
    form.append("body", body || "");

    if (files && files.length) {
      for (const file of files) {
        form.append("file", null, {
          filename: file.filename,
          contentType: file.contentType,
          knownLength: file.size,
        });
      }
    }

    return this.got
      .post(`${config.gotoConnect.messagingApiBaseUrl}/v1/messages`, { body: form })
      .json();
  }

  /**
   * Verifies the URL does not return a 404.
   *
   * @param {string} url The URL to check
   *
   * @return {boolean} true if session was found, false if a 404 was returned.
   */
  async doesUrlExist(url) {
    const response = await this.got.get(url, {
      followRedirect: true,
      throwHttpErrors: false,
      retry: {
        limit: 3,
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 400) {
      return true;
    } else if (response.statusCode === 404) {
      return false;
    } else {
      throw new Error(`Error checking if URL ${url} exists: ${response.statusMessage}`);
    }
  }

  /**
   * Iterates through a paginated list and collects all results into single array.
   *
   * @param {string} url URL containing paginated list
   * @param {object} queryParameters Base query parameters to pass to URL
   * @return {object[]} Full result set of paginated list
   */
  async fetchPaginated(url, queryParameters) {
    let done = false;
    let i = 0;
    const list = [];
    let pageMarker;

    while (!done && i < MAX_PAGES) {
      const pageResult = await this.got
        .get(url, {
          searchParams: {
            ...queryParameters,
            pageMarker,
          },
        })
        .json();

      list.push(...pageResult.items);
      pageMarker = pageResult?.nextPageMarker;
      console.log(pageMarker);
      done = !pageMarker;
      i++;
    }

    return list;
  }
}

/**
 * Loads credentials and constructs an authenticated GoTo Connect client.
 *
 * @return {Client} An authenticated client instance
 */
async function createClient() {
  const accessToken = await loadAccessToken();

  if (!accessToken) {
    throw new AuthenticationError(
      "GoTo authentication failed. Please re-connect to GoTo Connect in the Settings.",
    );
  }

  const gotInstance = got.extend({
    responseType: "json",
    headers: {
      Authorization: `Bearer ${accessToken.token.access_token}`,
    },
    hooks: {
      beforeRequest: [
        (options) => {
          console.log(JSON.stringify(options));
        },
      ],
      beforeError: [
        (error) => {
          const { response } = error;
          if (response && response.body) {
            error.name = "Error";
            error.message = `${response.body.message} (${response.statusCode})`;
          }
          return error;
        },
      ],
    },
  });

  return new Client(gotInstance);
}

exports.createClient = createClient;
