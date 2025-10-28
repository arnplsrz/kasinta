import { Request, Response } from "express";
import prisma from "../config/database";

// Get all matches
export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get matches where current user is either user1 or user2
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: req.userId! }, { user2Id: req.userId! }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            profilePhoto: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            age: true,
            bio: true,
            profilePhoto: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format matches to include both users and last message
    const formattedMatches = matches.map((match) => {
      const lastMessage = match.messages[0] || null;

      return {
        id: match.id,
        user1Id: match.user1Id,
        user2Id: match.user2Id,
        user1: match.user1,
        user2: match.user2,
        lastMessage,
        createdAt: match.createdAt,
      };
    });

    // Sort by last message date or match date
    formattedMatches.sort((a, b) => {
      const aDate = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : new Date(a.createdAt).getTime();
      const bDate = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : new Date(b.createdAt).getTime();
      return bDate - aDate;
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Unmatch user
export const unmatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;

    // Find the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      res.status(404).json({ message: "Match not found" });
      return;
    }

    // Verify current user is part of this match
    if (match.user1Id !== req.userId! && match.user2Id !== req.userId!) {
      res.status(403).json({ message: "You are not part of this match" });
      return;
    }

    // Get the other user's ID for socket notification
    const otherUserId = match.user1Id === req.userId! ? match.user2Id : match.user1Id;

    // Delete the match (this will cascade delete messages due to Prisma schema)
    await prisma.match.delete({
      where: { id: matchId },
    });

    // Notify other user via socket
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets") as Map<string, string>;
    const targetSocketId = userSockets.get(otherUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("unmatch", {
        userId: req.userId,
        matchId,
      });
    }

    res.json({ message: "Unmatched successfully" });
  } catch (error) {
    console.error("Unmatch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
