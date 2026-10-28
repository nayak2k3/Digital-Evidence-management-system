import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

import connectDB from "./config/db.js";

// ==========================================
// ROUTES
// ==========================================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import evidenceActivityRoutes from "./routes/evidenceActivityRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// ==========================================
// DATABASE CONNECTION
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/cases", caseRoutes);

app.use("/api/evidence", evidenceRoutes);

app.use(
  "/api/evidence-activity",
  evidenceActivityRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);
app.use(
  "/api/audit-logs",
  auditLogRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Digital Evidence API is running",
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size cannot exceed 10 MB",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  // Unsupported file type
  if (err.message === "Unsupported file type") {
    return res.status(400).json({
      message: "Unsupported file type",
    });
  }

  // Other errors
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});