require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const users = require("./routes/users.js");
const auth = require("./routes/auth.js");
const posts = require("./routes/posts.js");
const comments = require("./routes/comments.js");
//const uploadTest = require("./routes/uploadTest.js");
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/social-media")
  .then(() => {
    console.log("Connected to the database...");
  })
  .catch((error) => {
    console.log("Couldn't connect to the database.");
  });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/posts", posts);
//app.use("/api/uploadTest", uploadTest);
app.use("/api/comments", comments);
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Internal server error.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
