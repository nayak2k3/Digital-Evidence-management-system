import mongoose from "mongoose";

import EvidenceActivity from "../models/EvidenceActivity.js";
import Evidence from "../models/Evidence.js";
import Case from "../models/Case.js";

import createAuditLog from "../utils/createAuditLog.js";
import createNotification from "../utils/createNotification.js";

// ==========================================
// GET EVIDENCE ACTIVITY
// ==========================================

export const getEvidenceActivity = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE EVIDENCE ID
    // ==========================================

    if (
      !mongoose.isValidObjectId(
        req.params.evidenceId
      )
    ) {
      return res.status(400).json({
        message: "Invalid evidence ID",
      });
    }

    // ==========================================
    // FIND EVIDENCE
    // ==========================================

    const evidence = await Evidence.findById(
      req.params.evidenceId
    ).populate(
      "caseId",
      "caseNumber title status assignedInvestigator"
    );

    if (!evidence) {
      return res.status(404).json({
        message: "Evidence not found",
      });
    }

    // ==========================================
    // INVESTIGATOR RESOURCE AUTHORIZATION
    // ==========================================

    if (req.user.role === "investigator") {
      if (
        !evidence.caseId.assignedInvestigator ||
        evidence.caseId.assignedInvestigator.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only access activity for evidence from your assigned cases",
        });
      }
    }

    // ==========================================
    // GET ACTIVITY
    // ==========================================

    const activities =
      await EvidenceActivity.find({
        evidenceId: req.params.evidenceId,
      })
        .populate(
          "performedBy",
          "name email role"
        )
        .sort({
          timestamp: 1,
        });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      evidence: {
        _id: evidence._id,
        evidenceNumber: evidence.evidenceNumber,
        title: evidence.title,
        case: evidence.caseId,
      },

      count: activities.length,

      activities,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch evidence activity",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE EVIDENCE ACTIVITY / STATUS
// ==========================================

export const updateEvidenceActivity = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE EVIDENCE ID
    // ==========================================

    if (
      !mongoose.isValidObjectId(
        req.params.evidenceId
      )
    ) {
      return res.status(400).json({
        message: "Invalid evidence ID",
      });
    }

    const { action, description } = req.body;

    // ==========================================
    // ALLOWED ACTIONS
    // ==========================================

    const allowedActions = [
      "uploaded",
      "verified",
      "under_analysis",
      "analyzed",
      "submitted",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        message:
          "Invalid evidence activity action",
      });
    }

    // ==========================================
    // FIND EVIDENCE
    // ==========================================

    const evidence = await Evidence.findById(
      req.params.evidenceId
    ).populate(
      "caseId",
      "caseNumber title status assignedInvestigator"
    );

    if (!evidence) {
      return res.status(404).json({
        message: "Evidence not found",
      });
    }

    // ==========================================
    // INVESTIGATOR RESOURCE AUTHORIZATION
    // ==========================================

    if (req.user.role === "investigator") {
      if (
        !evidence.caseId.assignedInvestigator ||
        evidence.caseId.assignedInvestigator.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only update evidence from your assigned cases",
        });
      }
    }

    // ==========================================
    // ROLE-BASED ACTION PERMISSION
    // ==========================================

    if (
      action === "under_analysis" ||
      action === "analyzed"
    ) {
      if (
        ![
          "admin",
          "superadmin",
          "investigator",
          "forensic_analyst",
        ].includes(req.user.role)
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to perform this action",
        });
      }
    }

    // ==========================================
    // FORENSIC ANALYST RESTRICTION
    // ==========================================

    if (
      action === "verified" &&
      req.user.role === "forensic_analyst"
    ) {
      // Verification should normally be performed
      // through the dedicated verifyEvidence endpoint.
      return res.status(400).json({
        message:
          "Use the evidence verification endpoint to verify integrity",
      });
    }

    // ==========================================
    // UPDATE EVIDENCE STATUS
    // ==========================================

    const statusMap = {
      uploaded: "uploaded",
      verified: "verified",
      under_analysis: "under_analysis",
      analyzed: "analyzed",
      submitted: "submitted",
    };

    evidence.status = statusMap[action];

    await evidence.save();

    // ==========================================
    // CREATE ACTIVITY
    // ==========================================

    const activity =
      await EvidenceActivity.create({
        evidenceId: evidence._id,

        action,

        performedBy: req.user.userId,

        description:
          description ||
          `Evidence status changed to ${action}`,
      });

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,

      action: "UPDATE_EVIDENCE",

      resourceType: "Evidence",

      resourceId: evidence._id,

      description:
        `Evidence ${evidence.evidenceNumber} status changed to ${action}`,

      ipAddress: req.ip,
    });

    // ==========================================
    // NOTIFY ASSIGNED INVESTIGATOR
    // ==========================================

    if (
      evidence.caseId.assignedInvestigator &&
      evidence.caseId.assignedInvestigator.toString() !==
        req.user.userId
    ) {
      await createNotification({
        recipient:
          evidence.caseId.assignedInvestigator,

        title: "Evidence Status Updated",

        message:
          `Evidence ${evidence.evidenceNumber} status changed to ${action}`,

        type:
          action === "verified"
            ? "evidence_verified"
            : "system",

        resourceType: "Evidence",

        resourceId: evidence._id,
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Evidence activity updated successfully",

      evidence,

      activity,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update evidence activity",
      error: error.message,
    });
  }
};