// Router for BI report endpoints.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');

// Business Intelligence endpoints.
router.get('/supplier-analysis', ctrl.getSupplierAnalysis);
router.get('/customer-history/:customerId', ctrl.getCustomerHistory);
router.get('/star-products', ctrl.getStarProducts);

// SQL Views.
router.get('/supplier-inventory', ctrl.getSupplierInventoryView);
router.get('/product-sales', ctrl.getProductSalesView);
router.get('/customer-spending', ctrl.getCustomerSpendingView);

// Stored procedure.
router.get('/customer-summary/:customerId', ctrl.getCustomerSummary);

module.exports = router;
