const Task = require("../models/Task");
const notificationService = require("../services/notificationService");

const createTask = async (data, user) => {
  const task = new Task({
    title: data.title,
    description: data.description,
    project: data.projectId,
    assignedTo: data.assignedTo,
    createdBy: user._id,
  });

  await task.save();

  await notificationService.createNotification({
    userId: data.assignedTo,
    type: "TASK_ASSIGNED",
    message: `You were assigned a task: ${task.title}`,
  });

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

  await notificationService.createNotification({
    userId: task.assignedTo,
    type: "STATUS_UPDATED",
    message: `Task "${task.title}" status changed to ${status}`,
  });

  return task;
};

const assignTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not exist");
  }

  task.assignedTo = userId;
  await task.save();

  await notificationService.createNotification({
    userId: userId,
    type: "TASK_ASSIGNED",
    message: `You were assigned a task: ${task.title}`,
  });

  return task;
};

const getTaskBoard = async (projectId) => {
  const tasks = await Task.find({ project: projectId });

  const board = {
    todo: [],
    inProgress: [],
    done: [],
  };

  tasks.forEach((task) => {
    if (task.status === "TODO") {
      board.todo.push(task);
    } else if (task.status === "IN_PROGRESS") {
      board.inProgress.push(task);
    } else if (task.status === "DONE") {
      board.done.push(task);
    }
  });

  return board;
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  assignTask,
  getTaskBoard,
};
