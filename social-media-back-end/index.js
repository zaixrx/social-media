require("dotenv").config();
const express = require("express");
const db = require("./db.js");
const config = require("./config.js");
const routes = require("./routes.js");
const chat = require("./chat.js");

const app = express();
const port = process.env.PORT || 3000;

db();
config(app);
routes(app);

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});

chat(server);
