const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { create_token } = require("../lib/token_manager");
const { modelName } = require("../utils/constant");

const findUser = async (payload) => {
  try {
    return await mongoService.findOne(modelName.USER, payload);
  } catch (error) {
    throw error;
  }
};

const registerUser = async (payload) => {
  try {
    return await mongoService.createOne(modelName.USER, payload);
  } catch (error) {
    throw error;
  }
};

const create_jwt_token = async (payload) => {
  try {
    return await create_token(payload);
  } catch (error) {
    throw error;
  }
};

const updateUser = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.USER, query, payload, {});
  } catch (error) {
    throw error;
  }
};

const findUserIdBySearch = async (userId, regexStr) => {
  try {
    const pipeline = [
      {
        $match: {
          user_name: { $regex: regexStr, $options: "i" },
          _id: {
            $ne: new mongoose.Types.ObjectId(userId),
          },
          is_active: true,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "chats",
          let: { otherUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$$otherUserId", "$participants"],
                    },
                    {
                      $in: [
                        new mongoose.Types.ObjectId(userId),
                        "$participants",
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "existingChat",
        },
      },

      {
        $lookup: {
          from: "requests",
          let: { otherUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$sender_id", new mongoose.Types.ObjectId(userId)],
                    },
                    {
                      $eq: ["$receiver_id", "$$otherUserId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "outgoingRequests",
        },
      },

      {
        $lookup: {
          from: "requests",
          let: { otherUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$sender_id", "$$otherUserId"],
                    },
                    {
                      $eq: [
                        "$receiver_id",
                        new mongoose.Types.ObjectId(userId),
                      ],
                    },
                    { $eq: ["$status", "pending"] },
                  ],
                },
              },
            },
          ],
          as: "incomingRequests",
        },
      },
      {
        $addFields: {
          request_sent: {
            $cond: {
              if: {
                $gt: [{ $size: "$outgoingRequests" }, 0],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $match: {
          "incomingRequests.0": { $exists: false },
        },
      },

      {
        $project: {
          existingChat: 0,
          password: 0,
          email: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          active_status: 0,
          contacts: 0,
          outgoingRequests: 0,
          incomingRequests: 0,
        },
      },
    ];

    return await mongoService.aggregation(modelName.USER, pipeline);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findUser,
  registerUser,
  create_jwt_token,
  updateUser,
  findUserIdBySearch,
};
