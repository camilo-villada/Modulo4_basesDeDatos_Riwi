// SQL pool for idempotent inserts during migration.
const { sqlPool } = require('../config/db');

// Insert customer — skip if email already exists.
const insertCustomer = async (data) => {
  const [result] = await sqlPool.execute(
    `INSERT IGNORE INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
    [data.name, data.email, data.phone, data.address]
  );
  if (result.insertId === 0) {
    const [rows] = await sqlPool.execute(`SELECT id_customer FROM customers WHERE email = ?`, [data.email]);
    return rows[0].id_customer;
  }
  return result.insertId;
};

// Insert category — skip if name already exists.
const insertCategory = async (name) => {
  const [result] = await sqlPool.execute(`INSERT IGNORE INTO categories (name) VALUES (?)`, [name]);
  if (result.insertId === 0) {
    const [rows] = await sqlPool.execute(`SELECT id_category FROM categories WHERE name = ?`, [name]);
    return rows[0].id_category;
  }
  return result.insertId;
};

// Insert supplier — skip if name already exists.
const insertSupplier = async (data) => {
  const [result] = await sqlPool.execute(
    `INSERT IGNORE INTO suppliers (name, email) VALUES (?, ?)`,
    [data.name, data.email]
  );
  if (result.insertId === 0) {
    const [rows] = await sqlPool.execute(`SELECT id_supplier FROM suppliers WHERE name = ?`, [data.name]);
    return rows[0].id_supplier;
  }
  return result.insertId;
};

// Insert product — skip if SKU already exists.
const insertProduct = async (data) => {
  const [result] = await sqlPool.execute(
    `INSERT IGNORE INTO products (sku, name, price, id_category, id_supplier) VALUES (?, ?, ?, ?, ?)`,
    [data.sku, data.name, data.price, data.id_category, data.id_supplier]
  );
  if (result.insertId === 0) {
    const [rows] = await sqlPool.execute(`SELECT id_product FROM products WHERE sku = ?`, [data.sku]);
    return rows[0].id_product;
  }
  return result.insertId;
};

// Insert order — skip if transaction_id already exists.
const insertOrder = async (data) => {
  const [result] = await sqlPool.execute(
    `INSERT IGNORE INTO orders (transaction_id, id_customer, date) VALUES (?, ?, ?)`,
    [data.transaction_id, data.id_customer, data.date]
  );
  if (result.insertId === 0) {
    const [rows] = await sqlPool.execute(`SELECT id_order FROM orders WHERE transaction_id = ?`, [data.transaction_id]);
    return rows[0].id_order;
  }
  return result.insertId;
};

// Insert order item — skip if duplicate order+product combo.
const insertOrderItem = async (data) => {
  await sqlPool.execute(
    `INSERT IGNORE INTO order_items (id_order, id_product, quantity, unit_price) VALUES (?, ?, ?, ?)`,
    [data.id_order, data.id_product, data.quantity, data.unit_price]
  );
};

module.exports = { insertCustomer, insertCategory, insertSupplier, insertProduct, insertOrder, insertOrderItem };
