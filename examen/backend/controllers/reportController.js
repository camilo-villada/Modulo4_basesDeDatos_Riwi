// Report controller for BI queries.
const repo = require('../repositories/reportRepository');

// Supplier analysis: which suppliers sold the most items.
const getSupplierAnalysis = async (req, res) => {
  try {
    res.status(200).json(await repo.getSupplierAnalysis());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Customer purchase history (SQL version).
const getCustomerHistory = async (req, res) => {
  try {
    const data = await repo.getCustomerHistory(req.params.customerId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Star products by category.
const getStarProducts = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) return res.status(400).json({ error: 'category query param is required' });
    res.status(200).json(await repo.getStarProducts(category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SQL Views.
const getSupplierInventoryView = async (req, res) => {
  try {
    res.status(200).json(await repo.getSupplierInventoryView());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductSalesView = async (req, res) => {
  try {
    res.status(200).json(await repo.getProductSalesView());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCustomerSpendingView = async (req, res) => {
  try {
    res.status(200).json(await repo.getCustomerSpendingView());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stored procedure call.
const getCustomerSummary = async (req, res) => {
  try {
    const data = await repo.callCustomerSummary(req.params.customerId);
    if (!data) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSupplierAnalysis, getCustomerHistory, getStarProducts,
  getSupplierInventoryView, getProductSalesView, getCustomerSpendingView,
  getCustomerSummary
};
