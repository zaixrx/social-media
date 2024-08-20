const router = require("express").Router();
const {
  deleteFile,
  generatePath,
  getNameFromPath,
} = require("../utils/file.js");
const auth = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");
const asyncMiddleware = require("../middleware/async.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const { Post, validatePost } = require("../models/post.js");
const { commentValidate } = require("../models/comment.js");
const { User } = require("../models/user.js");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const posts = await Post.find()
      .populate("user", "-password -email")
      .sort("-publishDate");
    return res.send(posts);
  })
);

router.post(
  "/",
  [auth, upload.single("image")],
  asyncMiddleware(async (req, res) => {
    const { body, file, user } = req;

    if (!validatePost(body, res)) return;

    const post = new Post({
      user: user._id,
      caption: body.caption,
    });
    if (file) post.imagePath = generatePath(file.path);

    // I might implement a transaction for this later
    // But for now this will work
    const dbUser = await User.findById(user._id);

    try {
      await post.save();
      dbUser.posts.push(post);
      await dbUser.save();
      res.send(post);
    } catch (internalException) {
      await Post.findByIdAndDelete(post._id);
      if (dbUser.posts.includes(post)) {
        dbUser.posts.slice(dbUser.posts.indexOf(post));
        await dbUser.save();
      }
    }
  })
);

router.get(
  "/:_id",
  validateObjectId,
  asyncMiddleware(async (req, res) => {
    const post = await Post.findById(req.params._id).populate(
      "user",
      "-password -email"
    );

    if (!post)
      return res
        .status(404)
        .send("The given id doesn't correspond to any post.");

    return res.send(post);
  })
);

router.put(
  "/:_id",
  [validateObjectId, auth, upload.single("image")],
  asyncMiddleware(async (req, res) => {
    const { body, user, file, headers } = req;
    const { _id } = req.params;

    let post = await Post.findById(_id);
    if (!post)
      return res
        .status(404)
        .send("The given id doesn't correspond to any Post.");

    const type = headers["x-type"];

    switch (type) {
      case "comment-post":
        const comment = {
          user: user._id,
          value: body.comment,
        };

        if (!commentValidate(body, res)) return;

        const index = post.comments.length;
        post.comments.push(comment);
        res.send(post.comments[index]);
        break;

      case "comment-put":
        const _commentID = headers["x-comment-id"];
        const _comment = post.comments.find(
          (c) => c._id.toString() === _commentID
        );

        if (!_comment) return res.status(404).send("Comment does not exists.");

        if (_comment.user._id.toString() !== req.user._id)
          return res.status(403).send("Only the Owner can edit this Comment.");

        if (!commentValidate(body, res)) return;

        const _index = post.comments.indexOf(_comment);
        post.comments[_index].value = body.comment;
        res.send(_comment);

        break;

      case "post":
        const isOwner = user._id === post.user._id.toString();

        if (!isOwner)
          return res.status(400).send("Only the Owner can edit this Post.");
        if (!validatePost(body, res)) return;

        const newImagePath = file && generatePath(file.path);
        // If there is no image don't delete anything
        // If there is an image and its not the same as the last one delete the last one.
        const imageChanged = post.imagePath && post.imagePath !== newImagePath;
        if (imageChanged) {
          deleteFile(getNameFromPath(post.imagePath), console.error);
        }

        post.caption = body.caption;
        post.imagePath = file && newImagePath;

        res.send(post);
        break;

      case "post-like":
        const likedBefore = post.likes.find(
          (like) => like.user.toString() === user._id
        );

        const like = {
          user: user._id,
          like: body.like,
        };

        if (likedBefore) {
          const index = post.likes.indexOf(likedBefore);
          post.likes[index] = like;
        } else {
          post.likes.push(like);
        }

        res.send(like);
        break;

      default:
        return res.status(400).send(`Invalid request type: ${type}`);
    }

    await post.save();
  })
);

router.delete("/:_id", [validateObjectId, auth], async (req, res) => {
  const post = await Post.findById(req.params._id);

  if (!post)
    return res.status(404).send("The given id doesn't correspond to any Post.");

  const commentID = req.headers["x-comment-id"];
  if (commentID) {
    const comment = post.comments.find((c) => c._id.toString() === commentID);
    if (!comment)
      return res
        .status(404)
        .send("The given id doesn't correspond to any Comment.");
    if (comment.user._id.toString() !== req.user._id)
      return res.status(403).send("Only the Owner can edit this Comment.");
    post.comments.splice(post.comments.indexOf(comment), 1);
    await post.save();
    return res.send(post);
  }

  if (req.user._id !== post.user.toString())
    return res.status(403).send("Only the owner can delete this Post.");

  const u = await User.findById(post.user);
  if (!u) return res.status(400).send("User is not found.");

  // I might implement a transaction for this later
  // But for now this will work
  try {
    await post.deleteOne();
    const index = u.posts.indexOf(post._id);
    u.posts.splice(index, 1);
    await u.save();
  } catch (error) {
    if (!u.posts.includes(post)) {
      u.posts.push(post);
      await u.save();
      return res
        .status(500)
        .send(`Could not update the Post's User Document: ${error.message}`);
    }
    const p = await Post.findById(post._id);
    if (!p) {
      await post.save();
      return res
        .status(500)
        .send(`Could not delete the given Post: ${error.message}`);
    }
    console.log("Uncaught error: ", error);
  }
  if (post.imagePath) {
    deleteFile(getNameFromPath(post.imagePath), console.error);
  }

  return res.send(post);
});

function validate(schema, value, res) {
  const { error } = schema.validate(value);
  res.status(400).send(error.details[0].message);
  return error === undefined;
}

module.exports = router;
