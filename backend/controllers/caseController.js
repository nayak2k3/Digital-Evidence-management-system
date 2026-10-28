import mongoose from "mongoose";
import Case from "../models/Case.js";
import User from "../models/User.js";

import createAuditLog from "../utils/createAuditLog.js";
import createNotification from "../utils/createNotification.js";

// ==========================================
// CREATE CASE
// ==========================================

export const createCase = async (req, res) => {
  try {
    const {
      caseNumber,
      title,
      description,
      caseType,
      priority,
    } = req.body;

    // ==========================================
    // VALIDATE REQUIRED FIELDS
    // ==========================================

    if (
      !caseNumber ||
      !title ||
      !description ||
      !caseType
    ) {
      return res.status(400).json({
        message:
          "Case number, title, description and case type are required",
      });
    }

    const normalizedCaseType = String(caseType)
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    // ==========================================
    // CHECK DUPLICATE CASE NUMBER
    // ==========================================

    const existingCase = await Case.findOne({
      caseNumber,
    });

    if (existingCase) {
      return res.status(400).json({
        message: "Case number already exists",
      });
    }

    // ==========================================
    // CREATE CASE
    // ==========================================

    const newCase = await Case.create({
      caseNumber,
      title,
      description,
      caseType: normalizedCaseType,
      priority,
      createdBy: req.user.userId,
    });

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "CREATE_CASE",
      resourceType: "Case",
      resourceId: newCase._id,
      description:
        `Case ${newCase.caseNumber} was created`,
      ipAddress: req.ip,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message: "Case created successfully",
      case: newCase,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Case number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message:
          "Please enter valid case details, including a supported case type and priority.",
      });
    }

    console.error("CREATE CASE ERROR:", error);
    res.status(500).json({
      message: "Failed to create case",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL CASES
// ==========================================

export const getCases = async (req, res) => {
  try {
    let filter = {};

    // ==========================================
    // INVESTIGATOR FILTER
    // ==========================================

    if (req.user.role === "investigator") {
      filter.assignedInvestigator =
        req.user.userId;
    }

    // ==========================================
    // GET CASES
    // ==========================================

    const cases = await Case.find(filter)
      .populate(
        "createdBy",
        "name email role"
      )
      .populate(
        "assignedInvestigator",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: cases.length,
      cases,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cases",
      error: error.message,
    });
  }
};

// ==========================================
// GET CASE BY ID
// ==========================================

export const getCaseById = async (req, res) => {
  try {
    // ==========================================
    // VALIDATE CASE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid case ID",
      });
    }

    // ==========================================
    // FIND CASE
    // ==========================================

    const caseItem =
      await Case.findById(req.params.id)
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "assignedInvestigator",
          "name email role"
        );

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
        caseItem.assignedInvestigator._id.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only access cases assigned to you",
        });
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      case: caseItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch case",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE CASE
// ==========================================

export const updateCase = async (req, res) => {
  try {
    // ==========================================
    // VALIDATE CASE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid case ID",
      });
    }

    const {
      title,
      description,
      caseType,
      priority,
      status,
    } = req.body;

    // ==========================================
    // FIND CASE
    // ==========================================

    const caseItem =
      await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // ==========================================
    // UPDATE FIELDS
    // ==========================================

    if (title !== undefined) {
      caseItem.title = title;
    }

    if (description !== undefined) {
      caseItem.description = description;
    }

    if (caseType !== undefined) {
      caseItem.caseType = caseType;
    }

    if (priority !== undefined) {
      caseItem.priority = priority;
    }

    if (status !== undefined) {
      caseItem.status = status;
    }

    await caseItem.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "UPDATE_CASE",
      resourceType: "Case",
      resourceId: caseItem._id,
      description:
        `Case ${caseItem.caseNumber} was updated`,
      ipAddress: req.ip,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message: "Case updated successfully",
      case: caseItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update case",
      error: error.message,
    });
  }
};

// ==========================================
// ASSIGN INVESTIGATOR
// ==========================================

export const assignInvestigator = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE CASE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid case ID",
      });
    }

    const { investigatorId } = req.body;

    // ==========================================
    // VALIDATE INVESTIGATOR ID
    // ==========================================

    if (!investigatorId) {
      return res.status(400).json({
        message: "Investigator ID is required",
      });
    }

    if (!mongoose.isValidObjectId(investigatorId)) {
      return res.status(400).json({
        message: "Invalid investigator ID",
      });
    }

    // ==========================================
    // FIND CASE
    // ==========================================

    const caseItem =
      await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // ==========================================
    // FIND INVESTIGATOR
    // ==========================================

    const investigator =
      await User.findById(investigatorId);

    if (!investigator) {
      return res.status(404).json({
        message: "Investigator not found",
      });
    }

    // ==========================================
    // CHECK ROLE
    // ==========================================

    if (investigator.role !== "investigator") {
      return res.status(400).json({
        message:
          "Selected user is not an investigator",
      });
    }

    // ==========================================
    // CHECK ACTIVE STATUS
    // ==========================================

    if (!investigator.isActive) {
      return res.status(400).json({
        message:
          "Selected investigator is inactive",
      });
    }

    // ==========================================
    // ASSIGN INVESTIGATOR
    // ==========================================

    caseItem.assignedInvestigator =
      investigatorId;

    await caseItem.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "ASSIGN_CASE",
      resourceType: "Case",
      resourceId: caseItem._id,
      description:
        `Case ${caseItem.caseNumber} was assigned to investigator ${investigator.name}`,
      ipAddress: req.ip,
    });

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================

    await createNotification({
      recipient: investigatorId,
      title: "New Case Assigned",
      message:
        `Case ${caseItem.caseNumber} has been assigned to you`,
      type: "case_assigned",
      resourceType: "Case",
      resourceId: caseItem._id,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Investigator assigned successfully",
      case: caseItem,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to assign investigator",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE CASE STATUS
// ==========================================

export const updateCaseStatus = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE CASE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid case ID",
      });
    }

    const { status } = req.body;

    // ==========================================
    // VALID STATUSES
    // ==========================================

    const allowedStatuses = [
      "open",
      "under_investigation",
      "closed",
      "archived",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid case status",
      });
    }

    // ==========================================
    // FIND CASE
    // ==========================================

    const caseItem =
      await Case.findById(req.params.id);

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
            "You can only update cases assigned to you",
        });
      }
    }

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    caseItem.status = status;

    await caseItem.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "UPDATE_CASE_STATUS",
      resourceType: "Case",
      resourceId: caseItem._id,
      description:
        `Case ${caseItem.caseNumber} status changed to ${status}`,
      ipAddress: req.ip,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Case status updated successfully",
      case: caseItem,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update case status",
      error: error.message,
    });
  }
};

// ==========================================
// ARCHIVE CASE
// ==========================================

export const archiveCase = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE CASE ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid case ID",
      });
    }

    // ==========================================
    // FIND CASE
    // ==========================================

    const caseItem =
      await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    // ==========================================
    // ARCHIVE CASE
    // ==========================================

    caseItem.status = "archived";

    await caseItem.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "ARCHIVE_CASE",
      resourceType: "Case",
      resourceId: caseItem._id,
      description:
        `Case ${caseItem.caseNumber} was archived`,
      ipAddress: req.ip,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message: "Case archived successfully",
      case: caseItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to archive case",
      error: error.message,
    });
  }
};