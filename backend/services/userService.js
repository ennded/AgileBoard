const User = require("../models/User");

async function getUser() {
  return await User.find();
}

async function createUser(data) {
  const user = new User(data);
  return await user.save();
}

module.exports = {
  getUser,
  createUser,
};
