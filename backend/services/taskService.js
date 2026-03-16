const Task = require("../models/Task");

const createTask = async (data, user) => {
  const task = new Task({
    title: data.title,
    description: data.description,
    project: data.projectId,
    assignedTo: data.assignedTo,
    createdBy: user._id,
  });

  await task.save();

  return task;
};

const getTasks = async (projectId) => {
  return Task.find({
    project: projectId,
  });
};

const updateTaskStatus = async (taskId, status) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task Not Found");
  }
  task.status = status;

  await task.save();
  return task;
};

module.exports = { createTask, getTasks, updateTaskStatus };
