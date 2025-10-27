import { Request, Response } from "express";
import prisma from "../config/database";
import fs from "fs";
import path from "path";

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, gender, bio, interestedIn, preferenceMinAge, preferenceMaxAge, preferenceDistance, latitude, longitude } = req.body;

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (interestedIn) updateData.interestedIn = interestedIn;
    if (preferenceMinAge) updateData.preferenceMinAge = parseInt(preferenceMinAge);
    if (preferenceMaxAge) updateData.preferenceMaxAge = parseInt(preferenceMaxAge);
    if (preferenceDistance) updateData.preferenceDistance = parseFloat(preferenceDistance);
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        bio: true,
        profilePhoto: true,
        interestedIn: true,
        preferenceMinAge: true,
        preferenceMaxAge: true,
        preferenceDistance: true,
        latitude: true,
        longitude: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload profile photo
export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Get current user to delete old photo
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { profilePhoto: true },
    });

    // Delete old photo if it exists
    if (currentUser?.profilePhoto) {
      const oldPhotoPath = path.join(process.cwd(), currentUser.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update user with new photo path
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { profilePhoto: photoPath },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        bio: true,
        profilePhoto: true,
        interestedIn: true,
        preferenceMinAge: true,
        preferenceMaxAge: true,
        preferenceDistance: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Photo uploaded successfully",
      user,
      photoUrl: photoPath,
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete profile photo
export const deletePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { profilePhoto: true },
    });

    if (!user?.profilePhoto) {
      res.status(400).json({ message: "No photo to delete" });
      return;
    }

    // Delete physical file
    const photoPath = path.join(process.cwd(), user.profilePhoto);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Update user
    await prisma.user.update({
      where: { id: req.userId! },
      data: { profilePhoto: null },
    });

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Delete photo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update preferences
export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const { interestedIn, preferenceMinAge, preferenceMaxAge, preferenceDistance } = req.body;

    const updateData: any = {};
    if (interestedIn) updateData.interestedIn = interestedIn;
    if (preferenceMinAge) updateData.preferenceMinAge = parseInt(preferenceMinAge);
    if (preferenceMaxAge) updateData.preferenceMaxAge = parseInt(preferenceMaxAge);
    if (preferenceDistance) updateData.preferenceDistance = parseFloat(preferenceDistance);

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: updateData,
      select: {
        interestedIn: true,
        preferenceMinAge: true,
        preferenceMaxAge: true,
        preferenceDistance: true,
      },
    });

    res.json({ message: "Preferences updated successfully", preferences: user });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
