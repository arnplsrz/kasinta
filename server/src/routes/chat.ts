import express from "express";
import * as chatController from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.get("/unread/count", chatController.getUnreadCount);
router.get("/:matchUserId", chatController.getMessages);
router.post("/:matchUserId", chatController.sendMessage);

export default router;
