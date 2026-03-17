const Comment = require("../models/Comment");

const createComment = async (data, user) => {
  const comment = new Comment({
    message: data.message,
    task: data.taskId,
    user: user._id,
  });

  await comment.save();
  return comment;
};

const getComments = async (taskId) => {
  return Comment.find({ task: taskId }).populate("user").populate("task");
};

module.exports = { createComment, getComments };
