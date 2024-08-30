const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      max: 1,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema({
  root: mongoose.Schema.ObjectId,
  sender: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  value: String,
  reactions: [reactionSchema],
  date: {
    type: Date,
    default: Date.now(),
  },
  files: [
    {
      path: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        require: true,
      },
      cloudID: {
        type: String,
      },
    },
  ],
});

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const Room = mongoose.model(
  "Room",
  new mongoose.Schema({
    members: [memberSchema],
    messages: [messageSchema],
  })
);

async function getRoom(_id) {
  const room = await Room.findById(_id);
  return room;
}

async function getRoomByMembers(_members) {
  const room = await Room.findOne({
    // https://stackoverflow.com/questions/63984650/check-if-all-values-are-in-an-array-in-mongoose
    //"members.user": { $in: _members },
    members: { $size: _members.length },
    "members.user": { $all: _members },
  });
  return room;
}

exports.Room = Room;
exports.getRoom = getRoom;
exports.getRoomByMembers = getRoomByMembers;
