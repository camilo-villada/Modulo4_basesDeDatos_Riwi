// SQL pool for product CRUD operations.
const { sqlPool } = require('../config/db');

// Get all products with category and supplier names.
const getAll = async () => {
  const [rows] = await sqlPool.execute(`
    SELECT p.*, c.name AS category, s.name AS supplier
    FROM products p
    INNER JOIN categories c ON p.id_category = c.id_category
    INNER JOIN suppliers s ON p.id_supplier = s.id_supplier
  `);
  return rows;
};

// Get single product by id.
const getById = async (id) => {
  const [rows] = await sqlPool.execute(`
    SELECT p.*, c.name AS category, s.name AS supplier
    FROM products p
    INNER JOIN categories c ON p.id_category = c.id_category
    INNER JOIN suppliers s ON p.id_supplier = s.id_supplier
    WHERE p.id_product = ?
  `, [id]);
  return rows[0];
};

// Create a new product.
const create = async (data) => {
  const [result] = await sqlPool.execute(
    `INSERT INTO products (sku, name, price, id_category, id_supplier) VALUES (?, ?, ?, ?, ?)`,
    [data.sku, data.name, data.price, data.id_category, data.id_supplier]
  );
  return result.insertId;
};

// Update product by id.
const update = async (id, data) => {
  const [result] = await sqlPool.execute(
    `UPDATE products SET sku=?, name=?, price=?, id_category=?, id_supplier=? WHERE id_product=?`,
    [data.sku, data.name, data.price, data.id_category, data.id_supplier, id]
  );
  return result.affectedRows;
};

// Delete product by id.
const remove = async (id) => {
  const [result] = await sqlPool.execute(`DELETE FROM products WHERE id_product = ?`, [id]);
  return result.affectedRows;
};

// Get all categories (for frontend selects).
const getCategories = async () => {
  const [rows] = await sqlPool.execute(`SELECT * FROM categories`);
  return rows;
};

// Get all suppliers (for frontend selects).
const getSuppliers = async () => {
  const [rows] = await sqlPool.execute(`SELECT * FROM suppliers`);
  return rows;
};

module.exports = { getAll, getById, create, update, remove, getCategories, getSuppliers };
