import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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

    caseType: {
      type: String,
      required: true,
      enum: [
        "cybercrime",
        "fraud",
        "theft",
        "missing_person",
        "financial_crime",
        "other",
      ],
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "open",
        "under_investigation",
        "closed",
        "archived",
      ],
      default: "open",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assignedInvestigator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Case = mongoose.model(
  "Case",
  caseSchema
);

export default Case;