require("dotenv").config();
const express = require("express");
const db = require("./db.js");
const config = require("./config.js");
const routes = require("./routes.js");
const chat = require("./chat.js");
const wakeUpServer = require("./wakeUpServer.js");
const app = express();

db();
config(app);
routes(app);

// Used to not let the server shut down after 15 minutes.
if (process.env.NODE_ENV === "production") {
  wakeUpServer();
}

const port = process.env.PORT || 80;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
  console.log("NODE_VERSION: ", process.version);
});

chat(server);
