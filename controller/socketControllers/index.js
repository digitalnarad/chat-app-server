// controllers/socketControllers/index.js
const chatSocket = require("./chatSocket.controller");
const messageSocket = require("./messageSocket.controller");
const requestSocket = require("./requestSocket.controller");
const userSocket = require("./userSocket.controller");

const initializeControllers = (io, socket) => {
  // Initialize all controllers with access to io and socket
  chatSocket(io, socket);
  messageSocket(io, socket);
  requestSocket(io, socket);
  userSocket(io, socket);
};

module.exports = initializeControllers;
