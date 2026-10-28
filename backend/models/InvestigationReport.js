import mongoose from "mongoose";

const investigationReportSchema =
  new mongoose.Schema(
    {
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

      summary: {
        type: String,
        required: true,
        trim: true,
      },

      findings: {
        type: String,
        required: true,
        trim: true,
      },

      conclusion: {
        type: String,
        required: true,
        trim: true,
      },

      preparedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: [
          "draft",
          "submitted",
          "reviewed",
          "approved",
        ],
        default: "draft",
        index: true,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      approvedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const InvestigationReport =
  mongoose.model(
    "InvestigationReport",
    investigationReportSchema
  );

export default InvestigationReport;