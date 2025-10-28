import { Request, Response } from "express";
import prisma from "../config/database";

// Get chat messages between two matched users
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchUserId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify users are matched
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: req.userId!, user2Id: matchUserId },
          { user1Id: matchUserId, user2Id: req.userId! },
        ],
      },
    });

    if (!match) {
      res.status(403).json({ message: "Not matched with this user" });
      return;
    }

    // Build query
    const whereClause: any = {
      OR: [
        { senderId: req.userId!, receiverId: matchUserId },
        { senderId: matchUserId, receiverId: req.userId! },
      ],
    };

    if (before) {
      whereClause.createdAt = { lt: new Date(before as string) };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
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

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: matchUserId,
        receiverId: req.userId!,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message (via HTTP, Socket.IO is preferred)
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchUserId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ message: "Message content is required" });
      return;
    }

    // Verify users are matched
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: req.userId!, user2Id: matchUserId },
          { user1Id: matchUserId, user2Id: req.userId! },
        ],
      },
    });

    if (!match) {
      res.status(403).json({ message: "Not matched with this user" });
      return;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
        receiverId: matchUserId,
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

    // Send via Socket.IO
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets") as Map<string, string>;
    const targetSocketId = userSockets.get(matchUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: req.userId!,
        read: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
