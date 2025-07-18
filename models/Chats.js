const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const chatSchema = mongoose.Schema(
  {
    is_group: { type: Boolean, default: false },
    name: {
      type: String,
      required: function () {
        return this.is_group;
      },
    }, // only for groups
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    latest_message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.CHAT, chatSchema);
