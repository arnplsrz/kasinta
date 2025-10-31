import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/database";

interface JwtPayload {
  userId: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const initializeSocket = (io: Server): Map<string, string> => {
  // Store user socket mappings
  const userSockets = new Map<string, string>();

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log("New client connected:", socket.id);

    // Authenticate socket connection
    socket.on("authenticate", async (token: string) => {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JwtPayload;
        socket.userId = decoded.userId;
        userSockets.set(decoded.userId, socket.id);

        // Update user online status
        await prisma.user.update({
          where: { id: decoded.userId },
          data: {
            isOnline: true,
            lastSeen: new Date(),
          },
        });

        // Broadcast online status to all connected users
        io.emit("userStatusChange", {
          userId: decoded.userId,
          isOnline: true,
        });

        socket.emit("authenticated", { userId: decoded.userId });
        console.log("User authenticated:", decoded.userId);
      } catch (error) {
        console.error("Socket authentication error:", error);
        socket.emit("authError", { message: "Authentication failed" });
      }
    });

    // Handle sending messages
    socket.on(
      "sendMessage",
      async (data: { receiverId: string; content: string }) => {
        try {
          const { receiverId, content } = data;

          if (!socket.userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          // Verify users are matched
          const match = await prisma.match.findFirst({
            where: {
              OR: [
                { user1Id: socket.userId, user2Id: receiverId },
                { user1Id: receiverId, user2Id: socket.userId },
              ],
            },
          });

          if (!match) {
            socket.emit("error", {
              message: "Not matched with this user",
            });
            return;
          }

          // Create message
          const message = await prisma.message.create({
            data: {
              senderId: socket.userId,
              receiverId: receiverId,
              content: content.trim(),
              matchId: match.id,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                },
              },
              receiver: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                },
              },
            },
          });

          // Send to receiver if online
          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);

            // Send push notification event for new message
            io.to(receiverSocketId).emit("notification", {
              type: "newMessage",
              title: `New message from ${message.sender.name}`,
              body: content.trim(),
              matchId: match.id,
              senderId: socket.userId,
              icon: message.sender.profilePhoto
                ? `${process.env.CORS_ORIGIN || "http://localhost:3000"}${message.sender.profilePhoto}`
                : null,
            });
          }

          // Confirm to sender
          socket.emit("messageSent", message);
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Handle typing indicator
    socket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = userSockets.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: socket.userId,
          isTyping,
        });
      }
    });

    // Handle message read receipts
    socket.on("messageRead", async (data: { messageId: string }) => {
      try {
        const { messageId } = data;

        const message = await prisma.message.update({
          where: { id: messageId },
          data: {
            read: true,
            readAt: new Date(),
          },
        });

        if (message) {
          const senderSocketId = userSockets.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("messageReadReceipt", {
              messageId,
              readAt: message.readAt,
            });
          }
        }
      } catch (error) {
        console.error("Message read error:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("Client disconnected:", socket.id);

      if (socket.userId) {
        const userId = socket.userId;
        userSockets.delete(userId);

        // Update user offline status
        await prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: false,
            lastSeen: new Date(),
          },
        });

        // Broadcast offline status to all connected users
        io.emit("userStatusChange", {
          userId: userId,
          isOnline: false,
        });
      }
    });
  });

  return userSockets;
};

export default initializeSocket;
