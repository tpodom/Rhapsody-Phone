const patientFields = `id
name
gender
spayedNeuteredStatus
dateOfBirth
active
deleted
deceased`;

const clientFields = `id
firstName
lastName
mobilePhone
homePhone
homePhoneNew
workPhone
otherPhone
balance
active
deleted
patients {
  ${patientFields}
}`;

exports.businessQuery = {
  selector: "business",
  query: `query business {
        business {
            id
            name
        }
    }`,
};

exports.patientQuery = {
  selector: "patient",
  query: `query patient($businessId: ID, $patientId: ID) {
    patient(businessId: $businessId, id: $patientId) {
      ${patientFields}
    }
  }`,
};

exports.clientQuery = {
  selector: "client",
  query: `query client($businessId: ID, $clientId: ID) {
    client(businessId: $businessId, id: $clientId) {
      ${clientFields}
    }
  }`,
};

exports.clientsUpdatedFromQuery = {
  selector: "clients",
  query: `query clientsUpdatedFrom($businessId: ID, $updatedFrom: DateTime, $limit: PageLimit = 10, $offset: PageOffset = 0) {
        clients(businessId: $businessId, updatedFrom: $updatedFrom, limit: $limit, offset: $offset, includeDeleted: true) {
            totalCount
            data {
                ${clientFields}
            }
        }
    }`,
};

exports.appointmentsUpdatedFromQuery = {
  selector: "appointments",
  query: `query appointmentsUpdatedFrom($businessId: ID, $updatedFrom: DateTime, $limit: PageLimit = 10, $offset: PageOffset = 0) {
          appointments(businessId: $businessId, updatedFrom: $updatedFrom, limit: $limit, offset: $offset, includeDeleted: true) {
              totalCount
              data {
                  id
                  clientId
                  patientId
                  scheduledStartDatetime
                  scheduledEndDatetime
                  confirmed
                  deleted
                  type {
                      id
                      name                      
                  }
              }
          }
      }`,
};
