const { gql } = require("apollo-server-express");
module.exports = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    tasks: [Task]
  }

  type Task {
    id: ID!
    title: String!
    completed: Boolean
    user: User
  }

  type Query {
    users: [User]
    tasks: [Task]
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Team {
    id: ID!
    name: String!
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    createTask(title: String!, userId: ID!): Task
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
  }

  extend type Mutation {
    createTeam(name: String!): Team
  }
`;
