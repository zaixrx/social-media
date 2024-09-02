require("dotenv").config();
const express = require("express");
const axios = require("axios");
const db = require("./db.js");
const config = require("./config.js");
const routes = require("./routes.js");
const chat = require("./chat.js");

const app = express();
const port = process.env.PORT || 80;

db();
config(app);
routes(app);

// Used to not let the server go down after 15 minutes.
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    axios
      .get(process.env.REFRESH_API_ENDPOINT)
      .catch(({ message, response }) =>
        console.error(response ? response : message)
      );
  }, 1000 * 60 * 14);
}

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
  console.log("NODE_VERSION: ", process.version);
});

chat(server);
