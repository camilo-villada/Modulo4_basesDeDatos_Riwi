// SQL pool for BI/report queries.
const { sqlPool } = require('../config/db');

// 1. Supplier analysis: items sold + inventory value per supplier.
const getSupplierAnalysis = async () => {
  const [rows] = await sqlPool.execute(`
    SELECT s.id_supplier, s.name AS supplier_name, s.email,
      COUNT(DISTINCT p.id_product) AS total_products,
      COALESCE(SUM(oi.quantity), 0) AS total_items_sold,
      COALESCE((
        SELECT SUM(p2.price)
        FROM products p2
        WHERE p2.id_supplier = s.id_supplier
      ), 0) AS total_inventory_value
    FROM suppliers s
    LEFT JOIN products p ON s.id_supplier = p.id_supplier
    LEFT JOIN order_items oi ON p.id_product = oi.id_product
    GROUP BY s.id_supplier
    ORDER BY total_items_sold DESC
  `);
  return rows;
};

// 2. Customer purchase history with product details.
const getCustomerHistory = async (customerId) => {
  const [rows] = await sqlPool.execute(`
    SELECT o.transaction_id, o.date,
      p.name AS product_name, p.sku,
      oi.quantity, oi.unit_price,
      (oi.quantity * oi.unit_price) AS line_total
    FROM orders o
    INNER JOIN order_items oi ON o.id_order = oi.id_order
    INNER JOIN products p ON oi.id_product = p.id_product
    WHERE o.id_customer = ?
    ORDER BY o.date DESC
  `, [customerId]);

  // Also get total spent.
  const [total] = await sqlPool.execute(`
    SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_spent
    FROM orders o
    INNER JOIN order_items oi ON o.id_order = oi.id_order
    WHERE o.id_customer = ?
  `, [customerId]);

  return { purchases: rows, total_spent: total[0].total_spent };
};

// 3. Star products: top sold products in a category, by revenue.
const getStarProducts = async (category) => {
  const [rows] = await sqlPool.execute(`
    SELECT p.id_product, p.name, p.sku, c.name AS category,
      SUM(oi.quantity) AS total_sold,
      SUM(oi.quantity * oi.unit_price) AS total_revenue
    FROM products p
    INNER JOIN categories c ON p.id_category = c.id_category
    INNER JOIN order_items oi ON p.id_product = oi.id_product
    WHERE c.name = ?
    GROUP BY p.id_product
    ORDER BY total_revenue DESC
  `, [category]);
  return rows;
};

// Views access.
const getSupplierInventoryView = async () => {
  const [rows] = await sqlPool.execute(`SELECT * FROM v_supplier_inventory`);
  return rows;
};

const getProductSalesView = async () => {
  const [rows] = await sqlPool.execute(`SELECT * FROM v_product_sales`);
  return rows;
};

const getCustomerSpendingView = async () => {
  const [rows] = await sqlPool.execute(`SELECT * FROM v_customer_spending`);
  return rows;
};

// Stored procedure call.
const callCustomerSummary = async (customerId) => {
  const [rows] = await sqlPool.execute(`CALL sp_customer_summary(?)`, [customerId]);
  return rows[0][0];
};

module.exports = {
  getSupplierAnalysis, getCustomerHistory, getStarProducts,
  getSupplierInventoryView, getProductSalesView, getCustomerSpendingView,
  callCustomerSummary
};
