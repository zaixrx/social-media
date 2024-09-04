const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const { Post } = require("./post");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
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
    lowercase: true,
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Post",
  },
  avatarPath: String,
  avatarCloudID: String,
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  role: {
    type: String,
    required: true,
    default: "Member",
  },
  bio: {
    type: String,
    default: "",
  },
  regenerationToken: {
    type: String,
    required: true,
  },
});

userSchema.methods.generateRegenerationToken = function () {
  return `${nanoid()}/+/${this._id}`;
};

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
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      avatarPath: this.avatarPath,
      followers: this.followers,
      following: this.following,
      role: this.role,
      bio: this.bio,
      regenerationToken: this.regenerationToken,
    },
    config.get("jwtPrivateKey"),
    { noTimestamp: true }
  );
};

const userJoiSchema = Joi.object({
  firstName: Joi.string().required().label("First Name"),
  lastName: Joi.string().required().label("Last Name"),
  username: Joi.string().required().label("Username").lowercase().trim(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string()
    .required()
    .label("Password")
    .min(6)
    .max(32)
    .pattern(/(?=(?:.*[0-9]){1,16}).+/)
    .messages({
      "string.pattern.base": "{#label} must contain at least one number",
    }),
});

const userAuthJoiSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email"),
  password: Joi.string().required().label("Password"),
});

const put_userJoiSchema = Joi.object({
  firstName: Joi.string().label("First Name"),
  lastName: Joi.string().label("Last Name"),
  username: Joi.string().label("Username").lowercase().trim(),
  bio: Joi.string().min(1).max(64).allow(""),
  password: Joi.string()
    .label("Password")
    .min(6)
    .max(32)
    .pattern(/(?=(?:.*[0-9]){1,16}).+/)
    .messages({
      "string.pattern.base": "{#label} must contain at least one number",
    }),
  avatar: Joi.any().label("Avatar"),
});

const User = mongoose.model("User", userSchema);

async function getUser(_id) {
  const user = await User.findById(_id);
  return user;
}

exports.User = User;
exports.getUser = getUser;
exports.userSchema = userSchema;
exports.userJoiSchema = userJoiSchema;
exports.userAuthJoiSchema = userAuthJoiSchema;
exports.put_userJoiSchema = put_userJoiSchema;
