const Team = require("../models/Team");

const getTeams = async (user) => {
  return Team.find({ members: user._id });
};

const createTeam = async (data, user) => {
  const team = new Team({
    name: data.name,
    owner: user._id,
    members: [user._id],
  });

  await team.save();
  return team;
};

module.exports = { getTeams, createTeam };
