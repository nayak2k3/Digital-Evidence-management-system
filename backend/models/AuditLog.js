import mongoose from "mongoose";

const auditLogSchema =
  new mongoose.Schema(
    {
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      action: {
        type: String,
        required: true,
        enum: [
          "LOGIN",
          "REGISTER",
          "CREATE_CASE",
          "UPDATE_CASE",
          "ASSIGN_CASE",
          "UPDATE_CASE_STATUS",
          "ARCHIVE_CASE",
          "CREATE_EVIDENCE",
          "VERIFY_EVIDENCE",
          "UPDATE_EVIDENCE",
          "CREATE_REPORT",
          "SUBMIT_REPORT",
          "REVIEW_REPORT",
          "APPROVE_REPORT",
        ],
        index: true,
      },

      resourceType: {
        type: String,
        required: true,
        enum: [
          "User",
          "Case",
          "Evidence",
          "Report",
        ],
        index: true,
      },

      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      ipAddress: {
        type: String,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const AuditLog =
  mongoose.model(
    "AuditLog",
    auditLogSchema
  );

export default AuditLog;