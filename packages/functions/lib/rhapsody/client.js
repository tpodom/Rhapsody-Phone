const got = require("got");
const pThrottle = require("p-throttle");
const {
  businessQuery,
  clientQuery,
  clientsUpdatedFromQuery,
  patientQuery,
  appointmentsUpdatedFromQuery,
} = require("./graphql");

/**
 * Rhapsody GraphQL client
 */
class RhapsodyClient {
  /**
   * Creates a RhapsodyClient that authorizes using the specified got instance.
   *
   * @param {got} got got instance
   */
  constructor(got) {
    this.got = got;
  }

  /**
   * Retrieves the business associated with this acocount.
   *
   * @return {Promise<object>} Rhapsody business information
   */
  getBusiness() {
    return this.sendQuery(businessQuery);
  }

  /**
   * Retrieves a single client.
   *
   * @param {string} businessId Rhapsody business ID
   * @param {string} clientId Client ID
   * @return {Promise<object>} Rhapsody client information
   */
  getClient(businessId, clientId) {
    return this.sendQuery(clientQuery, { businessId, clientId });
  }

  /**
   * Retrieves a single patient.
   *
   * @param {string} businessId Rhapsody business ID
   * @param {string} patientId Patient ID
   * @return {Promise<object>} Rhapsody client information
   */
  getPatient(businessId, patientId) {
    return this.sendQuery(patientQuery, { businessId, patientId });
  }

  /**
   * Finds the clients that have been updated since the last sync time.
   *
   * @param {string} businessId Rhapsody business ID
   * @param {Date} lastSyncTime Last sync time
   *
   * @return {Promise<object[]>} Array of modified clients
   */
  findUpdatedClients(businessId, lastSyncTime) {
    return this.loadPaginatedQuery(clientsUpdatedFromQuery, {
      businessId,
      updatedFrom: lastSyncTime ? lastSyncTime.toISOString() : undefined,
    });
  }

  /**
   * Finds the appointments that have been updated since the last sync time.
   *
   * @param {string} businessId Rhapsody business ID
   * @param {Date} lastSyncTime Last sync time
   *
   * @return {Promise<object[]>} Array of modified clients
   */
  findUpdatedAppointments(businessId, lastSyncTime) {
    return this.loadPaginatedQuery(appointmentsUpdatedFromQuery, {
      businessId,
      updatedFrom: lastSyncTime ? lastSyncTime.toISOString() : undefined,
    });
  }

  /**
   * Runs through a paginated query collected all of the results
   * @param {string} query GraphQL query
   * @param {object} variables Variable values for query
   * @param {number} limit Optional page size limit, defaults to 50
   *
   * @return {Promise<object[]>} Returns array of results
   */
  async loadPaginatedQuery(query, variables, limit = 50) {
    let offset = 0;
    let done = false;
    const results = [];

    do {
      const result = await this.sendQuery(query, {
        ...variables,
        limit: 50,
        offset,
      });

      const { totalCount, data } = result;
      results.push(...data);
      done = offset + limit >= totalCount || data.length === 0;
      offset += data.length;
    } while (!done);

    return results;
  }

  /**
   * Sends a GraphQL operation (Query or Mutation)
   *
   * @param {string} query Query to send
   * @param {object} variables Operation variable values
   *
   * @return {Promise<object>} Returns resulting JSON response object
   */
  async sendQuery(query, variables) {
    const result = await this.got
      .post("https://api.rhapsody.vet/graphql", {
        json: {
          query: query.query,
          variables,
        },
      })
      .json();

    if (result.errors) {
      throw new Error(result.errors.map((err) => err.message).join("\n"));
    }

    if (query.selector && result.data[query.selector]) {
      return result.data[query.selector];
    }
    return result.data;
  }
}

/**
 * Creates a Rhapsody GraphQL client.
 *
 * @param {string} apiKey Rhapsody API key
 * @return {RhapsodyClient} Rhapsody client
 */
exports.createClient = (apiKey) => {
  const throttle = pThrottle({
    limit: 1,
    interval: 1000,
  });
  const throttled = throttle(() => {});

  const gotInstance = got.extend({
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    hooks: {
      beforeRequest: [
        (options) => {
          console.log(`Rhapsody request: ${JSON.stringify(options.json)}`);
          // rate limit calls to Rhapsody which has 1 RPS limit
          return throttled();
        },
      ],
    },
  });
  return new RhapsodyClient(gotInstance);
};
