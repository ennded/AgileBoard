const userService = require("../services/userService");
const authService = require("../services/authService");
const requireAuth = require("../utils/requireAuth");
const teamService = require("../services/teamService");

module.exports = {
  Query: {
    users: async () => {
      return userService.getUser();
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
  },
};
