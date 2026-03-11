// Router for migration file upload.
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadMigration } = require('../controllers/migrationController');

// Multer config: save uploaded file to uploads/ folder.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// POST /api/migration/upload — upload file and run migration.
router.post('/upload', upload.single('file'), uploadMigration);

module.exports = router;
