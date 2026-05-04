import { Router } from "express";
import { addComment, getPostComments, deleteComment } from "../controllers/commentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
router.post("/:postId", authMiddleware, addComment);
router.get("/:postId", getPostComments);
router.delete("/:commentId", authMiddleware, deleteComment);
export default router;
