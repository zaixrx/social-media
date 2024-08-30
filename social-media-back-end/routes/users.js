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

    const u = await User.findById(_id);
    if (!u) return res.status(404).send("User is not found");

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
        if (!followerID)
          return res.status(400).send("You must provide the follower _id.");

        if (followerID === u._id.toString())
          return res.stauts(403).send("You can't follow you're self.");

        const follower = await User.findById(followerID);
        if (!follower)
          return res.status(404).send("The follower doesn't exist.");

        if (u.followers.includes(follower._id)) {
          return res
            .status(400)
            .send("Follower is already following this User.");
        }
        // TODO: Transaction
        u.followers.push(followerID);
        follower.following.push(u._id);

        await u.save();
        await follower.save();

        returnedUser = follower;

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
        if (!_followerID)
          return res.status(400).send("You must provide the follower _id.");

        if (_followerID === u._id.toString())
          return res.stauts(403).send("You can't unfollow you're self.");

        const _follower = await User.findById(_followerID);
        if (!_follower)
          return res.status(404).send("The follower doesn't exist.");

        const followerIndex = u.followers.indexOf(_followerID); // Error followerID is not of type ObjectID
        const userIndex = _follower.following.indexOf(u._id);
        if (followerIndex === -1 || userIndex === -1)
          return res.status(404).send("Follower isn't following this user.");

        // TODO: Transaction
        u.followers.splice(followerIndex, 1);
        _follower.following.splice(userIndex, 1);

        await u.save();
        await _follower.save();

        returnedUser = _follower;

        break;

      case "default":
        if (u._id.toString() !== user._id)
          return res.status(403).send("Only the Owner can edit this Account.");

        if (file) {
          if (
            u.avatarPath &&
            u.avatarPath !== process.env.DEFAULT_AVATAR_PATH
          ) {
            await handleFileDelete(u.avatarCloudID);
          }

          const b64 = Buffer.from(file.buffer).toString("base64");
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          const { secure_url: url, public_id: avatarCloudID } =
            await handleFileUpload(dataURI, "users/");
          u.avatarPath = url;
          u.avatarCloudID = avatarCloudID;
        }

        if (body.firstName) u.firstName = body.firstName;
        if (body.lastName) u.lastName = body.lastName;
        if (body.username) u.username = body.username;
        if (body.bio) u.bio = body.bio;
        if (body.email) u.email = body.email;
        if (body.passwrod) u.password = body.password;
        if (!u.avatarPath) u.avatarPath = process.env.DEFAULT_AVATAR_PATH;

        await u.save();
        returnedUser = u;

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
