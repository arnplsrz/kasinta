import { Request, Response } from "express";
import prisma from "../config/database";
import { Prisma } from "@prisma/client";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Get potential matches
export const getPotentialMatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        likes: { select: { targetId: true } },
        matchesInitiated: { select: { user2Id: true } },
        matchesReceived: { select: { user1Id: true } },
      },
    });

    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { minAge, maxAge, maxDistance } = req.query;

    // Get IDs of users already swiped or matched
    const swipedUserIds = currentUser.likes.map((like) => like.targetId);
    const matchedUserIds = [
      ...currentUser.matchesInitiated.map((match) => match.user2Id),
      ...currentUser.matchesReceived.map((match) => match.user1Id),
    ];
    const excludedIds = [
      ...new Set([...swipedUserIds, ...matchedUserIds, currentUser.id]),
    ];

    // Build query
    const whereClause: Prisma.UserWhereInput = {
      id: { notIn: excludedIds },
      age: {
        gte: minAge ? parseInt(minAge as string) : currentUser.preferenceMinAge,
        lte: maxAge ? parseInt(maxAge as string) : currentUser.preferenceMaxAge,
      },
    };

    // Filter by gender preference
    if (currentUser.interestedIn !== "everyone") {
      whereClause.gender = currentUser.interestedIn;
    }

    // Get potential matches
    let potentialMatches = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        bio: true,
        profilePhoto: true,
        latitude: true,
        longitude: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 50,
    });

    // Filter by distance if location is set
    if (
      maxDistance &&
      currentUser.latitude !== null &&
      currentUser.longitude !== null &&
      currentUser.latitude !== 0 &&
      currentUser.longitude !== 0
    ) {
      const distance = maxDistance
        ? parseFloat(maxDistance as string)
        : currentUser.preferenceDistance;

      potentialMatches = potentialMatches.filter((user) => {
        if (user.latitude === null || user.longitude === null) return false;
        const dist = calculateDistance(
          currentUser.latitude!,
          currentUser.longitude!,
          user.latitude,
          user.longitude
        );
        return dist <= distance;
      });
    }

    res.json(potentialMatches);
  } catch (error) {
    console.error("Get potential matches error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Handle swipe action
export const swipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetId, targetUserId, action } = req.body;
    const targetUser = targetId || targetUserId;

    if (!["like", "dislike"].includes(action)) {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    if (!targetUser) {
      res.status(400).json({ message: "Target user ID is required" });
      return;
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    const targetUserData = await prisma.user.findUnique({
      where: { id: targetUser },
    });

    if (!currentUser || !targetUserData) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already swiped
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        userId_targetId: {
          userId: req.userId!,
          targetId: targetUser,
        },
      },
    });

    if (existingSwipe) {
      res.status(400).json({ message: "Already swiped on this user" });
      return;
    }

    // Create swipe record
    await prisma.swipe.create({
      data: {
        userId: req.userId!,
        targetId: targetUser,
        action,
      },
    });

    let isMatch = false;
    let matchData = null;

    if (action === "like") {
      // Check if target user has also liked current user
      const reciprocalLike = await prisma.swipe.findFirst({
        where: {
          userId: targetUser,
          targetId: req.userId!,
          action: "like",
        },
      });

      if (reciprocalLike) {
        // It's a match!
        isMatch = true;

        // Create match record with full user data
        const match = await prisma.match.create({
          data: {
            user1Id: req.userId!,
            user2Id: targetUser,
          },
          include: {
            user1: {
              select: {
                id: true,
                name: true,
                age: true,
                gender: true,
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
                gender: true,
                bio: true,
                profilePhoto: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        });

        matchData = match;

        // Emit socket event for real-time notification to BOTH users
        const io = req.app.get("io");
        const userSockets = req.app.get("userSockets") as Map<string, string>;

        // Emit to target user (User B)
        const targetSocketId = userSockets.get(targetUser);
        if (targetSocketId) {
          io.to(targetSocketId).emit("newMatch", {
            id: match.id,
            user1Id: match.user1Id,
            user2Id: match.user2Id,
            user1: match.user1,
            user2: match.user2,
            createdAt: match.createdAt,
          });

          // Send push notification to target user
          io.to(targetSocketId).emit("notification", {
            type: "newMatch",
            title: "New Match!",
            body: `You matched with ${match.user1.name}`,
            matchId: match.id,
            badge: match.user1.profilePhoto
              ? `http://localhost:${process.env.PORT}${match.user1.profilePhoto}`
              : null,
          });
        }

        // Emit to current user (User A)
        const currentSocketId = userSockets.get(req.userId!);
        if (currentSocketId) {
          io.to(currentSocketId).emit("newMatch", {
            id: match.id,
            user1Id: match.user1Id,
            user2Id: match.user2Id,
            user1: match.user1,
            user2: match.user2,
            createdAt: match.createdAt,
          });

          // Send push notification to current user
          io.to(currentSocketId).emit("notification", {
            type: "newMatch",
            title: "New Match!",
            body: `You matched with ${match.user2.name}`,
            matchId: match.id,
            badge: match.user2.profilePhoto
              ? `http://localhost:${process.env.PORT}${match.user2.profilePhoto}`
              : null,
          });
        }
      }
    }

    res.json({
      message: action === "like" ? "User liked" : "User passed",
      isMatch,
      match:
        isMatch && matchData
          ? {
              id: matchData.id,
              user1Id: matchData.user1Id,
              user2Id: matchData.user2Id,
              user1: matchData.user1,
              user2: matchData.user2,
              createdAt: matchData.createdAt,
            }
          : null,
    });
  } catch (error) {
    console.error("Swipe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Undo last swipe
export const undoSwipe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get last swipe
    const lastSwipe = await prisma.swipe.findFirst({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });

    if (!lastSwipe) {
      res.status(400).json({ message: "No swipes to undo" });
      return;
    }

    // Delete the swipe
    await prisma.swipe.delete({
      where: { id: lastSwipe.id },
    });

    res.json({
      message: "Swipe undone",
      undoneUserId: lastSwipe.targetId,
    });
  } catch (error) {
    console.error("Undo swipe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
