import React, { Component, createRef } from "react";
import { getUser } from "../services/user";
import { Link } from "react-router-dom";
import DetailsDropDown from "../common/detailsDropDown";

class Comment extends Component {
  state = {
    _id: "",
    user: {},
    editMode: false,
    editValue: "",
  };

  editInput = createRef(null);

  async componentDidMount() {
    const { user: userID, _id } = this.props.data;
    if (!userID) return;

    try {
      const { data: user } = await getUser(userID);
      if (user) this.setState({ user, _id });
    } catch {}
  }

  triggerEditMode = () => {
    const editMode = !this.state.editMode;
    this.editInput.current.value = this.props.data.comment;
    this.setState({ editMode });
  };

  handleEditInputKeyPress = ({ keyCode }) => {
    const { editMode, editValue } = this.state;
    if (!editMode || keyCode !== 13) return;
    const { data } = this.props;
    const { onCommentDelete, onCommentEdit } = this.props;

    if (editValue.trim() === "") {
      onCommentDelete(data._id);
    } else {
      if (onCommentEdit(data._id, editValue)) this.triggerEditMode();
    }
  };

  handleEditInputChange = ({ target }) => {
    const { editMode } = this.state;
    if (!editMode) return;

    this.setState({ editValue: target.value });
  };

  render() {
    const { user, editMode } = this.state;
    const { data, onCommentDelete, isOwner } = this.props;

    const userProfileURL = `/profile/${user._id}`;

    return (
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
            onKeyDown={this.handleEditInputKeyPress}
            onChange={this.handleEditInputChange}
            ref={this.editInput}
          />
          <p style={{ display: editMode ? "none" : "block" }}>{data.comment}</p>
        </div>
        {isOwner && (
          <DetailsDropDown>
            <div className="dropdown-item" onClick={this.triggerEditMode}>
              Edit
            </div>
            <div
              className="dropdown-item"
              onClick={() => onCommentDelete(data._id)}
            >
              Delete
            </div>
          </DetailsDropDown>
        )}
      </div>
    );
  }
}

export default Comment;
