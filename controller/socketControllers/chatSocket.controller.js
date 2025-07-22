// controllers/socketControllers/chatController.js
const { chat_services } = require("../../service");

const chatSocket = (io, socket) => {
  // Join chat room
  const handleJoinChat = ({ chatId }, callback = () => {}) => {
    console.log("join-chat", chatId);
    socket.join(chatId);
    callback({
      success: true,
      message: "Joined chat successfully",
    });
  };

  // Leave chat room
  const handleLeaveChat = ({ chatId }, callback = () => {}) => {
    console.log("leave-chat", chatId);
    socket.leave(chatId);
    callback({
      success: true,
      message: "Left chat successfully",
    });
  };

  // Get chat participants
  const handleGetChatParticipants = async (chatId, callback) => {
    try {
      const chat = await chat_services.findChat({ _id: chatId });
      if (!chat) {
        return callback({
          success: false,
          message: "Chat not found",
          payload: {},
        });
      }

      // Get all sockets in this room
      const socketsInRoom = await io.in(chatId).fetchSockets();
      const participantIds = socketsInRoom.map((s) => s.userId);

      callback({
        success: true,
        message: "Participants fetched successfully",
        payload: { chatId, participants: participantIds },
      });
    } catch (error) {
      callback({
        success: false,
        message: "Failed to get participants",
        payload: {},
      });
    }
  };

  // Register event listeners
  socket.on("join-chat", handleJoinChat);
  socket.on("leave-chat", handleLeaveChat);
  // socket.on("get-chat-participants", handleGetChatParticipants);
};

module.exports = chatSocket;
