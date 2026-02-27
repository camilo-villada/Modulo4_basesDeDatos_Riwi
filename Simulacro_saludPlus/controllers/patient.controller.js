const { getPatientHistory } = require("../services/patient.service");

async function getPatientHistoryByEmail(req, res) {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email inválido" });
    }

    const history = await getPatientHistory(email);

    if (!history) {
      return res.status(404).json({ message: "Historial no encontrado" });
    }

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener historial del paciente",
      error: error.message,
    });
  }
}

module.exports = { getPatientHistoryByEmail };
