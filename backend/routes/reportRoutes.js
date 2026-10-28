import express from "express";

import {
  createReport,
  getReports,
  getReportById,
  submitReport,
  reviewReport,
  approveReport,
} from "../controllers/reportController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================
// CREATE REPORT
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst"
  ),
  createReport
);

// ==========================================
// GET ALL REPORTS
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst",
    "viewer"
  ),
  getReports
);

// ==========================================
// GET REPORT BY ID
// ==========================================

router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst",
    "viewer"
  ),
  getReportById
);

// ==========================================
// SUBMIT REPORT
// ==========================================

router.put(
  "/:id/submit",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst"
  ),
  submitReport
);

// ==========================================
// REVIEW REPORT
// ==========================================

router.put(
  "/:id/review",
  protect,
  authorizeRoles(
    "admin",
    "superadmin"
  ),
  reviewReport
);

// ==========================================
// APPROVE REPORT
// ==========================================

router.put(
  "/:id/approve",
  protect,
  authorizeRoles(
    "admin",
    "superadmin"
  ),
  approveReport
);

export default router;