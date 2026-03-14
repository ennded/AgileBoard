const userService = require("../services/userService");

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
  },
};
