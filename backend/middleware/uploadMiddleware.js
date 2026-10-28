import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.resolve("uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ==========================================
// STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, uniqueName);
  },
});

// ==========================================
// ALLOWED FILE TYPES
// ==========================================

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Audio
  "audio/mpeg",
  "audio/wav",

  // Video
  "video/mp4",
  "video/webm",

  // Archive
  "application/zip",
];

// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

export default upload;