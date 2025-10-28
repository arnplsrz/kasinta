import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null;
  private listeners: Map<string, any[]>;

  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token: string) {
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

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });
  }

  authenticate(token: string) {
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
  sendMessage(receiverId: string, content: string) {
    if (this.socket) {
      this.socket.emit("sendMessage", { receiverId, content });
    }
  }

  onNewMessage(callback: any) {
    this.on("newMessage", callback);
  }

  onMessageSent(callback: any) {
    this.on("messageSent", callback);
  }

  // Match events
  onNewMatch(callback: any) {
    this.on("newMatch", callback);
  }

  onUnmatch(callback: any) {
    this.on("unmatch", callback);
  }

  // Typing events
  sendTyping(receiverId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit("typing", { receiverId, isTyping });
    }
  }

  onUserTyping(callback: any) {
    this.on("userTyping", callback);
  }

  // Read receipts
  markMessageAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit("messageRead", { messageId });
    }
  }

  onMessageRead(callback: any) {
    this.on("messageReadReceipt", callback);
  }

  // Generic event handling
  on(event: string, callback: any) {
    if (this.socket) {
      this.socket.on(event, callback);

      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)?.push(callback);
    }
  }

  off(event: string, callback: any) {
    if (this.socket) {
      this.socket.off(event, callback);

      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      }
    }
  }
}

export default new SocketService();
