import Case from "../models/Case.js";
import Evidence from "../models/Evidence.js";
import InvestigationReport from "../models/InvestigationReport.js";

// ==========================================
// GET DASHBOARD STATISTICS
// ==========================================

export const getDashboardStats = async (
  req,
  res
) => {
  try {
    // ==========================================
    // CASE FILTER
    // ==========================================

    let caseFilter = {};

    // Investigator can see only assigned cases
    if (req.user.role === "investigator") {
      caseFilter.assignedInvestigator =
        req.user.userId;
    }

    // ==========================================
    // CASE STATISTICS
    // ==========================================

    const totalCases =
      await Case.countDocuments(caseFilter);

    const openCases =
      await Case.countDocuments({
        ...caseFilter,
        status: "open",
      });

    const underInvestigationCases =
      await Case.countDocuments({
        ...caseFilter,
        status: "under_investigation",
      });

    const closedCases =
      await Case.countDocuments({
        ...caseFilter,
        status: "closed",
      });

    const archivedCases =
      await Case.countDocuments({
        ...caseFilter,
        status: "archived",
      });

    // ==========================================
    // EVIDENCE FILTER
    // ==========================================

    let evidenceFilter = {};

    if (req.user.role === "investigator") {
      const assignedCases =
        await Case.find({
          assignedInvestigator:
            req.user.userId,
        }).select("_id");

      const caseIds = assignedCases.map(
        (caseItem) => caseItem._id
      );

      evidenceFilter.caseId = {
        $in: caseIds,
      };
    }

    // ==========================================
    // EVIDENCE STATISTICS
    // ==========================================

    const totalEvidence =
      await Evidence.countDocuments(
        evidenceFilter
      );

    const collectedEvidence =
      await Evidence.countDocuments({
        ...evidenceFilter,
        status: "collected",
      });

    const uploadedEvidence =
      await Evidence.countDocuments({
        ...evidenceFilter,
        status: "uploaded",
      });

    const verifiedEvidence =
      await Evidence.countDocuments({
        ...evidenceFilter,
        status: "verified",
      });

    const underAnalysisEvidence =
      await Evidence.countDocuments({
        ...evidenceFilter,
        status: "under_analysis",
      });

    const analyzedEvidence =
      await Evidence.countDocuments({
        ...evidenceFilter,
        status: "analyzed",
      });

    const submittedEvidence =
      await Evidence.countDocuments({
        ...evidenceFilter,
        status: "submitted",
      });

    // ==========================================
    // REPORT FILTER
    // ==========================================

    let reportFilter = {};

    if (req.user.role === "investigator") {
      const assignedCases =
        await Case.find({
          assignedInvestigator:
            req.user.userId,
        }).select("_id");

      const caseIds = assignedCases.map(
        (caseItem) => caseItem._id
      );

      reportFilter.caseId = {
        $in: caseIds,
      };
    }

    // ==========================================
    // REPORT STATISTICS
    // ==========================================

    const totalReports =
      await InvestigationReport.countDocuments(
        reportFilter
      );

    const draftReports =
      await InvestigationReport.countDocuments({
        ...reportFilter,
        status: "draft",
      });

    const submittedReports =
      await InvestigationReport.countDocuments({
        ...reportFilter,
        status: "submitted",
      });

    const reviewedReports =
      await InvestigationReport.countDocuments({
        ...reportFilter,
        status: "reviewed",
      });

    const approvedReports =
      await InvestigationReport.countDocuments({
        ...reportFilter,
        status: "approved",
      });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      message:
        "Dashboard statistics fetched successfully",

      cases: {
        total: totalCases,
        open: openCases,
        underInvestigation:
          underInvestigationCases,
        closed: closedCases,
        archived: archivedCases,
      },

      evidence: {
        total: totalEvidence,
        collected: collectedEvidence,
        uploaded: uploadedEvidence,
        verified: verifiedEvidence,
        underAnalysis:
          underAnalysisEvidence,
        analyzed: analyzedEvidence,
        submitted: submittedEvidence,
      },

      reports: {
        total: totalReports,
        draft: draftReports,
        submitted: submittedReports,
        reviewed: reviewedReports,
        approved: approvedReports,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};