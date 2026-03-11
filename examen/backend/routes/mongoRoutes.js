// Router for MongoDB endpoints.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mongoController');

// Audit logs.
router.get('/audit-logs', ctrl.getAuditLogs);

// Customer history from MongoDB.
router.get('/customer-history/:email', ctrl.getCustomerHistory);

// Customer aggregation from MongoDB (Aggregation Framework).
router.get('/customer-aggregation/:email', ctrl.getCustomerAggregation);

module.exports = router;
