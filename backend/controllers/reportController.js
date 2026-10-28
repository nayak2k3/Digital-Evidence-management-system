import mongoose from "mongoose";
import InvestigationReport from "../models/InvestigationReport.js";
import Case from "../models/Case.js";

import createAuditLog from "../utils/createAuditLog.js";
import createNotification from "../utils/createNotification.js";
import notifyUsersByRole from "../utils/notifyUsersByRole.js";

// ==========================================
// CREATE REPORT
// ==========================================

export const createReport = async (req, res) => {
  try {
    const {
      caseId,
      title,
      summary,
      findings,
      conclusion,
    } = req.body;

    // ==========================================
    // VALIDATE REQUIRED FIELDS
    // ==========================================

    if (
      !caseId ||
      !title ||
      !summary ||
      !findings ||
      !conclusion
    ) {
      return res.status(400).json({
        message:
          "Case, title, summary, findings and conclusion are required",
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
            "You can only create reports for cases assigned to you",
        });
      }
    }

    // ==========================================
    // CREATE REPORT
    // ==========================================

    const report =
      await InvestigationReport.create({
        caseId,
        title,
        summary,
        findings,
        conclusion,
        preparedBy: req.user.userId,
      });

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "CREATE_REPORT",
      resourceType: "Report",
      resourceId: report._id,
      description:
        `Investigation report "${report.title}" was created`,
      ipAddress: req.ip,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message:
        "Investigation report created successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to create investigation report",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL REPORTS
// ==========================================

export const getReports = async (req, res) => {
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
    // GET REPORTS
    // ==========================================

    const reports =
      await InvestigationReport.find(filter)
        .populate(
          "caseId",
          "caseNumber title status"
        )
        .populate(
          "preparedBy",
          "name email role"
        )
        .populate(
          "reviewedBy",
          "name email role"
        )
        .populate(
          "approvedBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

// ==========================================
// GET REPORT BY ID
// ==========================================

export const getReportById = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE REPORT ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    // ==========================================
    // FIND REPORT
    // ==========================================

    const report =
      await InvestigationReport.findById(
        req.params.id
      )
        .populate(
          "caseId",
          "caseNumber title status assignedInvestigator"
        )
        .populate(
          "preparedBy",
          "name email role"
        )
        .populate(
          "reviewedBy",
          "name email role"
        )
        .populate(
          "approvedBy",
          "name email role"
        );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ==========================================
    // INVESTIGATOR RESOURCE AUTHORIZATION
    // ==========================================

    if (req.user.role === "investigator") {
      if (
        !report.caseId.assignedInvestigator ||
        report.caseId.assignedInvestigator.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You can only access reports from your assigned cases",
        });
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

// ==========================================
// SUBMIT REPORT
// ==========================================

export const submitReport = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE REPORT ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    // ==========================================
    // FIND REPORT
    // ==========================================

    const report =
      await InvestigationReport.findById(
        req.params.id
      ).populate(
        "caseId",
        "caseNumber title status"
      );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ==========================================
    // ONLY CREATOR CAN SUBMIT
    // ==========================================

    if (
      report.preparedBy.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "Only the report creator can submit this report",
      });
    }

    // ==========================================
    // CHECK STATUS
    // ==========================================

    if (report.status !== "draft") {
      return res.status(400).json({
        message:
          "Only draft reports can be submitted",
      });
    }

    // ==========================================
    // UPDATE REPORT
    // ==========================================

    report.status = "submitted";
    report.submittedAt = new Date();

    await report.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "SUBMIT_REPORT",
      resourceType: "Report",
      resourceId: report._id,
      description:
        `Investigation report "${report.title}" was submitted for review`,
      ipAddress: req.ip,
    });

    // ==========================================
    // NOTIFY ADMIN + SUPERADMIN
    // ==========================================

    await notifyUsersByRole({
      roles: [
        "admin",
        "superadmin",
      ],

      title: "Investigation Report Submitted",

      message:
        `Report "${report.title}" for case ${report.caseId.caseNumber} has been submitted for review`,

      type: "report_submitted",

      resourceType: "Report",

      resourceId: report._id,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Investigation report submitted successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to submit report",
      error: error.message,
    });
  }
};

// ==========================================
// REVIEW REPORT
// ==========================================

export const reviewReport = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE REPORT ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    // ==========================================
    // FIND REPORT
    // ==========================================

    const report =
      await InvestigationReport.findById(
        req.params.id
      );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ==========================================
    // CHECK STATUS
    // ==========================================

    if (report.status !== "submitted") {
      return res.status(400).json({
        message:
          "Only submitted reports can be reviewed",
      });
    }

    // ==========================================
    // CREATOR CANNOT REVIEW OWN REPORT
    // ==========================================

    if (
      report.preparedBy.toString() ===
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You cannot review your own report",
      });
    }

    // ==========================================
    // UPDATE REPORT
    // ==========================================

    report.status = "reviewed";
    report.reviewedBy = req.user.userId;
    report.reviewedAt = new Date();

    await report.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "REVIEW_REPORT",
      resourceType: "Report",
      resourceId: report._id,
      description:
        `Investigation report "${report.title}" was reviewed`,
      ipAddress: req.ip,
    });

    // ==========================================
    // NOTIFY REPORT CREATOR
    // ==========================================

    await createNotification({
      recipient: report.preparedBy,

      title: "Investigation Report Reviewed",

      message:
        `Your investigation report "${report.title}" has been reviewed`,

      type: "report_reviewed",

      resourceType: "Report",

      resourceId: report._id,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Investigation report reviewed successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to review report",
      error: error.message,
    });
  }
};

// ==========================================
// APPROVE REPORT
// ==========================================

export const approveReport = async (
  req,
  res
) => {
  try {
    // ==========================================
    // VALIDATE REPORT ID
    // ==========================================

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    // ==========================================
    // FIND REPORT
    // ==========================================

    const report =
      await InvestigationReport.findById(
        req.params.id
      );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ==========================================
    // CHECK STATUS
    // ==========================================

    if (report.status !== "reviewed") {
      return res.status(400).json({
        message:
          "Only reviewed reports can be approved",
      });
    }

    // ==========================================
    // CREATOR CANNOT APPROVE OWN REPORT
    // ==========================================

    if (
      report.preparedBy.toString() ===
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You cannot approve your own report",
      });
    }

    // ==========================================
    // UPDATE REPORT
    // ==========================================

    report.status = "approved";
    report.approvedBy = req.user.userId;
    report.approvedAt = new Date();

    await report.save();

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    await createAuditLog({
      performedBy: req.user.userId,
      action: "APPROVE_REPORT",
      resourceType: "Report",
      resourceId: report._id,
      description:
        `Investigation report "${report.title}" was approved`,
      ipAddress: req.ip,
    });

    // ==========================================
    // NOTIFY REPORT CREATOR
    // ==========================================

    await createNotification({
      recipient: report.preparedBy,

      title: "Investigation Report Approved",

      message:
        `Your investigation report "${report.title}" has been approved`,

      type: "report_approved",

      resourceType: "Report",

      resourceId: report._id,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Investigation report approved successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to approve report",
      error: error.message,
    });
  }
};