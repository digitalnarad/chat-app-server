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

const findMessagesByChat = async (
  chat_id,
  { page, limit, lastMessageTime = null }
) => {
  try {
    const skip = (page - 1) * limit;

    const matchStage = { chat_id: new mongoose.Types.ObjectId(chat_id) };

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1, _id: -1 } },
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

const deleteMessage = async (query) => {
  try {
    return await mongoService.deleteDocument(modelName.MESSAGE, query);
  } catch (error) {
    throw error;
  }
};

const deleteMessagesByChat = async (chat_id) => {
  try {
    return await mongoService.deleteDocument(modelName.MESSAGE, {
      chat_id: new mongoose.Types.ObjectId(chat_id),
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findMessage,
  registerMessage,
  updateMessage,
  findMessagesByChat,
  deleteMessage,
  deleteMessagesByChat,
};
