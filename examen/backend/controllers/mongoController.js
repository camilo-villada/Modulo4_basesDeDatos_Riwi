// MongoDB controller for audit logs and customer history.
const mongoRepo = require('../repositories/mongoRepository');

// Get all deletion audit logs.
const getAuditLogs = async (req, res) => {
  try {
    res.status(200).json(await mongoRepo.getAuditLogs());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer history by email (simple find).
const getCustomerHistory = async (req, res) => {
  try {
    const data = await mongoRepo.getCustomerHistoryByEmail(req.params.email);
    if (!data) return res.status(404).json({ error: 'History not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer aggregation by email (MongoDB Aggregation Framework).
const getCustomerAggregation = async (req, res) => {
  try {
    const data = await mongoRepo.getCustomerAggregation(req.params.email);
    if (!data.length) return res.status(404).json({ error: 'No data found' });
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAuditLogs, getCustomerHistory, getCustomerAggregation };
