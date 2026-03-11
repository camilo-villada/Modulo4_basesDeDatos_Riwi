-- Create main database.
CREATE DATABASE IF NOT EXISTS db_megastore_exam;
USE db_megastore_exam;

-- Customers table: stores unique client information.
CREATE TABLE customers (
    id_customer INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(200) NOT NULL
);

-- Categories table: product classification catalog.
CREATE TABLE categories (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Suppliers table: vendor/provider information.
CREATE TABLE suppliers (
    id_supplier INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL
);

-- Products table: relates to category and supplier.
CREATE TABLE products (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    id_category INT NOT NULL,
    id_supplier INT NOT NULL,
    FOREIGN KEY (id_category) REFERENCES categories(id_category),
    FOREIGN KEY (id_supplier) REFERENCES suppliers(id_supplier)
);

-- Orders table: each purchase transaction linked to a customer.
CREATE TABLE orders (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    id_customer INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (id_customer) REFERENCES customers(id_customer)
);

-- Order items table: line items linking orders to products.
CREATE TABLE order_items (
    id_order_item INT AUTO_INCREMENT PRIMARY KEY,
    id_order INT NOT NULL,
    id_product INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_order) REFERENCES orders(id_order),
    FOREIGN KEY (id_product) REFERENCES products(id_product),
    UNIQUE KEY uq_order_product (id_order, id_product)
);

-- Indexes to optimize frequent queries and JOINs.
CREATE INDEX idx_products_category   ON products(id_category);
CREATE INDEX idx_products_supplier   ON products(id_supplier);
CREATE INDEX idx_orders_customer     ON orders(id_customer);
CREATE INDEX idx_orders_date         ON orders(date);
CREATE INDEX idx_order_items_product ON order_items(id_product);


-- STORED PROCEDURE: Get full customer purchase summary.

DELIMITER //
CREATE PROCEDURE sp_customer_summary(IN p_customer_id INT)
BEGIN
    SELECT
        c.name, c.email, c.phone, c.address,
        COUNT(DISTINCT o.id_order) AS total_orders,
        COALESCE(SUM(oi.quantity), 0) AS total_items,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_spent
    FROM customers c
    LEFT JOIN orders o ON c.id_customer = o.id_customer
    LEFT JOIN order_items oi ON o.id_order = oi.id_order
    WHERE c.id_customer = p_customer_id
    GROUP BY c.id_customer;
END //
DELIMITER ;


-- TRIGGER: Prevent negative quantity in order_items.

DELIMITER //
CREATE TRIGGER trg_order_items_check_quantity
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
    IF NEW.quantity <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Quantity must be greater than zero';
    END IF;
    IF NEW.unit_price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unit price cannot be negative';
    END IF;
END //
DELIMITER ;


-- TRIGGER: Prevent negative price on product insert/update.

DELIMITER //
CREATE TRIGGER trg_products_check_price
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product price cannot be negative';
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_products_check_price_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
    IF NEW.price < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product price cannot be negative';
    END IF;
END //
DELIMITER ;
