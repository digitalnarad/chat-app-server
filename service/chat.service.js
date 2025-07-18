const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const findChat = async (payload) => {
  try {
    return await mongoService.findOne(modelName.CHAT, payload);
  } catch (error) {
    throw error;
  }
};

const findChatsByUser = async (userId) => {
  console.log("userId", userId);
  try {
    const _id = new mongoose.Types.ObjectId(userId);
    const pipeline = [
      { $match: { participants: _id } },
      {
        $addFields: {
          participantIds: {
            $cond: [
              { $eq: ["$is_group", false] },
              {
                $filter: {
                  input: "$participants",
                  as: "pid",
                  cond: {
                    $ne: ["$$pid", _id],
                  },
                },
              },
              "$participants",
            ],
          },
        },
      },
      {
        $lookup: {
          from: modelName.USER,
          localField: "participantIds",
          foreignField: "_id",
          as: "participantsDetails",
        },
      },

      { $unwind: "$participantsDetails" },

      {
        $lookup: {
          from: modelName.MESSAGE,
          localField: "latest_message",
          foreignField: "_id",
          as: "lastMessage",
        },
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          _id: 1,
          is_group: 1,
          lastMessage: 1,
          updatedAt: 1,

          participant: {
            _id: "$participantsDetails._id",
            first_name: "$participantsDetails.first_name",
            last_name: "$participantsDetails.last_name",
            email: "$participantsDetails.email",
            active_status: "$participantsDetails.active_status",
          },
        },
      },
    ];
    return await mongoService.aggregation(modelName.CHAT, pipeline);
  } catch (error) {
    throw error;
  }
};

const registerChat = async (payload) => {
  try {
    return await mongoService.createOne(modelName.CHAT, payload);
  } catch (error) {
    throw error;
  }
};

const updateChat = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.CHAT, query, payload, {});
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findChat,
  registerChat,
  updateChat,
  findChatsByUser,
};
