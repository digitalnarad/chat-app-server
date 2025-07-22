// controllers/socketControllers/userController.js
const { user_services } = require("../../service");
const sharedState = require("../../socket/sharedState");

const userSocket = (io, socket) => {
  // Update user status
  const handleUpdateStatus = async (payload, callback) => {
    try {
      const { status } = payload;
      console.log("status", status);
      const userId = socket.userId;
      const timestamp = new Date();

      await user_services.updateUser(
        { _id: userId },
        { active_status: { status, at: timestamp } }
      );

      // Broadcast to all users
      io.emit("update-user-status", {
        userId,
        status,
        at: timestamp,
      });

      callback({
        success: true,
        message: "Status updated successfully",
        payload: { userId, status, at: timestamp },
      });
    } catch (err) {
      console.error("Update status error:", err);
      callback({
        success: false,
        message: "Failed to update status",
        payload: {},
      });
    }
  };

  // Handle user connection
  const handleUserConnect = async () => {
    const userId = socket.userId;
    sharedState.addUser(userId, socket.id);
  };

  // Register event listeners
  socket.on("update-my-status", handleUpdateStatus);
  socket.on("disconnect", () => {
    console.log("disconnect", socket.userId);
    const userId = socket.userId;
    sharedState.removeUser(userId);
  });

  // Call connect handler immediately
  handleUserConnect();
};

module.exports = userSocket;
