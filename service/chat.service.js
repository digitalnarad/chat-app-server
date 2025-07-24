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
  try {
    const _id = new mongoose.Types.ObjectId(userId);
    const pipeline = [
      // 1. Match chats containing current user
      { $match: { participants: _id } },

      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id", userId: _id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$chat_id", "$$chatId"] },
                    { $ne: ["$sender", "$$userId"] },
                    { $not: { $in: ["$$userId", "$read_by"] } },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unread",
        },
      },

      // 3. Handle participants for 1:1 chats
      {
        $addFields: {
          // Extract the other participant ID (non-current user)
          otherParticipantId: {
            $cond: [
              { $not: "$is_group" }, // Only for 1:1 chats
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participants",
                      as: "pid",
                      cond: { $ne: ["$$pid", _id] },
                    },
                  },
                  0, // Get first element (the other user)
                ],
              },
              null, // For group chats
            ],
          },
        },
      },

      // 4. Lookup other participant details
      {
        $lookup: {
          from: "users",
          localField: "otherParticipantId",
          foreignField: "_id",
          as: "participantDetails",
        },
      },

      // 5. Lookup last message
      {
        $lookup: {
          from: "messages",
          localField: "latest_message",
          foreignField: "_id",
          as: "lastMessage",
        },
      },

      // 6. Format fields
      {
        $addFields: {
          unread_count: {
            $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0],
          },
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
          participant: { $arrayElemAt: ["$participantDetails", 0] },
        },
      },

      // 7. Final projection
      {
        $project: {
          _id: 1,
          is_group: 1,
          name: 1,
          updatedAt: 1,
          unread_count: 1,
          lastMessage: "$lastMessage.message",
          participant: {
            $cond: {
              if: "$is_group",
              then: null,
              else: {
                _id: "$participant._id",
                first_name: "$participant.first_name",
                last_name: "$participant.last_name",
                active_status: "$participant.active_status",
              },
            },
          },
        },
      },

      // 8. Sort by recent activity
      { $sort: { updatedAt: -1 } },
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
