const userService = require("../services/userService");
const authService = require("../services/authService");

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
  },
};
