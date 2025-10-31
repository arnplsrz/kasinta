import { Match, Message } from "@/lib/types";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

class SocketService {
  private socket: Socket | null;
  private listeners: Map<string, any[]>;

  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Set the socket instance from SocketContext
  setSocket(socket: Socket | null) {
    // console.log("Setting socket instance:", socket ? "connected" : "null");
    this.socket = socket;

    if (socket) {
      // Add debug listeners
      socket.on("userStatusChange", (data) => {
        // console.log("Received userStatusChange:", data);
      });

      socket.on("userTyping", (data) => {
        // console.log("Received userTyping:", data);
      });
    }
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    // Socket disconnection is now handled by SocketContext
    // console.log("Socket service disconnect called");
    this.listeners.clear();
  }

  // Message events
  sendMessage(receiverId: string, content: string) {
    if (this.socket) {
      this.socket.emit("sendMessage", { receiverId, content });
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    this.on("newMessage", callback);
  }

  onMessageSent(callback: (message: Message) => void) {
    this.on("messageSent", callback);
  }

  // Match events
  onNewMatch(callback: (match: Match) => void) {
    this.on("newMatch", callback);
  }

  onUnmatch(callback: (data: { matchId: string }) => void) {
    this.on("unmatch", callback);
  }

  // Typing events
  sendTyping(receiverId: string, isTyping: boolean) {
    if (this.socket) {
      // console.log("Sending typing event:", { receiverId, isTyping });
      this.socket.emit("typing", { receiverId, isTyping });
    } else {
      console.warn("Cannot send typing - no socket instance");
    }
  }

  onUserTyping(
    callback: (data: { userId: string; isTyping: boolean }) => void
  ) {
    this.on("userTyping", callback);
  }

  // Online status events
  onUserStatusChange(
    callback: (data: { userId: string; isOnline: boolean }) => void
  ) {
    this.on("userStatusChange", callback);
  }

  // Read receipts
  markMessageAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit("messageRead", { messageId });
    }
  }

  onMessageRead(callback: (data: { messageId: string; readAt: Date }) => void) {
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
