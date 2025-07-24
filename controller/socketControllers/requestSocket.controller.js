const {
  request_services,
  chat_services,
  message_services,
} = require("../../service");
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
        io.to(receiverSocketId).emit("receive-request", {
          request: {
            ...newRequest.toObject(),
            senderDetails: socket.user,
          },
          message: "New friend request",
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
      const { receiver_id, sender_id } = payload;

      const requested = await request_services.findOneRequests({
        sender_id,
        receiver_id,
        status: "pending",
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
        io.to(receiverSocketId).emit("remove-request", requested);
      }

      callback({
        success: true,
        message: "Request canceled successfully",
        payload: {},
      });
    } catch (error) {
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

      const newChat = await chat_services.registerChat({
        participants: [sender_id.toString(), receiver_id.toString()],
        unread_messages: [],
      });

      const chatId = newChat.toObject()._id;

      const updatedRequest = await request_services.updateRequest(
        { _id: id },
        { status: "accepted", chat_id: chatId }
      );

      const newMessage = await message_services.registerMessage({
        chat_id: chatId,
        sender: socket.userId,
        message: `${socket.user.user_name} accepted your friend request`,
        message_type: "join-chat",
      });

      await chat_services.updateChat(
        { _id: chatId },
        {
          latest_message: newMessage._id,
        }
      );

      // Notify sender
      function notifyUser(socketId) {
        if (!socketId) return;
        io.to(socketId).emit("new-chat", {});
        io.to(socketId).emit("accept-request", updatedRequest._id);
      }

      notifyUser(sharedState.getSocketId(sender_id.toString()));
      notifyUser(sharedState.getSocketId(receiver_id.toString()));

      callback({
        success: true,
        message: "Request accepted",
        payload: updatedRequest,
      });
    } catch (error) {
      console.log("error", error);
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
