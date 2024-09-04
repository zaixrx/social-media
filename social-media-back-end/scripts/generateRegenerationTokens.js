require("dotenv").config();
const db = require("../db");
const { User } = require("../models/user");

(async () => {
  db();
  const users = await User.find();
  for (const user of users) {
    if (user.regenerationToken) return;
    user.regenerationToken = user.generateRegenerationToken();
    await user.save();
  }
  console.log("SCRIPT DONE!");
})();
