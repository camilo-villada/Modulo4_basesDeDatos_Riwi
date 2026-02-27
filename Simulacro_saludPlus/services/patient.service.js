const PatientHistory = require("../models/patientHistory.model");

async function getPatientHistory(email) {
  return PatientHistory.findOne({ patientEmail: email }).lean();
}

module.exports = { getPatientHistory };
