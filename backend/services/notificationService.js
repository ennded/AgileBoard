const Notification = require("../models/Notification");

const createNotification = async ({ message, userId, type }) => {
  const notification = new Notification({
    user: userId,
    type,
    message,
  });

  await notification.save();
  return notification;
};

const getNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

const markAsRead = async (notificationId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error("Notification not found");
  }
  notification.read = true;
  await notification.save();
  return notification;
};

module.exports = { createNotification, getNotifications, markAsRead };
