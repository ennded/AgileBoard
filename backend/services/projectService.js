const Project = require("../models/Project");

const createProject = async (data, user) => {
  const project = new Project({
    name: data.name,
    team: data.teamId,
    createdBy: user._id,
  });
  await project.save();
  return project;
};

const getProject = async (teamId) => {
  return Project.find({
    team: teamId,
  });
};

module.exports = { createProject, getProject };
