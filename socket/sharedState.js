// controllers/socketControllers/sharedState.js
class SharedState {
  constructor() {
    this.onlineUsers = new Map();
    this.userTimeouts = new Map();
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

  addUserTimeout(userId, timeoutId) {
    this.userTimeouts.set(userId, timeoutId);
  }

  removeUserTimeout(userId) {
    this.userTimeouts.delete(userId);
  }

  getUserTimeout(userId) {
    return this.userTimeouts.get(userId);
  }
  isCheckedInTimeouts(userId) {
    return this.userTimeouts.has(userId);
  }
}

// Export singleton instance
module.exports = new SharedState();
