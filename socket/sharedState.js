// controllers/socketControllers/sharedState.js
class SharedState {
  constructor() {
    this.onlineUsers = new Map();
  }

  addUser(userId, socketId) {
    this.onlineUsers.set(userId, socketId);
  }

  removeUser(userId) {
    this.onlineUsers.delete(userId);
  }

  getSocketId(userId) {
    return this.onlineUsers.get(userId);
  }

  getAllOnlineUsers() {
    return Array.from(this.onlineUsers.keys());
  }
}

// Export singleton instance
module.exports = new SharedState();
