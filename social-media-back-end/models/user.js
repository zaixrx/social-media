const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
const { Post } = require("./post");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Post",
  },
  avatarPath: String,
});

userSchema.methods.generateAuthToken = async function () {
  const posts = [];
  for (let post of this.posts) {
    const p = await Post.findById(post).select("-user -__v");
    posts.push(p);
  }

  return jwt.sign(
    {
      _id: this._id,
      posts,
      username: this.username,
      email: this.email,
      avatarPath: this.avatarPath,
    },
    config.get("jwtPrivateKey"),
    { noTimestamp: true }
  );
};

const userJoiSchema = Joi.object({
  username: Joi.string().required().label("Username"),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string().required().label("Password"),
});

const userAuthJoiSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string().required().label("Password"),
});

const put_userJoiSchema = Joi.object({
  username: Joi.string().label("Username"),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .label("Email"),
  password: Joi.string().label("Password"),
  avatarPath: Joi.string().label("Avatar"),
});

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.userSchema = userSchema;
exports.userJoiSchema = userJoiSchema;
exports.userAuthJoiSchema = userAuthJoiSchema;
exports.put_userJoiSchema = put_userJoiSchema;
