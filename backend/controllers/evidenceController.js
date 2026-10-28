import mongoose from "mongoose";
import Evidence from "../models/Evidence.js";
import Case from "../models/Case.js";
import EvidenceActivity from "../models/EvidenceActivity.js";

import crypto from "crypto";
import fs from "fs";

import createAuditLog from "../utils/createAuditLog.js";
import createNotification from "../utils/createNotification.js";

// ==========================================
// CREATE EVIDENCE
// ==========================================

export const createEvidence = async (req, res) => {
  try {
    const {
      evidenceNumber,
      caseId,
      title,
      description,
      evidenceType,
    } = req.body;

    // ==========================================
    // VALIDATE REQUIRED FIELDS
    // ==========================================

    if (
      !evidenceNumber ||
      !caseId ||
      !title ||
      !description ||
      !evidenceType
    ) {
      return res.status(400).json({
        message:
          "Evidence number, case, title, description and evidence type are required",
      });
    }

    // ==========================================
    // VALIDATE CASE ID
    // ==========================================

    if (!mongoose.isValidObjectId(caseId)) {
      return res.status(400).json({
        message: "Invalid case ID",
      });
    }

    // ==========================================
    // CHECK FILE
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        message: "Evidence file is required",
      });
    }

    // ==========================================
    // FIND CASE
    // ==========================================

    const caseItem = await Case.findById(caseId);

    if (!caseItem) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // ==========================================
    // INVESTIGATOR RESOURCE AUTHORIZATION
    // ==========================================

    if (req.user.role === "investigator") {
      if (
        !caseItem.assignedInvestigator ||
        caseItem.assignedInvestigator.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only add evidence to cases assigned to you",
        });
      }
    }

    // ==========================================
    // CHECK DUPLICATE EVIDENCE NUMBER
    // ==========================================

    const existingEvidence =
      await Evidence.findOne({
        evidenceNumber,
      });

    if (existingEvidence) {
      return res.status(400).json({
        message: "Evidence number already exists",
      });
    }

    // ==========================================
    // FILE INFORMATION
    // ==========================================

    const fileName = req.file.originalname;
    const filePath = req.file.path;

    // ==========================================
    // READ FILE
    // ==========================================

    const fileBuffer = fs.readFileSync(
      req.file.path
    );

    // ==========================================
    // GENERATE SHA-256 HASH
    // ==========================================

    const fileHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // ==========================================
    // CREATE EVIDENCE
    // ==========================================

    const evidence = await Evidence.create({
      evidenceNumber,
      caseId,
      title,
      description,
      evidenceType,
      fileName,
      filePath,
      fileHash,
      collectedBy: req.user.userId,
    });

    // ==========================================
    // CREATE EVIDENCE ACTIVITY
    // ==========================================

    await EvidenceActivity.create({
      evidenceId: evidence._id,
      action: "collected",
      performedBy: req.user.userId,
      description:
        "Evidence was collected and uploaded",
    });

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "CREATE_EVIDENCE",
      resourceType: "Evidence",
      resourceId: evidence._id,
      description:
        `Evidence ${evidence.evidenceNumber} was created and uploaded`,
      ipAddress: req.ip,
    });

    // ==========================================
    // NOTIFY ASSIGNED INVESTIGATOR
    // ==========================================

    if (
      caseItem.assignedInvestigator &&
      caseItem.assignedInvestigator.toString() !==
        req.user.userId
    ) {
      await createNotification({
        recipient:
          caseItem.assignedInvestigator,

        title: "New Evidence Uploaded",

        message:
          `Evidence ${evidence.evidenceNumber} was uploaded for case ${caseItem.caseNumber}`,

        type: "evidence_uploaded",

        resourceType: "Evidence",

        resourceId: evidence._id,
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message: "Evidence created successfully",
      evidence,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create evidence",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL EVIDENCE
// ==========================================

export const getEvidence = async (req, res) => {
  try {
    let filter = {};

    // ==========================================
    // INVESTIGATOR FILTER
    // ==========================================

    if (req.user.role === "investigator") {
      const assignedCases = await Case.find({
        assignedInvestigator: req.user.userId,
      }).select("_id");

      const caseIds = assignedCases.map(
        (caseItem) => caseItem._id
      );

      filter.caseId = {
        $in: caseIds,
      };
    }

    // ==========================================
    // GET EVIDENCE
    // ==========================================

    const evidence = await Evidence.find(filter)
      .populate(
        "caseId",
        "caseNumber title status"
      )
      .populate(
        "collectedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: evidence.length,
      evidence,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch evidence",
      error: error.message,
    });
  }
};

// ==========================================
// GET EVIDENCE BY ID
// ==========================================

export const getEvidenceById = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE EVIDENCE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid evidence ID",
      });
    }

    // ==========================================
    // FIND EVIDENCE
    // ==========================================

    const evidence =
      await Evidence.findById(req.params.id)
        .populate(
          "caseId",
          "caseNumber title status assignedInvestigator"
        )
        .populate(
          "collectedBy",
          "name email role"
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
            "You can only access evidence from your assigned cases",
        });
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      evidence,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch evidence",
      error: error.message,
    });
  }
};

