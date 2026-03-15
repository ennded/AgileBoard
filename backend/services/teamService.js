const Team = require("../models/Team");

const createTeam = async (data, user) => {
  const team = new Team({
    name: data.name,
    owner: user._id,
    members: [user._id],
  });

  await team.save();
  return team;
};

module.exports = { createTeam };
