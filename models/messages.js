const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const messageSchema = mongoose.Schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message_type: {
      type: String,
      enum: ["text", "image", "file", "join-chat"],
      default: "text",
    },
    message: { type: String, required: true },
    read_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    index: [
      // For fetching chat messages in chronological order
      { chat_id: 1, createdAt: -1 },

      // For unread message tracking
      { chat_id: 1, readBy: 1 },

      // For sender-specific queries with timestamps
      { sender: 1, createdAt: -1 },
    ],
  }
);

module.exports = mongoose.model(modelName.MESSAGE, messageSchema);
