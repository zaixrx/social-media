const cors = require("cors");
const express = require("express");

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  optionsSuccessStatus: 200,
};

module.exports = function (app) {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.static("public"));
};
