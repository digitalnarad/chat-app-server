// controllers/socketControllers/messageController.js
const {
  message_services,
  chat_services,
  user_services,
} = require("../../service");
const sharedState = require("../../socket/sharedState");

const messageSocket = (io, socket) => {
  // Send message
  const handleSendMessage = async (payload, callback) => {
    try {
      const { chat_id, message, message_type, receiver_id } = payload;
      const chat = await chat_services.findChat({ _id: chat_id });
      if (!chat) {
        return callback({
          success: false,
          message: "Chat not found",
          payload: {},
        });
      }

      const createdMessage = await message_services.registerMessage({
        chat_id: chat_id,
        sender: socket.userId,
        message: message,
        message_type: message_type,
      });

      const newMessage = createdMessage.toObject();

      if (!newMessage) {
        return callback({
          success: false,
          message: "Message creation failed",
          payload: {},
        });
      }

      const updatedChat = await chat_services.updateChat(
        { _id: chat_id },
        {
          latest_message: newMessage._id,
        }
      );

      const unreadCount = await message_services.getUnreadMessageCountByCHatId(
        chat_id,
        receiver_id
      );

      // Emit to all users in the chat room
      io.to(chat_id).emit("receive-message", newMessage);

      const newChat = {
        ...updatedChat,
        lastMessage: newMessage.message,
        unread_count: unreadCount,
        participant: socket.user,
      };

      const receiverSocket = sharedState.getSocketId(receiver_id);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-updated-message-chat", newChat);
      }

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
  const handleTyping = ({ chatId, isTyping, receiver_id }) => {
    console.log("chatId, isTyping", chatId, isTyping);
    const socketId = sharedState.getSocketId(receiver_id);
    socket.to(socketId).emit("typing", {
      chatId,
      userId: socket.userId,
      isTyping,
    });
  };

  // Mark messages as read
  const handleMarkAsRead = async (payload, callback) => {
    try {
      const { chat_id } = payload;
      // Update messages in database

      // const unreadMessages = await message_services.findMessage({
      //   chat_id: chat_id,
      //   sender: { $ne: socket.userId }, // Exclude user's own messages
      //   read_by: {
      //     $not: { $elemMatch: { $eq: socket.userId } }, // Correct array check
      //   },
      // });

      await message_services.markMessagesAsRead(chat_id, socket.userId);

      // Notify other participants
      socket.to(chat_id).emit("read-receipt", {
        chatId: chat_id,
        userId: socket.userId,
        readAt: new Date(),
      });

      callback({
        success: true,
        message: "Messages marked as read",
        payload: {},
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      callback({
        success: false,
        message: "Failed to mark as read",
        payload: {},
      });
    }
  };

  // Register event listeners
  socket.on("send-message", handleSendMessage);
  socket.on("typing", handleTyping);
  socket.on("mark-as-read", handleMarkAsRead);
};

module.exports = messageSocket;
