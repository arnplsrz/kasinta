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
export const getPotentialMatches = async (req: Request, res: Response): Promise<void> => {
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
    const excludedIds = [...new Set([...swipedUserIds, ...matchedUserIds, currentUser.id])];

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

    res.json({
      users: potentialMatches,
      count: potentialMatches.length,
    });
  } catch (error) {
    console.error("Get potential matches error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Handle swipe action
export const swipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetUserId, action } = req.body;

    if (!["like", "dislike"].includes(action)) {
      res.status(400).json({ message: "Invalid action" });
      return;
    }

    if (!targetUserId) {
      res.status(400).json({ message: "Target user ID is required" });
      return;
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!currentUser || !targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if already swiped
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        userId_targetId: {
          userId: req.userId!,
          targetId: targetUserId,
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
        targetId: targetUserId,
        action,
      },
    });

    let isMatch = false;
    let matchData = null;

    if (action === "like") {
      // Check if target user has also liked current user
      const reciprocalLike = await prisma.swipe.findFirst({
        where: {
          userId: targetUserId,
          targetId: req.userId!,
          action: "like",
        },
      });

      if (reciprocalLike) {
        // It's a match!
        isMatch = true;

        // Create match record
        const match = await prisma.match.create({
          data: {
            user1Id: req.userId!,
            user2Id: targetUserId,
          },
        });

        matchData = match;

        // Emit socket event for real-time notification
        const io = req.app.get("io");
        const userSockets = req.app.get("userSockets") as Map<string, string>;
        const targetSocketId = userSockets.get(targetUserId);

        if (targetSocketId) {
          io.to(targetSocketId).emit("newMatch", {
            matchedUser: {
              id: currentUser.id,
              name: currentUser.name,
              age: currentUser.age,
              gender: currentUser.gender,
              bio: currentUser.bio,
              profilePhoto: currentUser.profilePhoto,
            },
          });
        }
      }
    }

    res.json({
      message: action === "like" ? "User liked" : "User passed",
      isMatch,
      matchedUser: isMatch
        ? {
            id: targetUser.id,
            name: targetUser.name,
            age: targetUser.age,
            gender: targetUser.gender,
            bio: targetUser.bio,
            profilePhoto: targetUser.profilePhoto,
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
