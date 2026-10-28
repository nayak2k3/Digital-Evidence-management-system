import express from "express";

import {
  getAuditLogs,
  getResourceAuditLogs,
} from "../controllers/auditLogController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================
// GET ALL AUDIT LOGS
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "superadmin"
  ),
  getAuditLogs
);

// ==========================================
// GET RESOURCE AUDIT LOGS
// ==========================================

router.get(
  "/:resourceType/:resourceId",
  protect,
  authorizeRoles(
    "admin",
    "superadmin"
  ),
  getResourceAuditLogs
);

export default router;