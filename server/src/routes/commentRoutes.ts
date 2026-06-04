import { Router } from "express";
import { addComment, getPostComments, deleteComment } from "../controllers/commentController.js";
import { getCommentLikes, toggleCommentLike} from "../controllers/commentLikeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware.js";

const router = Router();

router.get("/likes/:commentId", getCommentLikes);
router.post("/likes/:commentId", authMiddleware, toggleCommentLike);

router.post("/:postId", authMiddleware, addComment);
router.get("/:postId", optionalAuthMiddleware, getPostComments);
router.delete("/:commentId", authMiddleware, deleteComment);


export default router;
