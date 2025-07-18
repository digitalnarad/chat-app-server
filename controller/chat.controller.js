const { response400, response200 } = require("../lib/response-messages");
const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { chat_services } = require("../service");
const { msg } = require("../utils/constant");

const createChat = catchAsyncFunc(async (req, res) => {
  const userId = req.userId;
  console.log("userId", userId);

  const chatData = req.body;
  chatData.participants = chatData.participants || [];
  chatData.participants.push(userId);

  const chat = await chat_services.registerChat(chatData);
  if (!chat.length === 0) return response400(res, msg.chatCreationFailed);

  return response200(res, msg.chatCreatedSuccess, chat);
});

const fetchAllChats = catchAsyncFunc(async (req, res) => {
  const userId = req.userId;
  const chats = await chat_services.findChatsByUser(userId);
  if (!chats) return response400(res, msg.chatFetchFailed);

  return response200(res, msg.chatFetchSuccess, chats);
});

module.exports = {
  createChat,
  fetchAllChats,
};
