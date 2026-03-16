const userService = require("../services/userService");
const authService = require("../services/authService");
const requireAuth = require("../utils/requireAuth");
const teamService = require("../services/teamService");
const projectService = require("../services/projectService");
const taskService = require("../services/taskService");

module.exports = {
  Query: {
    users: async () => {
      return userService.getUser();
    },
    projects: async (_, args, context) => {
      requireAuth(context.user);
      return projectService.getProject(args.teamId);
    },
    tasks: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.getTasks(args.projectId);
    },
  },

  Mutation: {
    createUser: async (__, args) => {
      return userService.createUser(args);
    },
    register: async (__, args) => {
      return authService.registerUser(args);
    },

    login: async (__, args) => {
      return authService.loginUser(args);
    },

    createTeam: async (_, args, context) => {
      requireAuth(context.user);
      return teamService.createTeam(args, context.user);
    },

    createProject: async (_, args, context) => {
      requireAuth(context.user);
      return projectService.createProject(args, context.user);
    },
    createTask: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.createTask(args, context.user);
    },
    updateTaskStatus: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.updateTaskStatus(args.taskId, args.status);
    },
  },
};
