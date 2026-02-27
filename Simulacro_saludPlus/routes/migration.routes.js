const path = require("path");
const express = require("express");
const multer = require("multer");
const { uploadExcel } = require("../controllers/migration.controller");

const router = express.Router();

const allowedExtensions = new Set([".xlsx", ".xls", ".csv"]);

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return cb(new Error("Solo se permiten archivos Excel o CSV"));
    }

    return cb(null, true);
  },
});

router.post("/upload", upload.single("file"), uploadExcel);

module.exports = router;
