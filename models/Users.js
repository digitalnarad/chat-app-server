const mongoose = require("mongoose");
const { modelName } = require("../utils/constant");

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    user_name: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    active_status: {
      status: {
        type: String,
        enum: ["online", "offline", "away"],
        default: "offline",
      },
      at: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(modelName.USER, userSchema);
