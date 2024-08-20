const cors = require("cors");
const express = require("express");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use(express.static("public"));
};
