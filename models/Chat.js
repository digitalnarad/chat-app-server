const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const chatSchema = mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String }, // only for groups
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.CHAT, chatSchema);
