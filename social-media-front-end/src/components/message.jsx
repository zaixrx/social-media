import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Emojis from "./Emojis.jsx";
import DetailsDropDown from "./detailsDropDown.jsx";
import Image from "../common/Image.jsx";

function Message({
  isOwner,
  message,
  onMessageDelete,
  onEditMessage,
  onEmojiSelected,
  onReply,
}) {
  const [editMode, setEditMode] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const editInput = useRef();

  function toggleEditMode() {
    editInput.current.value = message.value;
    setEditMode(!editMode);
  }

  function handleKeyDown({ key }) {
    if (key !== "Enter") return;
    handleEditMessage();
  }

  function handleEditMessage() {
    const { value } = editInput.current;

    if (value.trim()) {
      onEditMessage(message._id, value);
      toggleEditMode();
    } else {
      onMessageDelete(message._id);
    }
  }

  return (
    <div className="d-flex justify-content-end text-end mb-2">
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="w-100"
      >
        <div
          className={`d-flex gap-1 flex-column ${
            isOwner ? "align-items-end" : "align-items-start"
          }`}
        >
          <div
            className={`d-flex flex-column ${
              isOwner ? "align-items-end" : "align-items-start"
            }`}
          >
            {message.root && (
              <div
                className="text-truncate bg-primary-subtle rounded p-2 w-fit-content"
                style={{
                  maxWidth: 250,
                  fontSize: 12,
                }}
              >
                {message.root.value}
              </div>
            )}
            <>
              {isOwner ? (
                <div className="d-flex flex-column align-items-end">
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{ display: editMode ? "block" : "none" }}>
                      <div className="input-group">
                        <input
                          type="text"
                          ref={editInput}
                          placeholder="Edit Message"
                          className="form-control shadow-none"
                          onKeyDown={handleKeyDown}
                        />
                        <button
                          onClick={handleEditMessage}
                          className="btn btn-primary"
                        >
                          <FontAwesomeIcon icon="fa-regular fa-paper-plane" />
                        </button>
                      </div>
                    </div>
                    {message.value && (
                      <div
                        style={{ display: editMode ? "none" : "block" }}
                        className="bg-primary bg-gradient text-white p-2 rounded-2 w-fit-content"
                      >
                        {message.value}
                      </div>
                    )}
                  </div>
                  <EmojieReactionList
                    style={{
                      display: editMode ? "none" : "flex",
                      marginTop: -10,
                    }}
                    message={message}
                    direction="L"
                  />
                </div>
              ) : (
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-2">
                    {message.value && (
                      <div className="bg-secondary bg-gradient text-light p-2 px-3 rounded-2 w-fit-content">
                        {message.value}
                      </div>
                    )}
                  </div>
                  <EmojieReactionList
                    style={{
                      marginTop: -10,
                    }}
                    message={message}
                    direction="R"
                  />
                </div>
              )}
            </>
            <div className="d-flex flex-column gap-2">
              {message.files.map((file, index) => (
                <Image
                  key={index}
                  src={file.path}
                  className="avatar"
                  style={{ maxWidth: 300 }}
                />
              ))}
            </div>
          </div>
          <ReactionList
            isVisible
            isOwner={isOwner}
            onReply={() => onReply(message)}
            onEmojiSelected={(emoji) => onEmojiSelected(message._id, emoji)}
            onMessageDelete={() => onMessageDelete(message._id)}
            onEditModeTriggered={toggleEditMode}
          />
        </div>
      </div>
    </div>
  );
}

function ReactionList({
  isVisible,
  isOwner,
  onReply,
  onEmojiSelected,
  onEditModeTriggered,
  onMessageDelete,
}) {
  return (
    isVisible && (
      <div className="d-flex gap-2">
        <div
          onClick={onReply}
          className="text-secondary btn btn-secondary-soft-hover p-1"
        >
          <FontAwesomeIcon icon="fa-solid fa-reply" />
        </div>
        <Emojis onEmojiSelected={onEmojiSelected} />
        {isOwner && (
          <DetailsDropDown expanderID="commentDetailsCard">
            <div
              className="dropdown-item clickable"
              onClick={onEditModeTriggered}
            >
              Edit
            </div>
            <div className="dropdown-item clickable" onClick={onMessageDelete}>
              Delete
            </div>
          </DetailsDropDown>
        )}
      </div>
    )
  );
}

function EmojieReactionList({ message, direction, ...rest }) {
  return message.reactions.length ? (
    <div
      className={`gap-1 bg-${
        direction === "L" ? "primary" : "secondary"
      } bg-gradient rounded-5 w-fit-content p-1`}
      {...rest}
    >
      {message.reactions.map((reaction, index) => (
        <span key={index}>{reaction.emoji}</span>
      ))}
    </div>
  ) : undefined;
}

export default Message;
