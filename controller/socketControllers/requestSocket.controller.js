const { request_services, chat_services } = require("../../service");
const sharedState = require("../../socket/sharedState");

const requestSocket = (io, socket) => {
  // Send friend request
  const handleSendRequest = async (payload, callback) => {
    try {
      const { receiver_id, message } = payload;
      const sender_id = socket.userId;

      const [req1, req2] = await Promise.all([
        request_services.findOneRequests({ sender_id, receiver_id }),
        request_services.findOneRequests({
          sender_id: receiver_id,
          receiver_id: sender_id,
        }),
      ]);

      const existing = req1 || req2;

      if (existing?.status) {
        return callback({
          success: false,
          message: "Request already added",
          payload: {},
        });
      }

      const newRequest = await request_services.createRequest({
        sender_id,
        receiver_id,
        message,
      });

      // Send to specific user if online
      const receiverSocketId = sharedState.getSocketId(receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("change-request", {
          payload: newRequest,
        });
      }

      callback({
        success: true,
        message: "Request sent successfully",
        payload: newRequest,
      });
    } catch (err) {
      console.error("Send request error:", err);
      callback({
        success: false,
        message: "Server error",
        payload: {},
      });
    }
  };

  // Cancel friend request
  const handleCancelRequest = async (payload, callback) => {
    try {
      const sender_id = socket.userId;
      const { receiver_id } = payload;

      const requested = await request_services.findOneRequests({
        sender_id,
        receiver_id,
      });

      if (!requested) {
        return callback({
          success: false,
          message: "Request not found",
          payload: {},
        });
      }

      await request_services.deleteRequest({ _id: requested._id });

      const receiverSocketId = sharedState.getSocketId(receiver_id);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("change-request", {
          payload: requested,
        });
      }

      callback({
        success: true,
        message: "Request canceled successfully",
        payload: {},
      });
    } catch (error) {
      console.error("Cancel request error:", error);
      callback({
        success: false,
        message: "Server error",
        payload: {},
      });
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (payload, callback) => {
    try {
      const { id } = payload;
      const acceptedRequest = await request_services.findOneRequests({
        _id: id,
        status: "pending",
      });
      if (!acceptedRequest) return response400(res, msg.requestNotFound);

      const { sender_id, receiver_id } = acceptedRequest;

      const updatedRequest = await request_services.updateRequest(
        { _id: request_id },
        { status: "accepted" }
      );

      const newChat = await chat_services.registerChat({
        participants: [sender_id, receiver_id],
      });

      // Notify sender
      function notifyUser(socketId) {
        if (!socketId) return;
        io.to(socketId).emit("request-accepted", { payload: updatedRequest });
        io.to(socketId).emit("new-chat", { payload: newChat });
      }

      notifyUser(sharedState.getSocketId(sender_id));
      notifyUser(sharedState.getSocketId(receiver_id));

      callback({
        success: true,
        message: "Request accepted",
        payload: updatedRequest,
      });
    } catch (error) {
      console.error("Accept request error:", error);
      callback({
        success: false,
        message: "Server error",
        payload: {},
      });
    }
  };

  // Register event listeners
  socket.on("sent-new-request", handleSendRequest);
  socket.on("cancel-request", handleCancelRequest);
  socket.on("accept-request", handleAcceptRequest);

  // Store reference to online users (you might want to manage this globally)
};

module.exports = requestSocket;
