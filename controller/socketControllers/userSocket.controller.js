// controllers/socketControllers/userController.js
const { user_services } = require("../../service");
const sharedState = require("../../socket/sharedState");

const userSocket = (io, socket) => {
  // Update user status
  const handleUpdateStatus = async (payload, callback) => {
    try {
      const { status } = payload;
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

  const handleUserHeartbeat = async (payload, callback) => {
    try {
      const userId = socket.userId;

      if (sharedState.isCheckedInTimeouts(userId)) {
        clearTimeout(sharedState.getUserTimeout(userId));
      }

      const userOffline = async () => {
        const timestamp = new Date();
        await user_services.updateUser(
          { _id: userId },
          { active_status: { status: "offline", at: timestamp } }
        );
        io.emit("update-user-status", {
          userId,
          status: "offline",
          at: timestamp,
        });
      };

      const timeout = setTimeout(() => {
        userOffline();
        sharedState.removeUserTimeout(userId);
      }, 60000);

      sharedState.addUserTimeout(userId, timeout);
      callback({
        success: true,
        message: "Status updated successfully",
        payload: {},
      });
    } catch (error) {
      callback({
        success: false,
        message: "Failed to update status",
        payload: {},
      });
      throw error;
    }
  };

  // Handle user connection
  const handleUserConnect = async () => {
    // const userId = socket.userId;
    const userId = socket.user._id.toString();
    sharedState.addUser(userId, socket.id);
  };

  // Register event listeners
  socket.on("update-my-status", handleUpdateStatus);
  socket.on("heartbeat", handleUserHeartbeat);

  socket.on("disconnect", () => {
    const userId = socket.user._id.toString();
    sharedState.removeUser(userId);
  });

  // Call connect handler immediately
  handleUserConnect();
};

module.exports = userSocket;
