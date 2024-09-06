import { io } from "socket.io-client";
import { showMessage } from "../utils/logging.js";

let socket = undefined;
let serverSocketID = undefined;
let room = undefined;
let userID = undefined;

export function start(
  _userID,
  _userContactID,
  roomReceiveHandler,
  messageReceivedHandler,
  messageDeletedHandler,
  messageEditedHandler,
  messageEmojiHandler
) {
  try {
    socket = io(process.env.REACT_APP_SOCKET_URL);
    userID = _userID;

    socket.emit("join", _userID);

    socket.on("join-received", async (socketID) => {
      serverSocketID = socketID;
      await sendDemandRoomRequest([_userID, _userContactID]);
    });

    socket.on("demand-room-handled", (_room) => {
      room = _room;
      room.messages.forEach((message) => {
        message = prepareMessage(message);
        message.sent = true;
      });
      roomReceiveHandler(_room);
    });

    socket.on("message", (message) => {
      message = prepareMessage(message);
      messageReceivedHandler(message);
    });

    socket.on("message-deleted", (messageID) => {
      messageDeletedHandler(messageID);
    });

    socket.on("message-edited", (messageID, newMessage) => {
      messageEditedHandler(messageID, newMessage);
    });

    socket.on("message-emoji", (messageID, senderID, messageReaction) => {
      messageEmojiHandler(messageID, senderID, messageReaction);
    });

    socket.on("error", (message) => {
      showMessage(message);
    });
  } catch (error) {
    console.log("Error", error.message);
  }
}

export async function sendDemandRoomRequest(members) {
  if (!members || members.length < 2) return;
  await socket.emit("demand-room", members, serverSocketID);
}

export async function sendMessageRequest(
  desiredID,
  message,
  rootMessage,
  files
) {
  if ((!message.trim() && !files.length) || !socket || !room) return;
  await socket.emit(
    "message",
    desiredID,
    message,
    userID,
    room._id,
    rootMessage,
    files
  );
}

export async function sendMessageDeleteRequest(messageID) {
  if (!messageID) return;
  await socket.emit("message-delete", messageID, userID, room._id);
}

export async function sendMessageEditRequest(messageID, newMessage) {
  if (!messageID) return;
  await socket.emit("message-edit", messageID, newMessage, userID, room._id);
}

export async function sendMessageEmojiReactionRequest(messageID, messageEmoji) {
  if (!messageID) return;
  await socket.emit("message-emoji", messageID, messageEmoji, userID, room._id);
}

function prepareMessage(message) {
  const member = room.members.find(
    (member) => member.user._id === message.sender
  );
  message.sender = member.user;

  if (message.root) {
    const root = room.messages.find((m) => m._id === message.root);
    message.root = root;
  }

  return message;
}
