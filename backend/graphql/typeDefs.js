const { gql } = require("apollo-server-express");
module.exports = gql`
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
  }
  type User {
    id: ID!
    name: String!
    email: String!
    tasks: [Task]
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    status: TaskStatus
    project: Project
    assignedTo: User
  }

  type Query {
    users: [User]
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Team {
    id: ID!
    name: String!
  }
  type Project {
    id: ID!
    name: String!
    team: Team
    createdBy: User
  }

  type Mutation {
    createUser(name: String!, email: String!): User
  }

  extend type Query {
    projects(teamId: ID!): [Project]
    tasks(projectId: ID!): [Task]
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
  }

  extend type Mutation {
    createTeam(name: String!): Team
  }

  extend type Mutation {
    createProject(name: String!, teamId: ID!): Project
  }

  extend type Mutation {
    createTask(
      title: String!
      description: String!
      projectId: ID!
      assignedTo: ID!
    ): Task
    updateTaskStatus(
      taskId: ID!
      status: TaskStatus!
    ): Task
  }

  extend type Mutation {
    assignTask(taskId: ID!, userId: ID!): Task
  }
`;
