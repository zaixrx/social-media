import React, { useRef, useEffect, useState } from "react";
import { getUser } from "../services/user";
import { Link } from "react-router-dom";
import { getDateString } from "../utils/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailsDropDown from "./detailsDropDown";

function Comment({ comment, onCommentEdit, onCommentDelete, isOwner }) {
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
      <div className="d-flex gap-2 border-top py-3">
        <Link to={userProfileURL}>
          <img
            height={35}
            width={35}
            src={user.avatarPath}
            className="avatar rounded-circle"
          />
        </Link>
        <div className="comment-text">
          <div className="d-flex align-items-center">
            <Link className="fs-6 fw-bold text-black" to={userProfileURL}>
              @{user.username}
            </Link>
            <small className="dot">
              {getDateString(new Date(comment.publishDate))}
            </small>
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
        {isOwner && (
          <DetailsDropDown expanderID="commentDetailsCard">
            <div className="dropdown-item" onClick={triggerEditMode}>
              Edit
            </div>
            <div
              className="dropdown-item"
              onClick={() => onCommentDelete(comment._id)}
            >
              Delete
            </div>
          </DetailsDropDown>
        )}
      </div>
    )
  );
}

export default Comment;
