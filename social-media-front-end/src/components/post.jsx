import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  commentPost,
  deletePost,
  deletePostComment,
  likePost,
  putPostComment,
} from "../services/posts";
import Comment from "./comment";
import { getToken } from "../utils/token";

function Post({ currentUser, user, post, onPostEdit }) {
  const [likes, setLikes] = useState({ liked: false, count: "" });
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const { comments, likes } = post;

    setComments(comments);

    if (!likes) return;

    const result = likes.find(
      (like) => currentUser._id && like.user === currentUser._id
    );
    const liked = result && result.like;
    const likesCount = likes.filter((like) => like.like).length;

    setLikes({ liked, likesCount });
  }, []);

  async function handleDelete() {
    try {
      await deletePost(post._id, getToken());
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  }

  async function handlePostLike() {
    let { liked, count } = likes;

    liked = !liked;
    count += liked ? 1 : -1;

    try {
      await likePost(liked, post._id, getToken());
      setLikes({ liked, count });
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }
  }

  async function handleCommentSend({ keyCode, currentTarget }) {
    // Enter Key
    if (keyCode !== 13) return;
    if (!currentTarget) return;
    if (currentTarget.value.trim() === "") return;

    try {
      await commentPost(currentTarget.value, post._id, getToken());

      const _comments = { ...comments };
      _comments.push({ user: currentUser._id, comment: currentTarget.value });
      setComments(_comments);
      currentTarget.value = "";
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }
  }

  async function handleCommentDelete(_id) {
    if (!_id) return;

    const comment = comments.find((c) => {
      return c._id === _id;
    });

    if (!comment) throw Error("(Comment[]).Contains(comment) => false");
    const index = comments.indexOf(comment);

    try {
      await deletePostComment(_id, post._id, getToken());
      const _comments = { ...comments };
      _comments.splice(index, 1);
      setComments(_comments);
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }
  }

  async function handleCommentEdit(_id, value) {
    if (!_id) return false;

    const comment = comments.find((c) => {
      return c._id === _id;
    });

    if (!comment) throw Error("(Comment[]).Contains(comment) => false");
    const index = comments.indexOf(comment);

    try {
      await putPostComment(value, _id, post._id, getToken());

      comment.comment = value;
      const _comments = { ...comments };
      _comments[index] = comment;
      setComments(_comments);

      return true;
    } catch (error) {
      if (error.response) console.log(error.response.data);
      alert(error.message);
    }

    return false;
  }

  return (
    user && (
      <div className="card">
        <div className="card-header bg-white d-flex align-items-center justify-content-between">
          <Link
            to={`/profile/${user._id}`}
            className="d-flex align-items-center text-body"
          >
            <img
              src={user.avatarPath}
              height={50}
              width={50}
              className="rounded-circle avatar me-2"
            />
            <div>
              <div className="nav nav-divider">
                <h6 className="nav-item card-title mb-0">@{user.username}</h6>
                <span className="post-date nav-item small dot">
                  {post.publishDate.slice(0, 10)}
                </span>
              </div>
              <p className="mb-0 small">Caption...</p>
            </div>
          </Link>
          {user && currentUser && user._id === currentUser._id && (
            <div className="dropdown">
              <a
                className="text-secondary btn btn-secondary-soft-hover py-1 px-2"
                id="cardFeedAction"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="cardFeedAction"
              >
                <li>
                  <div
                    className="dropdown-item"
                    id="editPostToggle"
                    onClick={() => onPostEdit(post)}
                  >
                    <i className="bi bi-bookmark fa-fw pe-2"></i>Edit post
                  </div>
                </li>
                <li>
                  <div
                    className="dropdown-item clickable"
                    onClick={handleDelete}
                  >
                    <i className="bi bi-x-circle fa-fw pe-2"></i>Delete post
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="card-body pb-0">
          <div className="mb-3">
            <p className="mb-0">{post.caption}</p>
            {post.imagePath && (
              <img src={post.imagePath} className="post-img mt-3" />
            )}
          </div>
          <div className="d-flex mb-3 gap-4">
            <div
              onClick={handlePostLike}
              className="d-flex align-items-center clickable"
            >
              <FontAwesomeIcon
                className="card-btn me-2"
                icon={likes.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              />
              <p className="mb-0">{likes.count} Like(s)</p>
            </div>
            <div
              className="d-flex align-items-center clickable"
              onClick={() => document.getElementById("input").focus()}
            >
              <FontAwesomeIcon
                className="card-btn me-2"
                icon="fa-regular fa-comment"
              />
              <p className="mb-0">{comments.length} Comment(s)</p>
            </div>
          </div>
          <div className="comments">
            <div className="d-flex gap-3 mb-3">
              <img
                height={40}
                width={40}
                src={currentUser.avatarPath}
                className="avatar rounded-circle"
              />
              <input
                id="input"
                onKeyDown={handleCommentSend}
                className="form-control pe-5 bg-light shadow-none"
                placeholder="Add a comment..."
              />
            </div>
            {comments.map((c) => {
              return (
                <Comment
                  key={c._id}
                  data={c}
                  isOwner={currentUser._id === c.user}
                  onCommentDelete={handleCommentDelete}
                  onCommentEdit={handleCommentEdit}
                />
              );
            })}
          </div>
        </div>
      </div>
    )
  );
}

export default Post;
