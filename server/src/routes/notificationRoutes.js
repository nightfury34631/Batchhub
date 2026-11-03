import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getUserNotifications);
router.put("/read-all", verifyToken, markAllNotificationsRead);
router.put("/:id/read", verifyToken, markNotificationRead);

export default router;

