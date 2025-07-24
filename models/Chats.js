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
  {
    timestamps: true,
    indexes: [
      // Critical for user chat retrieval
      { participants: 1 },

      // Compound index for sorting
      { participants: 1, updatedAt: -1 },

      // Optimize last message lookups
      { latest_message: 1 },
    ],
  }
);

module.exports = mongoose.model(modelName.CHAT, chatSchema);
