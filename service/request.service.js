const { modelName } = require("../utils/constant");
const mongoService = require("../config/mongoService");
const { default: mongoose } = require("mongoose");

const findRequestsByUser = async (user_id) => {
  try {
    const pipeline = [
      {
        $match: {
          receiver_id: new mongoose.Types.ObjectId(user_id),
          status: "pending",
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: modelName.USER,
          localField: "sender_id",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $unwind: {
          path: "$senderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    return await mongoService.aggregation(modelName.REQUEST, pipeline);
  } catch (error) {
    throw error;
  }
};

const findOneRequests = async (payload) => {
  try {
    return await mongoService.findOne(modelName.REQUEST, payload);
  } catch (error) {
    throw error;
  }
};

const createRequest = async (payload) => {
  try {
    return await mongoService.createOne(modelName.REQUEST, payload);
  } catch (error) {
    throw error;
  }
};

const updateRequest = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.REQUEST, query, payload, {});
  } catch (error) {
    throw error;
  }
};

const deleteRequest = async (query) => {
  try {
    return await mongoService.deleteDocument(modelName.REQUEST, query);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findRequestsByUser,
  findOneRequests,
  createRequest,
  updateRequest,
  deleteRequest,
};
