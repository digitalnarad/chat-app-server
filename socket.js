// /utils/socket.js

const { verifyToken } = require("./lib/token_manager");
const { user_services, message_services, chat_services } = require("./service");

module.exports = function initSocket(io) {
  // 1️⃣ Authenticate every socket connection
  let onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake?.auth?.token || "";
      if (!token) return next(new Error("No token"));

      const data = await verifyToken(token);

      if (!data?.user_id) throw new Error("Invalid token");

      const user = await user_services.findUser({ _id: data.user_id });
      if (!user) throw new Error("User not found");

      socket.userId = data.user_id;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("🔌 User connected:", socket.userId);
    let userId = socket.userId;
    io.emit("update-user-status", { userId, status: "online", at: new Date() });
    try {
      await user_services.updateUser(
        { _id: userId },
        {
          active_status: { status: "online", at: new Date() },
        }
      );
    } catch (err) {
      console.error("Error updating user status:", err);
    }

    socket.on("join-chat", (chatId) => {
      console.log("join-chat", chatId);
      socket.join(chatId);
    });

    socket.on("leave-chat", (chatId) => {
      console.log("leave-chat", chatId);
      socket.leave(chatId);
    });

    // ✉️ Send a new message
    socket.on(
      "send-message",
      async ({ chat_id, message, message_type }, callback) => {
        try {
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
            {
              latestMessage: newMessage._id,
              updatedAt: Date.now(),
            }
          );

          io.to(chat_id).emit("receive-message", newMessage);
          callback({
            success: true,
            message: "Message sent successfully",
            payload: newMessage,
          });
        } catch (err) {
          callback({
            success: false,
            message: "Internal server error",
            payload: {},
          });
        }
      }
    );

    // 💬 Typing indicator
    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(chatId).emit("typing", {
        chatId,
        userId: socket.userId,
        isTyping,
      });
    });

    // ✔️ Read receipts
    socket.on("mark-as-read", async ({ chatId }) => {
      await Message.updateMany(
        { chat, readBy: { $ne: socket.userId } },
        { $addToSet: { readBy: socket.userId } }
      );
      socket.to(chatId).emit("read-receipt", {
        chatId,
        userId: socket.userId,
      });
    });

    socket.on("disconnect", async () => {
      try {
        let lastSeen = new Date();
        io.emit("update-user-status", {
          userId,
          status: "offline",
          at: lastSeen,
        });
        await user_services.updateUser(
          { _id: socket.userId },
          {
            active_status: { status: "offline", at: lastSeen },
          }
        );
      } catch (err) {
        console.error("Error updating user status on disconnect:", err);
      }
      console.log("🔌 User disconnected:", socket.userId);
    });
  });
};
