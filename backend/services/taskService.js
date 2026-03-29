const Task = require("../models/Task");
const notificationService = require("../services/notificationService");

const createTask = async (data, user) => {
  const { title, projectId, description, priority } = data.input;
  const task = new Task({
    title,
    description,
    priority,
    project: projectId,
    createdBy: user._id, // ← ADD — comes from context.user, never from frontend
  });

  await task.save();

  return task;
};

const updateTask = async (id, input) => {
  return Task.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true },
  );
};

const getTasks = async (projectId) => {
  return Task.find({
    project: projectId,
  });
};

const getTaskById = async (id) => {
  return Task.findById(id);
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
  updateTask,
  getTasks,
  updateTaskStatus,
  assignTask,
  getTaskBoard,
  getTaskById,
};
