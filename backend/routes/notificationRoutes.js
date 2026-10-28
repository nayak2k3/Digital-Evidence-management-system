import express from "express";

import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

router.get(
  "/",
  protect,
  getMyNotifications
);

// ==========================================
// GET UNREAD COUNT
// ==========================================

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

// ==========================================
// MARK ALL AS READ
// ==========================================

router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// ==========================================
// MARK ONE AS READ
// ==========================================

router.put(
  "/:id/read",
  protect,
  markAsRead
);

export default router;