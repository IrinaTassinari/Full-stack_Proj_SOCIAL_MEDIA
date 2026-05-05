import { Router } from "express";
import { sendMessage, getConversation, getMyChats } from "../controllers/messageController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/allchats", authMiddleware, getMyChats);
router.post("/:receiverId", authMiddleware, sendMessage);
router.get("/:userId", authMiddleware, getConversation);

export default router;