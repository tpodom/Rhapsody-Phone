const { gql } = require("graphql-tag");

const schema = gql`
  enum Gender {
    MALE
    NEUTERED
    FEMALE
    SPAYED
  }

  type Client {
    id: ID!
    name: String!
    pets: [Pet!]!
  }

  type Pet {
    id: ID!
    name: String!
    gender: Gender!
  }

  type Call {
    id: ID!
    client: Client
    phoneNumber: String!
    callerId: String!
    active: Boolean!
  }

  type Query {
    calls: [Call!]!
  }
`;

module.exports = schema;
