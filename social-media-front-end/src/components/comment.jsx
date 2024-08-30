import React, { useRef, useEffect, useState } from "react";
import { getUser } from "../services/user";
import { Link } from "react-router-dom";
import { getDateString } from "../utils/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailsDropDown from "./detailsDropDown";

function Comment({
  comment,
  onCommentEdit,
  onCommentDelete,
  onCommentReplyTriggerd,
  isOwner,
  currentUser,
}) {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");

  const editInput = useRef(null);

  useEffect(() => {
    (async () => {
      const { user: userID } = comment;
      if (!userID) return;

      try {
        const { data: user } = await getUser(userID);
        setUser(user);
      } catch (error) {
        if (error.response) console.log(error.response.data);
        alert(`Can't get comment.user: ${error.message}`);
      }
    })();
  }, []);

  function triggerEditMode() {
    const _editMode = !editMode;
    editInput.current.value = comment.value;
    setEditMode(_editMode);
  }

  function handleEditInputKeyPress({ key }) {
    if (key !== "Enter") return;
    localEditComment();
  }

  function localEditComment() {
    if (!editMode) return;

    if (editValue.trim() === "") {
      onCommentDelete(comment._id);
    } else {
      if (onCommentEdit(comment._id, editValue)) triggerEditMode();
    }
  }

  function handleEditInputChange({ target }) {
    if (!editMode) return;
    setEditValue(target.value);
  }

  const userProfileURL = `/profile/${user._id}`;

  return (
    comment && (
      <div>
        <div className="d-flex">
          <Link to={userProfileURL}>
            <img
              height={40}
              width={40}
              src={user.avatarPath}
              className="avatar rounded-circle"
            />
          </Link>
          <div className="comment-text ms-3 me-1" style={{ minWidth: 250 }}>
            <div className="d-flex gap-2 align-items-center justify-content-between">
              <Link className="fw-bold text-black" to={userProfileURL}>
                {user.firstName} {user.lastName}
              </Link>
              <small>{getDateString(new Date(comment.publishDate))}</small>
            </div>
            <div className="input-group">
              <input
                type="text"
                style={{ display: editMode ? "block" : "none" }}
                placeholder="Edit this Comment..."
                className="form-control shadow-none"
                onKeyDown={handleEditInputKeyPress}
                onChange={handleEditInputChange}
                ref={editInput}
              />
              <button
                className="btn btn-primary"
                style={{ display: editMode ? "block" : "none" }}
                onClick={localEditComment}
              >
                <FontAwesomeIcon icon="fa-regular fa-paper-plane" />
              </button>
            </div>
            <p style={{ display: editMode ? "none" : "block" }}>
              {comment.value}
            </p>
          </div>
          <div>
            <DetailsDropDown expanderID="commentDetailsCard">
              <div
                className="dropdown-item"
                onClick={() =>
                  onCommentReplyTriggerd(comment._id, user.username)
                }
              >
                Reply
              </div>
              {isOwner && (
                <>
                  <div className="dropdown-item" onClick={triggerEditMode}>
                    Edit
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => onCommentDelete(comment._id)}
                  >
                    Delete
                  </div>
                </>
              )}
            </DetailsDropDown>
          </div>
        </div>
        {getChildComments()?.length ? (
          <div className="d-flex flex-column gap-2 mt-2 ms-5">
            {getChildComments()}
          </div>
        ) : null}
      </div>
    )
  );

  function getChildComments() {
    let children = [];

    for (let i = 0; i < comment.children?.length; i++) {
      const child = comment.children[i];
      if (!child) continue;
      children
        .reverse()
        .push(
          <Comment
            key={child._id}
            comment={child}
            isOwner={currentUser._id === child.user}
            onCommentEdit={onCommentEdit}
            onCommentDelete={onCommentDelete}
            onCommentReplyTriggerd={onCommentReplyTriggerd}
            currentUser={currentUser}
          />
        );
    }

    return children;
  }
}

export default Comment;
