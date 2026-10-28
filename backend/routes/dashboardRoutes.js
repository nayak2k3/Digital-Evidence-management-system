import express from "express";

import {
  getDashboardStats,
} from "../controllers/dashboardController.js";

import { protect } from "../middleware/authMiddleware.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

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
  getDashboardStats
);

export default router;