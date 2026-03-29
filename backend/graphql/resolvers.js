const Task = require("../models/Task");
const userService = require("../services/userService");
const authService = require("../services/authService");
const requireAuth = require("../utils/requireAuth");
const teamService = require("../services/teamService");
const projectService = require("../services/projectService");
const taskService = require("../services/taskService");
const commentService = require("../services/commentService");
const notificationService = require("../services/notificationService");
const User = require("../models/User");

module.exports = {
  Query: {
    users: async () => {
      return userService.getUser();
    },
    teams: async (_, __, context) => {
      requireAuth(context.user);
      return teamService.getTeams(context.user);
    },
    projects: async (_, args, context) => {
      requireAuth(context.user);
      return projectService.getProject(args.teamId);
    },
    tasks: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.getTasks(args.projectId);
    },
    task: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.getTaskById(args.id);
    },
    comments: async (_, args, context) => {
      requireAuth(context.user);
      return commentService.getComments(args.taskId);
    },
    notifications: async (_, __, context) => {
      requireAuth(context.user);
      return notificationService.getNotifications(context.user._id);
    },
    taskBoard: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.getTaskBoard(args.projectId);
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

    createProject: async (_, args, context) => {
      requireAuth(context.user);
      return projectService.createProject(args, context.user);
    },
    createTask: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.createTask(args, context.user);
    },
    updateTask: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.updateTask(args.id, args.input);
    },
    updateTaskStatus: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.updateTaskStatus(args.taskId, args.status);
    },
    assignTask: async (_, args, context) => {
      requireAuth(context.user);
      return taskService.assignTask(args.taskId, args.userId);
    },
    addComment: async (_, args, context) => {
      requireAuth(context.user);
      return commentService.createComment(args, context.user);
    },
    markNotificationAsRead: async (_, args, context) => {
      requireAuth(context.user);
      return notificationService.markAsRead(args.notificationId);
    },
  },

  Task: {
    assignedTo: async (parent) => {
      return User.findById(parent.assignedTo);
    },
    createdBy: async (parent) => {
      return User.findById(parent.createdBy);
    },
  },

  Comment: {
    user: async (parent) => {
      return User.findById(parent.user);
    },
    task: async (parent) => {
      return Task.findById(parent.task);
    },
  },
};
