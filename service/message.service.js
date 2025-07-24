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
    const skip = (page - 1) * limit;

    return await mongoService.findPaginateQuery(
      modelName.MESSAGE,
      { chat_id: new mongoose.Types.ObjectId(chat_id) },
      { createdAt: -1 },
      limit,
      skip
    );
  } catch (error) {
    throw error;
  }
};

const getUnreadMessageCountByCHatId = async (chat_id, receiver_id) => {
  try {
    return await mongoService.countDocument(modelName.MESSAGE, {
      chat_id: new mongoose.Types.ObjectId(chat_id),
      sender: { $ne: new mongoose.Types.ObjectId(receiver_id) },
      read_by: {
        $not: { $elemMatch: { $eq: new mongoose.Types.ObjectId(receiver_id) } },
      },
    });
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

const markMessagesAsRead = async (chat_id, user_id) => {
  try {
    const chatIdObj = new mongoose.Types.ObjectId(chat_id);
    const userIdObj = new mongoose.Types.ObjectId(user_id);

    const updatedIds = await mongoService.updateMany(
      modelName.MESSAGE,
      {
        chat_id: chatIdObj,
        sender: { $ne: userIdObj }, // Exclude user's own messages
        read_by: {
          $not: { $elemMatch: { $eq: userIdObj } }, // Correct array check
        },
      },
      {
        $addToSet: { read_by: userIdObj }, // Proper array update
      }
    );
    return updatedIds;
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
  getUnreadMessageCountByCHatId,
  markMessagesAsRead,
};
