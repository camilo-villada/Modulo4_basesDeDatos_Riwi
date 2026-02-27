const express = require("express");
const {
  getDoctors,
  getDoctorById,
  putDoctorById,
} = require("../controllers/doctor.controller");

const router = express.Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.put("/:id", putDoctorById);

module.exports = router;
