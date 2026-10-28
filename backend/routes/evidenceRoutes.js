import express from "express";

import {
  createEvidence,
  getEvidence,
  getEvidenceById,
  verifyEvidence,
} from "../controllers/evidenceController.js";

import { protect } from "../middleware/authMiddleware.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ==========================================
// CREATE EVIDENCE
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator"
  ),
  upload.single("evidenceFile"),
  createEvidence
);

// ==========================================
// GET ALL EVIDENCE
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
  getEvidence
);

// ==========================================
// VERIFY EVIDENCE
// IMPORTANT: Keep this BEFORE /:id
// ==========================================

router.get(
  "/:id/verify",
  protect,
  authorizeRoles(
    "admin",
    "superadmin",
    "investigator",
    "forensic_analyst"
  ),
  verifyEvidence
);

// ==========================================
// GET EVIDENCE BY ID
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
  getEvidenceById
);

export default router;