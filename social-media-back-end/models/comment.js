const mongoose = require("mongoose");
const Joi = require("joi");

const joiCommentSchema = Joi.object({
  comment: Joi.string().required().label("Comment Value"),
  parent: Joi.objectId().label("Comment Parent ID"),
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
  },
  parent: {
    type: mongoose.Schema.ObjectId,
  },
  children: [{ type: mongoose.Schema.ObjectId, required: true, default: [] }],
});

function commentValidate(value, res) {
  const { error } = joiCommentSchema.validate(value);
  if (error) res.status(400).send(error.details[0].message);
  return error === undefined;
}

function getComment(post, commentID) {
  if (!post || !commentID) return;
  return post.comments?.find((c) => c._id.toString() === commentID.toString());
}

exports.commentSchema = commentSchema;
exports.commentValidate = commentValidate;
exports.getComment = getComment;
