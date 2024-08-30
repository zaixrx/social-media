const _ = require("lodash");
const router = require("express").Router();
const auth = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");
const asyncMiddleware = require("../middleware/async.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const { Post, validatePost } = require("../models/post.js");
const {
  commentValidate,
  getComment,
  deleteComment,
  deleteCommentChildren,
} = require("../models/comment.js");
const { User } = require("../models/user.js");
const { handleFileUpload, handleFileDelete } = require("../utils/cloud.js");

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
      publishDate: new Date(),
    });

    // I might implement a transaction for this later (You won't)
    // But for now this will work
    const dbUser = await User.findById(user._id);
    if (!dbUser) return res.status(404).send("User doesn't exist");

    try {
      if (file) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const { secure_url: url, public_id: imageCloudID } =
          await handleFileUpload(dataURI, `posts/${post._id}`);
        post.imagePath = url;
        post.imageCloudID = imageCloudID;
      }

      await post.save();
      dbUser.posts.push(post);
      await dbUser.save();

      res.send(post);
    } catch ({ message, response }) {
      res.status(400).send(response ? response : message);
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
        if (!commentValidate(body, res)) return;

        const commentIndex =
          post.comments.push({
            user: user._id,
            value: body.comment,
            publishDate: new Date(),
          }) - 1;
        const comment = post.comments[commentIndex];

        if (body.parent) {
          const commentParent = post.comments.find(
            (c) => c._id.toString() === body.parent
          );

          if (!commentParent) {
            return res.status(404).send("Parent message does not exist");
          }

          comment.parent = commentParent._id;
          commentParent.children.push(comment._id);
        }

        res.send(comment);
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

        // TODO: Fix this please

        if (post.imageCloudID) {
          await handleFileDelete(post.imageCloudID);

          const b64 = Buffer.from(file.buffer).toString("base64");
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          const { secure_url: url, public_id: imageCloudID } =
            await handleFileUpload(dataURI, `posts/${post._id}`);
          post.imagePath = url;
          post.imageCloudID = imageCloudID;
        }

        post.caption = body.caption;

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
        return error(res, 400, `Invalid request type: ${type}`);
    }

    await post.save();
  })
);

router.delete(
  "/:_id",
  [validateObjectId, auth],
  asyncMiddleware(async (req, res) => {
    const { headers, params, user } = req;

    const post = await Post.findById(params._id);
    if (!post)
      return error(res, 404, "The given id doesn't correspond to any Post.");

    const type = headers["x-type"];

    switch (type) {
      case "comment":
        const commentID = headers["x-comment-id"];
        const commentToDelete = getComment(post.comments, commentID);
        if (!commentToDelete)
          return error(
            res,
            404,
            "The given id doesn't correspond to any Comment."
          );

        if (commentToDelete.user._id.toString() !== user._id)
          return error(res, 403, "Only the Owner can edit this Comment.");

        // Remove from post.comments 1
        // Remove from parent.children 2
        // Remove commentToDelete.children.children.children.children... from post.comments 3

        const { comments } = post;
        if (comments) {
          // Step 1
          deleteComment(comments, commentToDelete);

          // Step 2
          const commentToDeleteParent = getComment(
            post.comments,
            commentToDelete.parent
          );
          if (commentToDeleteParent) {
            const { children } = commentToDeleteParent;
            children.splice(children.indexOf(commentToDelete._id), 1);
          }

          //Step 3
          deleteCommentChildren(comments, commentToDelete);
        }

        await post.save();
        break;

      case "post":
        if (post.user.toString() !== user._id)
          return error(res, 403, "Only the owner can delete this Post.");

        const postUser = await User.findById(user._id);
        if (!postUser) return error("The post's owner doesn't exists");

        // post.deleteOne() removes this document from the database(Posts collection)
        await post.deleteOne();
        _.pull(postUser.posts, post._id);
        await postUser.save();
        if (post.imagePath) await handleFileDelete(post.imageCloudID);
        break;

      default:
        return error(res, 400, `Invalid request type: ${type}`);
    }

    return res.send(post);
  })
);

function error(res, statusCode, message) {
  res.status(statusCode).send(message);
}

module.exports = router;
