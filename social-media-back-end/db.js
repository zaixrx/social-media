const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = function () {
  mongoose
    .connect("mongodb://127.0.0.1:27017/social-media")
    .then(() => {
      console.log("Connected to the database...");
    })
    .catch((error) => {
      console.log("Couldn't connect to the database.");
    });
};
