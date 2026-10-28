import mongoose from "mongoose";
import Notification from "../models/Notification.js";

// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

export const getMyNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user.userId,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ==========================================
// GET UNREAD COUNT
// ==========================================

export const getUnreadCount = async (
  req,
  res
) => {
  try {
    const count =
      await Notification.countDocuments({
        recipient: req.user.userId,
        isRead: false,
      });

    res.status(200).json({
      unreadCount: count,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch unread count",
      error: error.message,
    });
  }
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

export const markAsRead = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE NOTIFICATION ID
    // ==========================================

    if (
      !mongoose.isValidObjectId(req.params.id)
    ) {
      return res.status(400).json({
        message:
          "Invalid notification ID",
      });
    }

    // ==========================================
    // FIND USER'S NOTIFICATION
    // ==========================================

    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.userId,
      });

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    // ==========================================
    // MARK AS READ
    // ==========================================

    notification.isRead = true;

    await notification.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update notification",
      error: error.message,
    });
  }
};

// ==========================================
// MARK ALL AS READ
// ==========================================

export const markAllAsRead = async (
  req,
  res
) => {
  try {
    // ==========================================
    // UPDATE USER'S NOTIFICATIONS ONLY
    // ==========================================

    const result =
      await Notification.updateMany(
        {
          recipient: req.user.userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "All notifications marked as read",

      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update notifications",
      error: error.message,
    });
  }
};