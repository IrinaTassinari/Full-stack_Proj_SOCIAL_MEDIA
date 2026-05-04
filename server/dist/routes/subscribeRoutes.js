import { Router } from "express";
import { subscribeToUser, unsubscribeFromUser, getUserFollowers, getUserFollowing } from "../controllers/subscribeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
router.post("/:userId", authMiddleware, subscribeToUser);
router.delete("/:userId", authMiddleware, unsubscribeFromUser);
router.get("/:userId/followers", authMiddleware, getUserFollowers);
router.get("/:userId/following", authMiddleware, getUserFollowing);
export default router;
