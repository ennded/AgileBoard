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

  type Mutation {
    createUser(name: String!, email: String!): User
    createTask(title: String!, userId: ID!): Task
  }
`;
