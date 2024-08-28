require("dotenv").config();
const express = require("express");
const db = require("./db.js");
const config = require("./config.js");
const routes = require("./routes.js");
const chat = require("./chat.js");

const app = express();
const port = process.env.PORT || 80;

db();
config(app);
routes(app);

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
  console.log("NODE_VERSION: ", process.version);
});

chat(server);