// ==========================================
// VERIFY EVIDENCE INTEGRITY
// ==========================================

export const verifyEvidence = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE EVIDENCE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid evidence ID",
      });
    }

    // ==========================================
    // FIND EVIDENCE
    // ==========================================

    const evidence =
      await Evidence.findById(req.params.id)
        .populate(
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
            "You can only verify evidence from your assigned cases",
        });
      }
    }

    // ==========================================
    // CHECK FILE PATH
    // ==========================================

    if (!evidence.filePath) {
      return res.status(400).json({
        message: "Evidence file path not found",
      });
    }

    // ==========================================
    // CHECK FILE EXISTS
    // ==========================================

    if (!fs.existsSync(evidence.filePath)) {
      return res.status(404).json({
        message: "Evidence file no longer exists",
      });
    }

    // ==========================================
    // READ CURRENT FILE
    // ==========================================

    const fileBuffer = fs.readFileSync(
      evidence.filePath
    );

    // ==========================================
    // GENERATE CURRENT HASH
    // ==========================================

    const currentHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // ==========================================
    // COMPARE HASHES
    // ==========================================

    const isValid =
      currentHash === evidence.fileHash;

    // ==========================================
    // CREATE EVIDENCE ACTIVITY
    // ==========================================

    await EvidenceActivity.create({
      evidenceId: evidence._id,

      action: isValid
        ? "verified"
        : "verification_failed",

      performedBy: req.user.userId,

      description: isValid
        ? "Evidence integrity verified successfully"
        : "Evidence integrity verification failed. File hash does not match the original hash.",
    });

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,

      action: "VERIFY_EVIDENCE",

      resourceType: "Evidence",

      resourceId: evidence._id,

      description: isValid
        ? `Evidence ${evidence.evidenceNumber} integrity verified successfully`
        : `Evidence ${evidence.evidenceNumber} integrity verification failed`,

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

        title: isValid
          ? "Evidence Verified"
          : "Evidence Verification Failed",

        message: isValid
          ? `Evidence ${evidence.evidenceNumber} passed integrity verification`
          : `Evidence ${evidence.evidenceNumber} failed integrity verification`,

        type: isValid
          ? "evidence_verified"
          : "evidence_verification_failed",

        resourceType: "Evidence",

        resourceId: evidence._id,
      });
    }

    // ==========================================
    // VERIFICATION FAILED RESPONSE
    // ==========================================

    if (!isValid) {
      return res.status(200).json({
        message:
          "Evidence integrity verification failed",

        verified: false,

        originalHash: evidence.fileHash,

        currentHash,
      });
    }

    // ==========================================
    // VERIFICATION SUCCESS RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Evidence integrity verified successfully",

      verified: true,

      hash: currentHash,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to verify evidence",

      error: error.message,
    });
  }
};