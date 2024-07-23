const mongoose = require("mongoose");
const Joi = require("joi");

const joiCommentSchema = Joi.object({
  comment: Joi.string().required().label("Comment"),
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    default: Date.now(),
  },
});

exports.joiCommentSchema = joiCommentSchema;
exports.commentSchema = commentSchema;
