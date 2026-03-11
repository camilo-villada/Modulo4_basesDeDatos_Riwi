const mongoose = require('mongoose');

// Audit log: stores deletion records for the product audit trail.
const auditLogSchema = new mongoose.Schema({
  entity: { type: String, required: true },
  action: { type: String, required: true },
  data: { type: Object, required: true },
  deleted_at: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('audit_logs', auditLogSchema);

// Save audit log when a product is deleted.
const createAuditLog = async (entity, data) => {
  const log = new AuditLog({ entity, action: 'DELETE', data });
  return await log.save();
};

// Get all audit logs.
const getAuditLogs = async () => {
  return await AuditLog.find().sort({ deleted_at: -1 });
};

// Customer history: purchases embedded for fast single-query reads.
// Embedding chosen because past purchases are immutable and read together as one unit.
const customerHistorySchema = new mongoose.Schema({
  id_customer: { type: Number, required: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true, unique: true },
  purchases: [{
    transaction_id: String,
    date: String,
    product_name: String,
    sku: String,
    category: String,
    quantity: Number,
    unit_price: Number,
    total: Number
  }]
});

const CustomerHistory = mongoose.model('customer_histories', customerHistorySchema);

// Upsert customer history — adds purchase without duplicating.
const upsertCustomerHistory = async (data) => {
  await CustomerHistory.findOneAndUpdate(
    { customer_email: data.customer_email },
    {
      $set: {
        id_customer: data.id_customer,
        customer_name: data.customer_name,
        customer_email: data.customer_email
      },
      $addToSet: { purchases: data.purchase }
    },
    { upsert: true, returnDocument: 'after' }
  );
};

// Get customer history by email.
const getCustomerHistoryByEmail = async (email) => {
  return await CustomerHistory.findOne({ customer_email: email });
};

// Aggregation: customer purchase summary from MongoDB.
const getCustomerAggregation = async (email) => {
  return await CustomerHistory.aggregate([
    { $match: { customer_email: email } },
    { $unwind: '$purchases' },
    { $group: {
      _id: '$customer_email',
      customer_name: { $first: '$customer_name' },
      total_spent: { $sum: '$purchases.total' },
      total_orders: { $sum: 1 },
      purchases: { $push: '$purchases' }
    }}
  ]);
};

module.exports = {
  createAuditLog, getAuditLogs,
  upsertCustomerHistory, getCustomerHistoryByEmail, getCustomerAggregation
};
