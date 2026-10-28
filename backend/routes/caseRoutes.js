import express from "express";

import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  assignInvestigator,
  updateCaseStatus,
  archiveCase,
} from "../controllers/caseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create case
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  createCase
);

// Get all cases
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
  getCases
);

// Get one case
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
  getCaseById
);

// Update case
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  updateCase
);

// Assign investigator
router.put(
  "/:id/assign",
  protect,
  authorizeRoles("admin", "superadmin"),
  assignInvestigator
);

// Update status
router.put(
  "/:id/status",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator"
  ),
  updateCaseStatus
);
router.put(
  "/:id/archive",
  protect,
  authorizeRoles("admin", "superadmin"),
  archiveCase
);
export default router;