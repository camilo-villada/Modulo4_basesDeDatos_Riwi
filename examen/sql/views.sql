USE db_megastore_exam;

-- View: Supplier inventory analysis.
CREATE OR REPLACE VIEW v_supplier_inventory AS
SELECT
    s.id_supplier,
    s.name AS supplier_name,
    s.email,
    COUNT(DISTINCT p.id_product) AS total_products,
    COALESCE(SUM(p.price), 0) AS total_inventory_value
FROM suppliers s
LEFT JOIN products p ON s.id_supplier = p.id_supplier
GROUP BY s.id_supplier, s.name, s.email
ORDER BY total_inventory_value DESC;

-- View: Product sales performance.
CREATE OR REPLACE VIEW v_product_sales AS
SELECT
    p.id_product, p.sku,
    p.name AS product_name,
    c.name AS category,
    s.name AS supplier_name,
    COALESCE(SUM(oi.quantity), 0) AS total_sold,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue
FROM products p
INNER JOIN categories c ON p.id_category = c.id_category
INNER JOIN suppliers s ON p.id_supplier = s.id_supplier
LEFT JOIN order_items oi ON p.id_product = oi.id_product
GROUP BY p.id_product, p.sku, p.name, c.name, s.name;

-- View: Customer spending summary.
CREATE OR REPLACE VIEW v_customer_spending AS
SELECT
    cu.id_customer, cu.name, cu.email, cu.phone,
    COUNT(DISTINCT o.id_order) AS total_orders,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_spent
FROM customers cu
LEFT JOIN orders o ON cu.id_customer = o.id_customer
LEFT JOIN order_items oi ON o.id_order = oi.id_order
GROUP BY cu.id_customer, cu.name, cu.email, cu.phone;
