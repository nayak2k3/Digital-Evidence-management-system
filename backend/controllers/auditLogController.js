import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";

// ==========================================
// GET ALL AUDIT LOGS
// ==========================================

export const getAuditLogs = async (req, res) => {
  try {
    const {
      action,
      resourceType,
      performedBy,
      limit = 100,
    } = req.query;

    // ==========================================
    // BUILD FILTER
    // ==========================================

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (resourceType) {
      filter.resourceType = resourceType;
    }

    // ==========================================
    // VALIDATE PERFORMED BY ID
    // ==========================================

    if (performedBy) {
      if (!mongoose.isValidObjectId(performedBy)) {
        return res.status(400).json({
          message: "Invalid performedBy user ID",
        });
      }

      filter.performedBy = performedBy;
    }

    // ==========================================
    // VALIDATE LIMIT
    // ==========================================

    const parsedLimit = Number(limit);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 500
    ) {
      return res.status(400).json({
        message:
          "Limit must be between 1 and 500",
      });
    }

    // ==========================================
    // GET AUDIT LOGS
    // ==========================================

    const logs = await AuditLog.find(filter)
      .populate(
        "performedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .limit(parsedLimit);

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

// ==========================================
// GET RESOURCE AUDIT LOGS
// ==========================================

export const getResourceAuditLogs = async (
  req,
  res
) => {
  try {
    const {
      resourceType,
      resourceId,
    } = req.params;

    // ==========================================
    // VALIDATE RESOURCE TYPE
    // ==========================================

    const allowedResourceTypes = [
      "User",
      "Case",
      "Evidence",
      "Report",
    ];

    if (
      !allowedResourceTypes.includes(
        resourceType
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid resource type",
      });
    }

    // ==========================================
    // VALIDATE RESOURCE ID
    // ==========================================

    if (!mongoose.isValidObjectId(resourceId)) {
      return res.status(400).json({
        message: "Invalid resource ID",
      });
    }

    // ==========================================
    // GET RESOURCE LOGS
    // ==========================================

    const logs = await AuditLog.find({
      resourceType,
      resourceId,
    })
      .populate(
        "performedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      resourceType,
      resourceId,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch resource audit logs",
      error: error.message,
    });
  }
};