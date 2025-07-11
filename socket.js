// /utils/socket.js

module.exports = function initSocket(io) {
  // 1️⃣ Authenticate every socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
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

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.userId);

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    // ✉️ Send a new message
    socket.on("send-message", async ({ chatId, text }) => {
      try {
        const msg = await Message.create({
          chat: chatId,
          sender: socket.userId,
          text,
        });

        // Update latestMessage on the chat
        await Chat.findByIdAndUpdate(chatId, {
          latestMessage: msg._id,
          updatedAt: Date.now(),
        });

        // Populate sender before broadcast
        const fullMsg = await msg.populate(
          "sender",
          "first_name last_name avatarUrl"
        );
        io.to(chatId).emit("new-message", fullMsg);
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

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.userId);
    });
  });
};
