import express from "express";
import * as matchController from "../controllers/matchController";
import { auth } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Match routes
router.get("/", matchController.getMatches);
router.delete("/:matchId", matchController.unmatch);

export default router;
