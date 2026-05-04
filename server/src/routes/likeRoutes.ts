import { Router } from "express";
import { toggleLike, getPostLikes } from "../controllers/likeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/:postId", authMiddleware, toggleLike);
router.get("/:postId", getPostLikes);

export default router;