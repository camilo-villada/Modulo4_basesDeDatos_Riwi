const { getRevenueReport } = require("../services/report.service");

function isValidDateFormat(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getRevenue(req, res) {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if ((startDate && !endDate) || (!startDate && endDate)) {
      return res.status(400).json({
        message: "Debes enviar ambos parámetros startDate y endDate, o ninguno",
      });
    }

    if (startDate && endDate) {
      if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
        return res.status(400).json({
          message: "Formato de fecha inválido. Usa YYYY-MM-DD",
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          message: "startDate no puede ser mayor que endDate",
        });
      }
    }

    const report = await getRevenueReport(startDate, endDate);
    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({
      message: "Error al generar reporte de ingresos",
      error: error.message,
    });
  }
}

module.exports = { getRevenue };
