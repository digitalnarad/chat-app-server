// utils/socket.js
const initializeControllers = require("../controller/socketControllers");
const { isSocketAuthenticated } = require("../middleware/auth");

module.exports = function initSocket(io) {
  // Authentication middleware
  io.use(isSocketAuthenticated);

  io.on("connection", async (socket) => {
    // Initialize all socket event controllers
    initializeControllers(io, socket);
  });
};
