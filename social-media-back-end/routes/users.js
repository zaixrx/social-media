const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  deleteFile,
  generatePath,
  getNameFromPath,
} = require("../utils/file.js");
const auth = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const asyncMiddleware = require("../middleware/async.js");
const { User, userJoiSchema, put_userJoiSchema } = require("../models/user.js");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const query = req.headers["x-query"];
    if (!query) return res.status(400).send("Query is undefined.");

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .limit(5)
      .select("_id username");

    res.send(users);
  })
);

router.get(
  "/:_id",
  validateObjectId,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.params._id)
      .populate("posts", "-__v")
      .select("-password");
    if (!user) return res.status(404).send("User is not found.");
    res.send(user);
  })
);

router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { body } = req;
    const { error } = userJoiSchema.validate(body);
    if (error)
      return res
        .status(400)
        .header("x-error-path", "username")
        .header("access-control-expose-headers", "x-error-path")
        .send("Data is not valid.");

    const u = await User.findOne({ email: body.email });
    if (u)
      return res
        .status(400)
        .header("x-error-path", "email")
        .header("access-control-expose-headers", "x-error-path")
        .send("Email is taken.");

    const u1 = await User.findOne({ username: body.username });
    if (u1)
      return res
        .status(400)
        .header("x-error-path", "username")
        .header("access-control-expose-headers", "x-error-path")
        .send("Username is taken.");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(body.password, salt);

    const user = new User({
      username: body.username,
      email: body.email,
      password: password,
      avatarPath: process.env.DEFAULT_AVATAR_PATH,
    });
    await user.save();

    const token = await user.generateAuthToken();
    res
      .header("access-control-expose-headers", "x-auth-token")
      .header("x-auth-token", token)
      .send(user);
  })
);

router.post(
  "/token",
  asyncMiddleware(async (req, res) => {
    const providedToken = req.body.authToken;
    if (!providedToken)
      return res
        .status(401)
        .send("You must provide a token in order to regenerate it.");

    const payload = jwt.decode(providedToken);
    if (!payload) return res.status(400).send("Token is not valid.");

    const user = await User.findById(payload._id);
    if (!user) return res.status(400).send("Token is not valid.");

    const token = await user.generateAuthToken();
    res.send(token);
  })
);

router.put(
  "/:_id",
  [validateObjectId, auth, upload.single("avatar")],
  asyncMiddleware(async (req, res) => {
    const { body, user, file } = req;
    const { _id } = req.params;

    const { error } = put_userJoiSchema.validate(body);
    if (error) return res.status(400).send(error.details[0].message);

    const u = await User.findById(_id);
    if (!u) return res.status(404).send("User is not found");

    if (u._id.toString() !== user._id)
      return res.status(403).send("Only the Owner can edit this Account.");

    const newAvatarPath = file && generatePath(file.path);
    const avatarChanged = file && u.avatarPath !== newAvatarPath;
    if (u.avatarPath !== process.env.DEFAULT_AVATAR_PATH && avatarChanged)
      deleteFile(getNameFromPath(u.avatarPath));

    //Fix This Mess
    if (file) u.avatarPath = newAvatarPath;
    if (body.username) u.username = body.username;
    if (body.email) u.username = body.username;
    if (body.passwrod) u.username = body.username;

    if (!u.avatarPath) u.avatarPath = process.env.DEFAULT_AVATAR_PATH;

    await u.save();

    // Please don't a raw user
    res.send(u);
  })
);

module.exports = router;
