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
      .select("-__v")
      .populate("user", "_id username avatarPath")
      .sort("-publishDate");
    return res.send(posts);
  })
);

router.post(
  "/",
  [auth, upload.single("image")],
  asyncMiddleware(async (req, res) => {
    const { body, file, user } = req;

    body.pollOptions = body.pollOptions.split(",");

    if (!validatePost(body, res)) return;

    const postCreatorUser = await User.findById(user._id);
    if (!postCreatorUser) return error(res, 404, "User doesn't exist");

    const post = new Post({
      user: user._id,
      caption: body.caption,
      publishDate: new Date(),
    });

    try {
      if (body.pollOptions) {
        let pollOptions = [];
        body.pollOptions.forEach((option) => {
          pollOptions.push({
            label: option,
            votes: [],
          });
        });
        post.pollOptions = pollOptions;
      } else if (file) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const { secure_url: url, public_id: imageCloudID } =
          await handleFileUpload(dataURI, `posts/${post._id}`);
        post.imagePath = url;
        post.imageCloudID = imageCloudID;
      }

      await post.save();
      postCreatorUser.posts.push(post);
      await postCreatorUser.save();

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
    const post = await Post.findById(req.params._id)
      .select("-__v")
      .populate("user", "_id username avatarPath");

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

        if (file) {
          if (post.imageCloudID) {
            await handleFileDelete(post.imageCloudID);
          }
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

      case "poll-option-vote":
        const pollOptionID = body.pollOptionId;
        if (!pollOptionID)
          return error(res, 400, "You must provide a valid pollID");

        const pollOption = post.pollOptions.find(
          (po) => po._id.toString() === pollOptionID
        );
        if (!pollOption)
          return error(
            res,
            400,
            "The provided id doesn't refrence any poll option"
          );

        const voteValue = body.pollOptionVoteValue;
        const { votes } = pollOption;

        if (voteValue) {
          if (votes.includes(user._id))
            return error(res, 400, "You are already voting for this option");
          votes.push(user._id);
        } else {
          const index = votes.indexOf(user._id);
          if (index === -1)
            return error(
              res,
              400,
              "You can't unvote this option, you are not voting on it"
            );
          votes.splice(index, 1);
        }
        res.send(votes);
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
        const isOwner = user._id === post.user.toString();
        if (!isOwner)
          return error(res, 403, "Only the owner can delete this Post.");

        const creatorUser = await User.findById(user._id);
        if (!creatorUser) return error("The post's creator doesn't exist");

        if (post.imagePath) await handleFileDelete(post.imageCloudID);
        creatorUser.posts.splice(creatorUser.posts.indexOf(post._id), 1);
        await post.deleteOne();
        await creatorUser.save();
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
