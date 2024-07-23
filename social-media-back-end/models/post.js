const mongoose = require("mongoose");
const Joi = require("joi");
const { commentSchema } = require("./comment");
const { likeSchema } = require("./like");

const privileged_put_postSchema = Joi.object({
  caption: Joi.string().required(),
  image: Joi.any(),
  like: Joi.boolean(),
});
const unprivileged_put_postSchema = Joi.object({
  like: Joi.boolean(),
  comment: Joi.string().min(1).max(255),
});

const postSchema = Joi.object({
  image: Joi.any(),
  caption: Joi.string().required(),
  publishDate: Joi.date(),
});

const postModelSchema = new mongoose.Schema({
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

const Post = mongoose.model("Post", postModelSchema);

exports.Post = Post;
exports.postSchema = postSchema;
exports.postModelSchema = postModelSchema;
exports.privileged_put_postSchema = privileged_put_postSchema;
exports.unprivileged_put_postSchema = unprivileged_put_postSchema;
