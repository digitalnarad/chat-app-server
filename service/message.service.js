const { default: mongoose } = require("mongoose");
const mongoService = require("../config/mongoService");
const { modelName } = require("../utils/constant");

const findMessage = async (payload) => {
  try {
    return await mongoService.findOne(modelName.MESSAGE, payload);
  } catch (error) {
    throw error;
  }
};

const findMessagesByChat = async (chat_id, { page, limit }) => {
  try {
    const _id = new mongoose.Types.ObjectId(chat_id);
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { chat_id: _id } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    return await mongoService.aggregation(modelName.MESSAGE, pipeline);
  } catch (error) {
    throw error;
  }
};

const registerMessage = async (payload) => {
  try {
    return await mongoService.createOne(modelName.MESSAGE, payload);
  } catch (error) {
    throw error;
  }
};

const updateMessage = async (query, payload) => {
  try {
    return await mongoService.updateOne(modelName.MESSAGE, query, payload, {});
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findMessage,
  registerMessage,
  updateMessage,
  findMessagesByChat,
};
