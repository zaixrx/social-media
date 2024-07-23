const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token) return res.status(401).send("Token is undefined.");
  const user = jwt.decode(token, config.get("jwtPrivateKey"));
  if (!user) return res.status(403).send("Invalid token.");
  req.user = user;
  next();
};
