const mongoose = require("mongoose");
const Joi = require("joi");
const { commentSchema } = require("./comment");
const { likeSchema } = require("./like");

const postJoiSchema = Joi.object({
  image: Joi.any(),
  caption: Joi.string().allow(""),
  publishDate: Joi.date(),
  like: Joi.boolean(),
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  caption: String,
  publishDate: Date,
  imagePath: String,
  likes: [likeSchema],
  comments: [commentSchema],
});

const Post = mongoose.model("Post", postSchema);

function validatePost(value, res) {
  const { error } = postJoiSchema.validate(value);
  if (error) res.status(400).send(error.details[0].message);
  return error === undefined;
}

exports.Post = Post;
exports.postSchema = postSchema;
exports.validatePost = validatePost;
