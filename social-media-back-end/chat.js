const { getRoomByMembers, getRoom, Room } = require("./models/room.js");
const { createFile, deleteFile } = require("./utils/file.js");

const emojis = ["", "👍", "❤", "😂", "😡"];

module.exports = function (server) {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
    maxHttpBufferSize: 2e7,
  });

  /* 
    client: {
      _id: "USER_ID",
      socket: Object,
    }

    room: {
      _id: "The Room Id",
      clients: {
        1: "USER_ID",
        2: "USER_ID",
        ...
      }
    }
  */

  const clients = [];

  io.on("connection", (socket) => {
    const index = clients.length;
    let client = undefined;

    socket.on("join", (_id) => {
      client = {
        _id,
        socket,
      };

      clients.push(client);
      socket.emit("join-received", socket.id);
    });

    socket.on("disconnect", () => {
      if (!client) return;
      clients.splice(index, 1);
    });

    socket.on("demand-room", async (_ids, socketID) => {
      const roomDocument = await getRoomByMembers(_ids);
      const roomMembers = [];

      // _ids => exsiting members ids
      // clients => exsiting && online members
      _ids.forEach((_id) => {
        const isActive =
          clients.find((client) => client._id === _id) !== undefined;

        roomMembers.push({ user: _id, isActive });
      });

      await setupRoom(roomMembers, socketID, roomDocument);
    });

    async function setupRoom(roomMembers, socketID, roomDocument) {
      const members = roomMembers.map((member) => {
        return {
          user: member.user,
          isActive: member.isActive,
        };
      });

      if (roomDocument) {
        roomMembers.forEach((member) => {
          const dbMember = roomDocument.members.find(
            (m) => m.user.toString() === member.user
          );
          const index = roomDocument.members.indexOf(dbMember);
          roomDocument.members[index].isActive = member.isActive;
        });
      }

      const room = roomDocument || new Room({ members });
      await room.populate({
        path: "members",
        populate: {
          path: "user",
          model: "User",
        },
      });
      await room.save();

      roomMembers.forEach((member) => {
        const clientOfMember = clients.find(
          (client) =>
            client._id === member.user && client.socket.id === socketID
        );

        if (!clientOfMember) return;

        clientOfMember.socket.emit("demand-room-handled", room);
      });
    }

    socket.on(
      "message",
      async (messageValue, senderID, roomID, messageRootID, messageFiles) => {
        if (!roomID) return error("The Room Id is undefined.");

        const room = await getRoom(roomID);
        if (!room)
          return error("The Room Id doesn't correspond to any exsisting Room.");

        if (
          messageRootID &&
          !room.messages.find((m) => m._id.toString() === messageRootID)
        )
          return error(
            "The replied Message id doesn't correspond to any existing Message"
          );

        // I did this to let the mongodb driver generate the message _id.
        const messageIndex =
          room.messages.push({
            root: messageRootID,
            sender: senderID,
            value: messageValue,
            date: Date.now(),
          }) - 1;
        const message = room.messages[messageIndex];

        if (messageFiles?.length) {
          for (let i = 0; i < messageFiles.length; i++) {
            const file = messageFiles[i];
            const fileName = `${message._id}_${i}.${file.extension}`;

            const directoryCreatedSuccessfully = createFile(
              file.data,
              fileName,
              `./public/chat/${room._id}/`,
              error
            );

            if (!directoryCreatedSuccessfully && !messageValue.trim())
              return console.log(directoryCreatedSuccessfully);

            message.files.push({
              path: `${process.env.PROTOCOL}://${process.env.HOST_NAME}/chat/${roomf_id}/${fileName}`,
              type: file.type,
            });
          }
        }

        room.members.map((member) => {
          // clientsOfMember means all the client's that are connected with the same member aka user.
          // That's why I used the filter() method rather then find().
          const clientsOfMember = clients.filter(
            (client) => client._id === member.user.toString()
          );

          // If there are no clients connected with the same member aka user.
          if (clientsOfMember.length === 0) return;

          clientsOfMember.forEach(({ socket }) => {
            socket.emit("message", message);
          });
        });

        await room.save();
      }
    );

    socket.on("message-delete", async (messageID, senderID, roomID) => {
      if (!roomID) return error("The Room Id is undefined.");

      const room = await getRoom(roomID);
      if (!room)
        return error("The Room Id doesn't correspond to an exsisting Room.");

      const message = room.messages.find(
        (message) => message._id.toString() === messageID
      );
      if (!message)
        return error(
          "The Message Id doesn't correspond to an exsisting Message in this Room."
        );

      if (message.sender.toString() !== senderID)
        return error("Only the owner can delete this Message.");

      if (message.files.length) {
        message.files.forEach((file) => {
          const path = file.path.replace(
            `http://${process.env.HOST_NAME}`,
            "./public"
          );

          deleteFile(path, error);
        });
      }

      const index = room.messages.indexOf(message);
      room.messages.splice(index, 1);

      await room.save();

      room.members.map((member) => {
        // clientsOfMember means all the client's that are connected with the same member.
        // That's why I used the filter() method rather then find().
        const clientsOfMember = clients.filter(
          (client) => client._id === member.user.toString()
        );

        // If there are no clients connected with the same member.
        if (clientsOfMember.length === 0) return;

        clientsOfMember.forEach(({ socket }) => {
          socket.emit("message-deleted", messageID);
        });
      });
    });

    socket.on(
      "message-edit",
      async (messageID, newMessage, senderID, roomID) => {
        if (!newMessage.trim()) return error("Message is empty");

        if (!roomID) return error("The Room Id is undefined.");

        const room = await getRoom(roomID);
        if (!room)
          return error("The Room Id doesn't correspond to an exsisting Room.");

        const message = room.messages.find(
          (message) => message._id.toString() === messageID
        );
        if (!message)
          return error(
            "The Message Id doesn't correspond to an exsisting Message in this Room."
          );

        if (message.sender.toString() !== senderID)
          return error("Only the owner can edit this Message.");

        message.value = newMessage;

        await room.save();

        room.members.map((member) => {
          const clientsOfMember = clients.filter(
            (client) => client._id === member.user.toString()
          );

          if (clientsOfMember.length === 0) return;

          clientsOfMember.forEach(({ socket }) => {
            socket.emit("message-edited", messageID, newMessage);
          });
        });
      }
    );

    socket.on(
      "message-emoji",
      async (messageID, messageEmoji, senderID, roomID) => {
        if (!emojis.includes(messageEmoji)) return error("Emoji is not valid.");

        if (!roomID) return error("The Room Id is undefined.");

        const room = await getRoom(roomID);
        if (!room)
          return error("The Room Id doesn't correspond to an exsisting Room.");

        const message = room.messages.find(
          (message) => message._id.toString() === messageID
        );
        if (!message)
          return error(
            "The Message Id doesn't correspond to an exsisting Message in this Room."
          );

        let messageReaction = message.reactions.find(
          (reaction) => reaction.user.toString() === senderID
        );

        if (!messageEmoji) {
          message.reactions.splice(
            message.reactions.indexOf(messageReaction),
            1
          );
          messageReaction = null;
        } else {
          if (messageReaction) {
            messageReaction.emoji = messageEmoji;
          } else {
            messageReaction = {
              user: senderID,
              emoji: messageEmoji,
            };
            message.reactions.push(messageReaction);
          }
        }

        await room.save();

        room.members.map((member) => {
          const clientsOfMember = clients.filter(
            (client) => client._id === member.user.toString()
          );

          if (clientsOfMember.length === 0) return;

          clientsOfMember.forEach(({ socket }) => {
            socket.emit("message-emoji", messageID, senderID, messageReaction);
          });
        });
      }
    );

    function error(message) {
      socket.emit("error", message);
      return false;
    }
  });
};
