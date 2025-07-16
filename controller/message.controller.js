const { response400, response200 } = require("../lib/response-messages");
const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { chat_services, message_services } = require("../service");
const { msg } = require("../utils/constant");

const createMessage = catchAsyncFunc(async (req, res) => {
  const userId = req.userId;
  const { chat_id } = req.body;

  const messageData = req.body;
  messageData.sender = userId;

  const message = await message_services.registerMessage(messageData);
  if (!message) return response400(res, msg.messageCreationFailed);

  return response200(res, msg.messageCreatedSuccess, message);
});

const fetchAllMessages = catchAsyncFunc(async (req, res) => {
  const { id: chat_id } = req.params;
  const { limit = 10, page = 1 } = req.query;

  const chat = await chat_services.findChat({ _id: chat_id });
  if (!chat) return response400(res, msg.chatNotFound);

  const messages = await message_services.findMessagesByChat(chat_id, {
    limit: parseInt(limit),
    page: parseInt(page),
  });
  if (!messages) return response400(res, msg.messageFetchFailed);

  return response200(res, msg.messageFetchSuccess, messages);
});

const fetchMessagesByChat = catchAsyncFunc(async (req, res) => {
  const { chat_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const chat = await chat_services.findChat({ _id: chat_id });
  if (!chat) return response400(res, msg.chatNotFound);

  const messages = await message_services.findMessagesByChat({
    chat_id,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  if (!messages) return response400(res, msg.messageFetchFailed);

  return response200(res, msg.messageFetchSuccess, messages);
});
module.exports = {
  createMessage,
  fetchAllMessages,
  fetchMessagesByChat,
};
