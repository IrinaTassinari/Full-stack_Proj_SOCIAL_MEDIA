import { Router } from "express";
import { getUserProfile, updateUserProfile, searchUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadUserImage.js";
const router = Router();
router.patch("/me", authMiddleware, upload.single("avatar"), updateUserProfile);
router.get("/search", searchUsers);
router.get("/:id", getUserProfile);
export default router;
