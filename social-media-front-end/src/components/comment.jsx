import React, { useRef, useEffect, useState } from "react";
import { getUser } from "../services/user";
import { Link } from "react-router-dom";
import DetailsDropDown from "../common/detailsDropDown";

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

  function handleEditInputKeyPress({ keyCode }) {
    if (!editMode || keyCode !== 13) return;

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
          <Link className="fs-6 fw-bold text-black" to={userProfileURL}>
            @{user.username}
          </Link>
          <input
            type="text"
            placeholder="Edit this Comment..."
            style={{ display: editMode ? "block" : "none" }}
            className="form-control shadow-none"
            onKeyDown={handleEditInputKeyPress}
            onChange={handleEditInputChange}
            ref={editInput}
          />
          <p style={{ display: editMode ? "none" : "block" }}>
            {comment.value}
          </p>
        </div>
        {isOwner && (
          <DetailsDropDown>
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
