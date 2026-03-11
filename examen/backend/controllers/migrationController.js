// Service that runs the migration from uploaded file.
const { processMigration } = require('../services/migrationService');

// Endpoint: receives file and triggers migration process.
const uploadMigration = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const results = await processMigration(req.file.path);
    res.status(200).json({ message: 'Migration completed', success: results.success, errors: results.errors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadMigration };
