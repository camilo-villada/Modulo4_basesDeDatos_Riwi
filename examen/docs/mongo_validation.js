// MongoDB Schema Validation Script
// Run in MongoDB Shell (mongosh) or Compass to add schema validation.

db = db.getSiblingDB('db_megastore_exam');

// Validation for audit_logs collection.
db.createCollection('audit_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['entity', 'action', 'data', 'deleted_at'],
      properties: {
        entity: { bsonType: 'string', description: 'Entity type (e.g. product)' },
        action: { bsonType: 'string', enum: ['DELETE'], description: 'Action performed' },
        data: { bsonType: 'object', description: 'Snapshot of deleted record' },
        deleted_at: { bsonType: 'date', description: 'Deletion timestamp' }
      }
    }
  }
});

// Validation for customer_histories collection.
db.createCollection('customer_histories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id_customer', 'customer_name', 'customer_email'],
      properties: {
        id_customer: { bsonType: 'number', description: 'Customer ID from SQL' },
        customer_name: { bsonType: 'string' },
        customer_email: { bsonType: 'string' },
        purchases: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              transaction_id: { bsonType: 'string' },
              date: { bsonType: 'string' },
              product_name: { bsonType: 'string' },
              sku: { bsonType: 'string' },
              category: { bsonType: 'string' },
              quantity: { bsonType: 'number' },
              unit_price: { bsonType: 'number' },
              total: { bsonType: 'number' }
            }
          }
        }
      }
    }
  }
});

// Unique index to prevent duplicate customer histories.
db.customer_histories.createIndex({ customer_email: 1 }, { unique: true });

print('Schema validation and indexes created successfully.');
