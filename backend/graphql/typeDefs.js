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
    description: String
    status: TaskStatus
    project: Project
    assignedTo: User
  }

  type Comment {
    id: ID!
    message: String!
    task: Task
    user: User
    createdAt: String
    updatedAt: String
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

  type Notification {
    id: ID!
    type: String
    message: String
    read: Boolean
  }

  type TaskBoard {
    id: ID!
    todo: [Task]!
    inProgress: [Task]!
    done: [Task]!
  }

  type Query {
    users: [User]
    teams: [Team]
    projects(teamId: ID!): [Project]
    tasks(projectId: ID!): [Task]
    comments(taskId: ID!): [Comment]
    notifications: [Notification]
    taskBoard(projectId: ID!): TaskBoard
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User
    register(name: String!, email: String!, password: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createTeam(name: String!): Team
    createProject(name: String!, teamId: ID!): Project
    createTask(
      title: String!
      description: String
      projectId: ID!
      assignedTo: ID
    ): Task
    updateTaskStatus(taskId: ID!, status: TaskStatus!): Task
    assignTask(taskId: ID!, userId: ID!): Task
    addComment(taskId: ID!, message: String!): Comment
    markNotificationAsRead(notificationId: ID!): Notification
  }
`;
