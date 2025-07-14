// /utils/socket.js

const { verifyToken } = require("./lib/token_manager");
const { user_services } = require("./service");

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
    socket.on("send-message", async ({ chatId, message }) => {
      try {
        console.log("message", message);
        // const msg = await Message.create({
        //   chat: chatId,
        //   sender: socket.userId,
        //   text: message,
        // });

        // Update latestMessage on the chat
        // await Chat.findByIdAndUpdate(chatId, {
        //   latestMessage: msg._id,
        //   updatedAt: Date.now(),
        // });

        // Populate sender before broadcast
        // const fullMsg = await msg.populate(
        //   "sender",
        //   "first_name last_name avatarUrl"
        // );
        io.to(chatId).emit("receive-message", message);
      } catch (err) {
        console.error("Error in send-message:", err);
      }
    });

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
