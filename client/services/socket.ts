import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.authenticate(token);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  authenticate(token) {
    if (this.socket && token) {
      this.socket.emit("authenticate", token);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Message events
  sendMessage(receiverId, content) {
    if (this.socket) {
      this.socket.emit("sendMessage", { receiverId, content });
    }
  }

  onNewMessage(callback) {
    this.on("newMessage", callback);
  }

  onMessageSent(callback) {
    this.on("messageSent", callback);
  }

  // Match events
  onNewMatch(callback) {
    this.on("newMatch", callback);
  }

  onUnmatch(callback) {
    this.on("unmatch", callback);
  }

  // Typing events
  sendTyping(receiverId, isTyping) {
    if (this.socket) {
      this.socket.emit("typing", { receiverId, isTyping });
    }
  }

  onUserTyping(callback) {
    this.on("userTyping", callback);
  }

  // Read receipts
  markMessageAsRead(messageId) {
    if (this.socket) {
      this.socket.emit("messageRead", { messageId });
    }
  }

  onMessageRead(callback) {
    this.on("messageReadReceipt", callback);
  }

  // Generic event handling
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);

      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);

      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }
}

export default new SocketService();
