const router = require("express").Router();
const bcrypt = require("bcrypt");

const { User } = require("../models/user.js");

router.post("/", async (req, res) => {
  const { body } = req;

  const user = await User.findOne({ email: body.email });
  if (!user)
    return res
      .status(404)
      .header("x-error-path", "email")
      .header("access-control-expose-headers", "x-error-path")
      .send("Email doesn't exist.");

  const validPassword = await bcrypt.compare(body.password, user.password);
  if (!validPassword)
    return res
      .status(404)
      .header("x-error-path", "password")
      .header("access-control-expose-headers", "x-error-path")
      .send("Wrong password.");

  const token = await user.generateAuthToken();
  res.send(token);
});

module.exports = router;
