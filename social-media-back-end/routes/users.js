const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const asyncMiddleware = require("../middleware/async.js");
const { User, userJoiSchema, put_userJoiSchema } = require("../models/user.js");
const { handleFileUpload, handleFileDelete } = require("../utils/cloud.js");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const query = req.headers["x-query"];
    if (!query) return res.status(400).send("Query is undefined.");

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .limit(5)
      .select("_id username avatarPath");

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
        .send(error.details[0].message);

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
      firstName: body.firstName,
      lastName: body.lastName,
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
    const { body, user, file, headers } = req;
    const { _id } = req.params;

    const { error } = put_userJoiSchema.validate(body);
    if (error) return res.status(400).send(error.details[0].message);

    const targetUser = await User.findById(_id);
    if (!targetUser) return res.status(404).send("User is not found");

    const type = headers["x-type"];
    let returnedUser = undefined;

    switch (type) {
      case "follow":
        // If the user is me return
        // Get ahmed's user from his _id
        // If ahmed doesn't exist return
        // If I'm already following ahmed return
        /* Add ahmed's _id to the list of followers
           And Add me to the list of follwing to ahmed*/

        // User to follow: is me
        // follower: is ahmed

        const followerID = user._id;
        if (followerID === targetUser._id.toString())
          return res.stauts(403).send("You can't follow your self.");

        const me = await User.findById(followerID);
        if (!me) return res.status(404).send("Your id doesn't exist.");

        if (targetUser.followers.includes(me._id)) {
          return res.status(400).send("You are already following this User.");
        }

        // TODO: Transaction
        targetUser.followers.push(followerID);
        me.following.push(targetUser._id);

        await targetUser.save();
        await me.save();
        returnedUser = me;

        break;

      case "unfollow":
        // If the user is me return
        // Get ahmed's user from his _id
        // If ahmed doesn't exist return
        // If ahmed is not following me
        // Or i don't have ahmed as a follower
        // return
        // splice ahmed from followers
        // splice me from following

        const _followerID = user._id;
        if (_followerID === targetUser._id.toString())
          return res.stauts(403).send("You can't unfollow you're self.");

        const _me = await User.findById(_followerID);
        if (!_me) return res.status(404).send("Your user doesn't exist.");

        const followerIndex = targetUser.followers.indexOf(_followerID);
        const userIndex = _me.following.indexOf(targetUser._id);
        if (followerIndex === -1 || userIndex === -1)
          return res.status(404).send("You aren't following this user.");

        // TODO: Transaction
        targetUser.followers.splice(followerIndex, 1);
        _me.following.splice(userIndex, 1);

        await targetUser.save();
        await _me.save();
        returnedUser = _me;

        break;

      case "default":
        if (targetUser._id.toString() !== user._id)
          return res.status(403).send("Only the Owner can edit this Account.");

        if (file) {
          if (
            targetUser.avatarPath &&
            targetUser.avatarPath !== process.env.DEFAULT_AVATAR_PATH
          ) {
            await handleFileDelete(targetUser.avatarCloudID);
          }

          const b64 = Buffer.from(file.buffer).toString("base64");
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          const { secure_url: url, public_id: avatarCloudID } =
            await handleFileUpload(dataURI, "users/");
          targetUser.avatarPath = url;
          targetUser.avatarCloudID = avatarCloudID;
        }

        if (body.firstName) targetUser.firstName = body.firstName;
        if (body.lastName) targetUser.lastName = body.lastName;
        if (body.username) targetUser.username = body.username;
        if (body.bio) targetUser.bio = body.bio;
        if (body.email) targetUser.email = body.email;
        if (body.passwrod) targetUser.password = body.password;
        if (!targetUser.avatarPath)
          targetUser.avatarPath = process.env.DEFAULT_AVATAR_PATH;

        await targetUser.save();
        returnedUser = targetUser;

        break;

      default:
        return res.status(400).send("You must provide a request type.");
    }

    const token = await returnedUser.generateAuthToken();
    res.send(token);
  })
);

router.post(
  "/validate",
  asyncMiddleware(async (req, res) => {
    const { body } = req;
    const userEmail = await User.findOne({
      email: body.email,
    });
    if (userEmail) return res.send("Email is taken.");
    const userUsername = await User.findOne({
      username: body.username,
    });
    if (userUsername) return res.send("Username is taken.");

    return res.send(true);
  })
);

module.exports = router;
