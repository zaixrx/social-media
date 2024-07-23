const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    like: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { _id: false }
);

exports.likeSchema = likeSchema;
