const express = require("express");
const { getRevenue } = require("../controllers/report.controller");

const router = express.Router();

router.get("/revenue", getRevenue);

module.exports = router;
