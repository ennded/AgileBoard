const userService = require("../services/userService");
const authService = require("../services/authService");
const requireAuth = require("../utils/requireAuth");
const teamService = require("../services/teamService");
const Project = require("../models/Project");
const projectService = require("../services/projectService");

module.exports = {
  Query: {
    users: async () => {
      return userService.getUser();
    },
    projects: async (_, args, context) => {
      requireAuth(context.user);
      return projectService.getProject(args.teamId);
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

    createProject: async (__, AbortSignal, context) => {
      requireAuth(context.user);
      return projectService.createProject(AbortSignal, context.user);
    },
  },
};
