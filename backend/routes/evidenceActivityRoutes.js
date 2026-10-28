import express from "express";

import {
  getEvidenceActivity,
  updateEvidenceActivity,
} from "../controllers/evidenceActivityController.js";

import { protect } from "../middleware/authMiddleware.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================     
// GET CHAIN OF CUSTODY
// ==========================================

router.get(
  "/:evidenceId",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst",
    "viewer"
  ),
  getEvidenceActivity
);

// ==========================================
// UPDATE EVIDENCE ACTIVITY
// ==========================================

router.put(
  "/:evidenceId",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst"
  ),
  updateEvidenceActivity
);

export default router;