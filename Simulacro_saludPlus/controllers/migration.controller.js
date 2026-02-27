const fs = require("fs/promises");
const { processExcel } = require("../services/migration.service");

async function uploadExcel(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Debes subir un archivo en el campo 'file'" });
  }

  try {
    const result = await processExcel(req.file.path);

    return res.status(200).json({
      message: "Migración completada",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al procesar el archivo",
      error: error.message,
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
}

module.exports = { uploadExcel };
