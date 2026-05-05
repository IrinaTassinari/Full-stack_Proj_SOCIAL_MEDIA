import { Router } from "express";
import { getMyMessageNotifications, markMessageNotificationAsRead, markAllMessageNotificationsAsRead } from "../controllers/notificationMessageController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware,  getMyMessageNotifications);
router.patch("/read-all", authMiddleware, markAllMessageNotificationsAsRead);
router.patch("/:notificationId/read", authMiddleware, markMessageNotificationAsRead);

export default router;