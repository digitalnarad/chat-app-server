const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const messageSchema = mongoose.Schema(
  {
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    }, // chat_id hold both user identity
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // it for find whose are send message in two user by chat
    type: {
      type: String,
      enum: ["text", "image", "file", "join-chat"],
      default: "text",
    },
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // handle massage seen or note
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.MESSAGE, messageSchema);
