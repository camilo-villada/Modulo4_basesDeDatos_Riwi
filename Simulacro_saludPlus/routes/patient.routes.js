const express = require("express");
const { getPatientHistoryByEmail } = require("../controllers/patient.controller");

const router = express.Router();

router.get("/:email/history", getPatientHistoryByEmail);

module.exports = router;
