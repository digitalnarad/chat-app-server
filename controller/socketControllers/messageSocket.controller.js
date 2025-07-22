// controllers/socketControllers/messageController.js
const { message_services, chat_services } = require("../../service");

const messageSocket = (io, socket) => {
  // Send message
  const handleSendMessage = async (payload, callback) => {
    try {
      const { chat_id, message, message_type } = payload;
      const chat = await chat_services.findChat({ _id: chat_id });
      if (!chat) {
        return callback({
          success: false,
          message: "Chat not found",
          payload: {},
        });
      }

      const newMessage = await message_services.registerMessage({
        chat_id: chat_id,
        sender: socket.userId,
        message: message,
        message_type: message_type,
      });

      if (!newMessage) {
        return callback({
          success: false,
          message: "Message creation failed",
          payload: {},
        });
      }

      await chat_services.updateChat(
        { _id: chat_id },
        { latest_message: newMessage._id }
      );

      // Emit to all users in the chat room
      io.to(chat_id).emit("update-user-last-message", newMessage);
      io.to(chat_id).emit("receive-message", newMessage);

      callback({
        success: true,
        message: "Message sent successfully",
        payload: newMessage,
      });
    } catch (err) {
      console.error("Send message error:", err);
      callback({
        success: false,
        message: "Internal server error",
        payload: {},
      });
    }
  };

  // Typing indicator
  const handleTyping = ({ chatId, isTyping }) => {
    socket.to(chatId).emit("typing", {
      chatId,
      userId: socket.userId,
      isTyping,
    });
  };

  // Mark messages as read
  const handleMarkAsRead = async (payload, callback) => {
    try {
      const { chatId } = payload;
      // Update messages in database
      await message_services.markMessagesAsRead(chatId, socket.userId);

      // Notify other participants
      socket.to(chatId).emit("read-receipt", {
        chatId,
        userId: socket.userId,
        readAt: new Date(),
      });

      callback({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      callback({
        success: false,
        message: "Failed to mark as read",
      });
    }
  };

  // Register event listeners
  socket.on("send-message", handleSendMessage);
  socket.on("typing", handleTyping);
  // socket.on("mark-as-read", handleMarkAsRead);
};

module.exports = messageSocket;
