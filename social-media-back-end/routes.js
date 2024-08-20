const users = require("./routes/users.js");
const auth = require("./routes/auth.js");
const posts = require("./routes/posts.js");

module.exports = function (app) {
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/posts", posts);
  //app.use("/api/uploadTest", uploadTest);
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Internal server error.");
  });
};
