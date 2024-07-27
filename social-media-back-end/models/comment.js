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
  value: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    default: Date.now(),
  },
});

function commentValidate(value, res) {
  const { error } = joiCommentSchema.validate(value);
  if (error) res.status(400).send(error.details[0].message);
  return error === undefined;
}

exports.commentSchema = commentSchema;
exports.commentValidate = commentValidate;
