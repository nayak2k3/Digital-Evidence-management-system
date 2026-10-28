import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    evidenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    evidenceType: {
      type: String,
      required: true,
      enum: [
        "document",
        "image",
        "video",
        "audio",
        "device",
        "email",
        "other",
      ],
    },

    fileName: {
      type: String,
      default: null,
    },

    filePath: {
      type: String,
      default: null,
    },

    fileHash: {
      type: String,
      default: null,
      index: true,
    },

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    collectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "collected",
        "uploaded",
        "verified",
        "under_analysis",
        "analyzed",
        "submitted",
      ],
      default: "collected",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Evidence = mongoose.model(
  "Evidence",
  evidenceSchema
);

export default Evidence;