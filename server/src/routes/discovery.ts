import express from "express";
import * as discoveryController from "../controllers/discoveryController";
import { auth } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Discovery routes
router.get("/", discoveryController.getPotentialMatches);
router.post("/swipe", discoveryController.swipe);
router.post("/undo", discoveryController.undoSwipe);

export default router;
