const mongoose = require("mongoose");
const Joi = require("joi");
const { commentSchema } = require("./comment");
const { likeSchema } = require("./like");

const postJoiSchema = Joi.object({
  image: Joi.any(),
  caption: Joi.string().required(),
  publishDate: Joi.date(),
  like: Joi.boolean(),
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
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
