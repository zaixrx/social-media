import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  sendPostDeleteRequest,
  sendPostLikeRequest,
  sendPostCommentRequest,
  sendCommentEditRequest,
  sendCommentDeleteRequest,
  sendPollVoteRequest,
} from "../services/posts";
import {
  getComment,
  deleteComment,
  deleteCommentChildren,
  prepareComments,
} from "../utils/comments";
import { getToken } from "../utils/token";
import { getDateString } from "../utils/time";
import { showMessage } from "../utils/logging";
import { PollOption, getTotalPollVotes } from "./pollManager";
import Comment from "./comment";
import Image from "../common/Image";
import Paragpragh from "../common/Paragraph";

function Post({ currentUser, user, post, onPostEdit, fetchHomeData }) {
  const [likes, setLikes] = useState({ liked: false, count: "" });
  const [comments, setComments] = useState([]);
  const [pollOptions, setPollOptions] = useState([]);
  const [currentCommentParent, setCurrentCommentParent] = useState({});
  const commentInput = useRef(undefined);

  useEffect(() => {
    const { comments: _comments, likes, pollOptions: _pollOptions } = post;

    if (_pollOptions.length) {
      const totalVotes = getTotalPollVotes(_pollOptions);

      setPollOptions(
        _pollOptions.map((po) => {
          return {
            _id: po._id,
            checked: po.votes.includes(currentUser._id),
            label: po.label,
            votes: po.votes,
            percentage: (po.votes.length * 100) / totalVotes,
          };
        })
      );
    }

    prepareComments(_comments);

    setComments(_comments);

    if (!likes) return;

    const result = likes.find(
      (like) => currentUser._id && like.user === currentUser._id
    );
    const liked = result && result.like;
    const likesCount = likes.filter((like) => like.like).length;

    setLikes({ liked, count: likesCount });
  }, []);

  async function handlePostDelete() {
    try {
      await sendPostDeleteRequest(post._id, getToken());
      window.location.reload();
    } catch ({ message, response }) {
      showMessage(response ? response.data : message);
    }
  }

  async function handlePostLike() {
    let { liked, count } = likes;

    liked = !liked;
    count += liked ? 1 : -1;

    try {
      setLikes({ liked, count });
      await sendPostLikeRequest(liked, post._id, getToken());
    } catch ({ response, message }) {
      showMessage(response ? response.data : message);
    }
  }

  async function handleCommentSend() {
    const comment = commentInput.current.value;
    if (!comment.trim()) return;

    try {
      const { data: receivedComment } = await sendPostCommentRequest(
        comment,
        currentCommentParent._id,
        post._id,
        getToken()
      );

      const _comments = [...comments];

      if (receivedComment.parent) {
        const commentParent = getComment(_comments, receivedComment.parent);
        commentParent?.children.push(receivedComment);
      }

      _comments.push(receivedComment);
      setComments(_comments);

      setCurrentCommentParent({});
      commentInput.current.value = "";
    } catch ({ response, message }) {
      fetchHomeData(false);
      showMessage(response?.data || message);
    }
  }

  async function handleCommentEdit(_id, value) {
    if (!_id) return false;

    const comment = comments.find((c) => {
      return c._id === _id;
    });

    if (!comment)
      showMessage(
        "Comment doesn't exist",
        "Please report this to my discord 'zaizr'"
      );
    const index = comments.indexOf(comment);

    try {
      const { data: receivedComment } = await sendCommentEditRequest(
        value,
        _id,
        post._id,
        getToken()
      );

      const _comments = [...comments];
      _comments[index] = receivedComment;
      setComments(_comments);

      return true;
    } catch ({ response, message }) {
      showMessage(response ? response.data : message);
    }

    return false;
  }

  async function handleCommentDelete(_id) {
    if (!_id) return;

    const commentToDelete = comments.find((c) => {
      return c._id === _id;
    });

    if (!commentToDelete) return showMessage("Comment doesn't exist");

    await sendCommentDeleteRequest(_id, post._id, getToken());
    const _comments = [...comments];

    // Remove from post.comments 1
    // Remove from parent.children 2
    // Remove commentToDelete.children.children.children.children... from post.comments 3

    // Step 1
    deleteComment(_comments, commentToDelete);

    // Step 2
    const commentToDeleteParent = getComment(_comments, commentToDelete.parent);
    if (commentToDeleteParent) {
      const { children } = commentToDeleteParent;
      deleteComment(children, commentToDelete);
    }

    //Step 3
    if (commentToDelete.children.length)
      deleteCommentChildren(_comments, commentToDelete);

    setComments(_comments);

    if (currentCommentParent._id === _id) setCurrentCommentParent({});
  }

  function handleCommentReplyTriggerd(parentCommentID, parentUsername) {
    if (!parentCommentID) return;
    const parentComment = comments.find(
      (comment) => comment._id === parentCommentID
    );
    if (!parentComment) return;
    commentInput.current.value = `@${parentUsername} `;
    commentInput.current.focus();
    setCurrentCommentParent({
      _id: parentCommentID,
      username: parentUsername,
    });
  }

  async function handlePollOptionVoteSend(pollOptionID, pollOptionVoteValue) {
    const token = getToken();
    if (!token || !pollOptionID) return;

    try {
      const { data: votes } = await sendPollVoteRequest(
        post._id,
        pollOptionID,
        pollOptionVoteValue,
        token
      );

      const _pollOptions = [...pollOptions];

      const pollOption = _pollOptions.find((po) => po._id === pollOptionID);
      pollOption.checked = pollOptionVoteValue;
      pollOption.votes = votes;

      const totalVotes = getTotalPollVotes(_pollOptions);
      _pollOptions.forEach((po) => {
        po.percentage = totalVotes ? (po.votes.length * 100) / totalVotes : 0;
      });

      setPollOptions(_pollOptions);
    } catch ({ response, message }) {
      showMessage(response ? response.data : message);
    }
  }

  return (
    user && (
      <div className="card">
        <section className="card-header bg-white d-flex align-items-center justify-content-between">
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
                  {getDateString(new Date(post.publishDate))}
                </span>
              </div>
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
                    onClick={handlePostDelete}
                  >
                    <i className="bi bi-x-circle fa-fw pe-2"></i>Delete post
                  </div>
                </li>
              </ul>
            </div>
          )}
        </section>
        <section className="card-body d-flex flex-column gap-3">
          <Paragpragh className="mb-0">{post.caption}</Paragpragh>
          {post.imagePath && (
            <Image src={post.imagePath} className="post-img" />
          )}
          {post.pollOptions.length
            ? pollOptions.map((option, index) => (
                <PollOption
                  percentage={option.percentage}
                  checked={option.checked}
                  id={option._id}
                  key={option._id}
                  postID={post._id}
                  label={option.label}
                  votes={option.votes}
                  onPollOptionVote={handlePollOptionVoteSend}
                />
              ))
            : null}
        </section>
        <section className="card-footer border-top-0 bg-white">
          <div className="d-flex mb-3 gap-4">
            <div
              onClick={handlePostLike}
              className="d-flex align-items-center clickable text-danger"
            >
              <FontAwesomeIcon
                className="card-btn me-2"
                icon={likes.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              />
              <p className="mb-0">{likes.count} Like(s)</p>
            </div>
            <div
              className="d-flex align-items-center clickable text-success"
              onClick={() => commentInput.current.focus()}
            >
              <FontAwesomeIcon
                className="card-btn me-2"
                icon="fa-regular fa-comment"
              />
              <p className="mb-0">{comments.length} Comment(s)</p>
            </div>
          </div>
          <div className="comments d-flex flex-column gap-2">
            <div className="d-flex gap-3">
              <img
                height={40}
                width={40}
                src={currentUser.avatarPath}
                className="avatar rounded-circle"
              />
              <div className="input-group">
                <input
                  ref={commentInput}
                  onKeyDown={async ({ key }) => {
                    if (key !== "Enter") return;
                    await handleCommentSend();
                  }}
                  className="form-control pe-5 bg-light shadow-none"
                  placeholder="Add a comment..."
                />
                <button
                  className="btn btn-primary"
                  onClick={async () => await handleCommentSend()}
                >
                  <FontAwesomeIcon icon="fa-regular fa-paper-plane" />
                </button>
              </div>
            </div>
            {currentCommentParent.username && (
              <p>Currently replying to {currentCommentParent.username}</p>
            )}
            <div
              className="d-flex flex-column gap-2"
              style={{ overflowX: "auto" }}
            >
              {comments.reverse().map((c) => {
                if (c.parent) return;

                return (
                  <Comment
                    key={c._id}
                    comment={c}
                    isOwner={currentUser._id === c.user}
                    onCommentEdit={handleCommentEdit}
                    onCommentDelete={handleCommentDelete}
                    onCommentReplyTriggerd={handleCommentReplyTriggerd}
                    currentUser={currentUser}
                    getComment={getComment}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </div>
    )
  );
}

export default Post;
