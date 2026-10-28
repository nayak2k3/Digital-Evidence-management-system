import mongoose from "mongoose";

const evidenceActivitySchema =
  new mongoose.Schema(
    {
      evidenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Evidence",
        required: true,
        index: true,
      },

      action: {
        type: String,
        required: true,
        enum: [
          "collected",
          "uploaded",
          "verified",
          "verification_failed",
          "under_analysis",
          "analyzed",
          "submitted",
          "viewed",
        ],
        index: true,
      },

      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      timestamp: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

const EvidenceActivity =
  mongoose.model(
    "EvidenceActivity",
    evidenceActivitySchema
  );

export default EvidenceActivity;