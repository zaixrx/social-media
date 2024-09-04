const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(process.env.DB_CONNECTION_STRING)
    .then(() => {
      console.log("Connected to the database...");
    })
    .catch((error) => {
      throw new Error(`Couldn't connect to the database: ${error.message}`);
    });
};
