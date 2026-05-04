import { Router } from "express";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", authMiddleware, getMyNotifications);
router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);
router.patch("/:notificationId/read", authMiddleware, markNotificationAsRead);
export default router;
