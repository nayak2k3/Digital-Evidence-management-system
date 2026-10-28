import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(
    {
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "case_assigned",
          "evidence_uploaded",
          "evidence_verified",
          "evidence_verification_failed",
          "report_submitted",
          "report_reviewed",
          "report_approved",
          "system",
        ],
        default: "system",
        index: true,
      },

      resourceType: {
        type: String,
        enum: [
          "Case",
          "Evidence",
          "Report",
          "System",
        ],
        default: "System",
      },

      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },

      isRead: {
        type: Boolean,
        default: false,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

export default Notification;