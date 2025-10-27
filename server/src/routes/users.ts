import express from "express";
import * as userController from "../controllers/userController";
import { auth } from "../middleware/auth";
import upload from "../middleware/upload";

const router = express.Router();

// All routes require authentication
router.use(auth);

// User profile routes
router.get("/:userId", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.put("/preferences", userController.updatePreferences);

// Photo routes
router.post("/photo", upload.single("photo"), userController.uploadPhoto);
router.delete("/photo", userController.deletePhoto);

export default router;
