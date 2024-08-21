import React, { useState, useEffect, useRef } from "react";
import {
  deleteMessage,
  sendMessage,
  editMessage,
  start,
  messageEmoji,
} from "../services/chat";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Message from "../components/message";
import { getFileUrl } from "../utils/file";
import { showMessage } from "../utils/logging";

function Chat({ user }) {
  const MAX_FILES_LENGTH = 4;
  const MAX_FILE_SIZE_IN_MEGABYTE = 20;

  const [messages, setMessages] = useState([]);
  const [contactedMember, setContactedMember] = useState({});
  const [reply, setReply] = useState();
  const [files, setFiles] = useState([]);
  const { _id } = useParams();

  const messageInput = useRef();
  const fileInput = useRef();

  useEffect(() => {
    start(
      user._id,
      _id,
      handleRoomReceive,
      handleMessageReceive,
      handleMessageDeleteReceive,
      handleMessageEditReceive,
      handleMessageEmojiReceive
    );
  }, []);

  useEffect(() => {
    if (!files.length === 0) return;

    (async () => {
      const _files = [...files];

      for (let i = 0; i < files.length; i++) {
        const file = _files[i];
        file.url = await getFileUrl(file.data);
      }

      setFiles(_files);
    })();
  }, [files.length]);

  function handleRoomReceive(room) {
    const contactedMember = room.members.find((member) => {
      return member.user._id === _id;
    });
    setContactedMember(contactedMember);
    setMessages(room.messages);
  }

  function handleMessageReceive(message) {
    setMessages((_messages) => [..._messages, message]);
  }

  function handleMessageDeleteReceive(messageID) {
    setMessages((messages) => {
      const message = messages.filter((message) => message._id === messageID);
      if (!message) return;
      const _messages = [...messages];
      _messages.splice(_messages.indexOf(message), 1);
      return _messages;
    });
  }

  function handleMessageEditReceive(messageID, newMessage) {
    setMessages((messages) => {
      if (messages.length === 0) return;

      const _messages = [...messages];
      const index = _messages.indexOf(
        _messages.find((message) => message._id === messageID)
      );

      if (index === -1) return;

      _messages[index].value = newMessage;
      return _messages;
    });
  }

  function handleMessageEmojiReceive(messageID, senderID, messageReaction) {
    setMessages((messages) => {
      const _messages = [...messages];
      const message = _messages.find((m) => m._id === messageID);
      if (!message) return;

      const reaction = message.reactions.find((r) => r.user === senderID);

      if (!messageReaction) {
        message.reactions.splice(message.reactions.indexOf(reaction), 1);
      } else {
        if (reaction) {
          reaction.emoji = messageReaction.emoji;
        } else {
          message.reactions.push(messageReaction);
        }
      }

      return _messages;
    });
  }

  async function handleMessageSend() {
    const message = messageInput.current.value;
    if (!message.trim() && !files.length) return;
    files.forEach((file) => delete file.url);
    await sendMessage(message, reply?._id, files);

    // reset
    messageInput.current.value = "";
    setFiles([]);
    setReply(null);
  }

  async function handleMessageDeleteSend(messageID) {
    await deleteMessage(messageID);
  }

  async function handleMessageEmojiSend(messageID, emoji) {
    const message = messages.find((m) => m._id === messageID);
    let _emoji = message.reactions.find(
      (r) => r.user === user._id && r.emoji === emoji
    );

    await messageEmoji(messageID, _emoji ? "" : emoji);
  }

  async function handleReplySelect(message) {
    setReply(message);
    messageInput.current.focus();
  }

  function addFiles(newFiles) {
    if (files.length >= MAX_FILES_LENGTH) return;
    if (reply) setReply(false);

    setFiles((_files) => {
      const pushFile = (file) => {
        if (file.size / (1024 * 1024) > MAX_FILE_SIZE_IN_MEGABYTE)
          return showMessage(
            `You have excedded tha maximum file size (${MAX_FILE_SIZE_IN_MEGABYTE}MB)`
          );

        _files.push({
          data: file,
          type: file.type,
        });
      };

      const filesLength = _files.length;
      const newLength = filesLength + newFiles.length;

      const availabe = MAX_FILES_LENGTH - filesLength;
      if (availabe > 0 && newLength > MAX_FILES_LENGTH) {
        for (let i = 0; i < availabe; i++) {
          const currentFile = newFiles[i];
          pushFile(currentFile);
        }
      } else {
        const _newFiles = [];
        newFiles.forEach((file) => {
          pushFile(file);
        });
        _files = [...files, ..._newFiles];
      }

      return _files;
    });
  }

  return (
    contactedMember.user && (
      <div className="container my-2">
        <div className="card flex-grow-1">
          <div className="card-header">
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <img
                  src={contactedMember.user.avatarPath}
                  height={70}
                  width={70}
                  className="rounded-circle avatar"
                />
                {contactedMember.isActive && (
                  <span className="position-absolute bottom-0 end-0 p-2 border border-2 border-white bg-success rounded-circle" />
                )}
              </div>
              <Link
                className="text-black"
                to={`/profile/${contactedMember.user._id}`}
              >
                <h4 className="m-0">{`${contactedMember.user.firstName} ${contactedMember.user.lastName}`}</h4>
                <p>{contactedMember.isActive ? "Active now" : "Offline"}</p>
              </Link>
            </div>
          </div>
          <div className="card-body">
            {messages?.map((message) => (
              <Message
                key={message._id}
                isOwner={message.sender._id === user._id}
                message={message}
                onMessageDelete={handleMessageDeleteSend}
                onEditMessage={async (messageID, newMessage) =>
                  await editMessage(messageID, newMessage)
                }
                onEmojiSelected={handleMessageEmojiSend}
                onReply={handleReplySelect}
              />
            ))}
          </div>
          <div className="card-footer bg-white overflow-auto">
            {reply && (
              <div className="d-flex justify-content-between w-100">
                <div>
                  <span className="fs-5">
                    Replying to <b>{reply.sender.username}</b>
                  </span>
                  <p>{reply.value || "Replying to attachement"}</p>
                </div>
                <button
                  onClick={() => setReply(null)}
                  className="mt-1 btn-close shadow-none"
                />
              </div>
            )}
            {files.length > 0 && (
              <div className="py-2 d-flex gap-3 w-100">
                {files.map((file, index) => (
                  <div key={index} className="position-relative">
                    <img
                      src={file.url}
                      height={100}
                      width={100}
                      className="rounded-4 avatar border border-secondary border-2"
                    />
                    <div
                      className="rounded-circle clickable bg-secondary text-white fs-5 d-flex align-items-center justify-content-center"
                      style={{
                        width: 25,
                        height: 25,
                        position: "absolute",
                        top: 0,
                        right: 0,
                        marginTop: -8,
                        marginRight: -8,
                      }}
                      onClick={() =>
                        setFiles((files) => {
                          const _files = [...files];
                          _files.splice(index, 1);
                          return files.length === 1 ? [] : _files;
                        })
                      }
                    >
                      <FontAwesomeIcon icon="fa-solid fa-xmark" />
                    </div>
                  </div>
                ))}
                {files.length < MAX_FILES_LENGTH && (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-4 fs-1 text-secondary clickable bg-white border border-secondary border-2"
                    style={{ height: 100, width: 100 }}
                    onClick={() => fileInput.current.click()}
                  >
                    <FontAwesomeIcon icon="fa-regular fa-image" />
                  </div>
                )}
              </div>
            )}
          </div>
          <SendInput
            fileInputRef={fileInput}
            innerRef={messageInput}
            onSendAsync={handleMessageSend}
            onFilesChange={addFiles}
            className="px-3 pb-3"
          />
        </div>
      </div>
    )
  );
}

function SendInput({
  innerRef,
  onSendAsync,
  onFilesChange,
  className,
  fileInputRef,
  ...rest
}) {
  return (
    <div className={`input-group position-relative ${className}`}>
      <input
        ref={innerRef}
        onKeyDown={async ({ key }) => {
          if (key !== "Enter") return;
          await onSendAsync();
        }}
        className="form-control shadow-none"
        placeholder="Send a Message..."
        {...rest}
      />
      <div
        className="bg-body border-start-0 border-top border-bottom btn text-secondary"
        onClick={() => fileInputRef.current.click()}
      >
        <FontAwesomeIcon icon="fa-regular fa-image" />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={({ target }) => {
            if (target.files.length === 0) return;
            const _files = [...target.files];
            const files = _files.length > 4 ? _files.slice(0, 4) : _files;
            onFilesChange(files);
          }}
          multiple
        />
      </div>
      <button className="btn btn-primary border-end-0" onClick={onSendAsync}>
        <FontAwesomeIcon icon="fa-regular fa-paper-plane" />
      </button>
    </div>
  );
}

export default Chat;
