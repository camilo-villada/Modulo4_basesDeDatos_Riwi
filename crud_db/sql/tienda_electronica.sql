CREATE DATABASE IF NOT EXISTS tienda_electronica;
USE tienda_electronica;

-- tabla clientes
CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  ciudad VARCHAR(80)
);

-- tabla sucursales
CREATE TABLE sucursales (
  id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL
);

-- tabla vendedores
CREATE TABLE vendedores (
  id_vendedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  id_sucursal INT NOT NULL,
  FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal)
);

-- tabla categorias
CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- tabla productos
CREATE TABLE productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  id_categoria INT NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

-- tabla pedidos
CREATE TABLE pedidos (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  fecha_pedido DATE NOT NULL,
  id_cliente INT NOT NULL,
  id_vendedor INT NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  FOREIGN KEY (id_vendedor) REFERENCES vendedores(id_vendedor)
);

-- tabla detalle_pedido
CREATE TABLE detalle_pedido (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- datos minimos para probar
INSERT INTO sucursales (nombre) VALUES
("Centro"),
("Norte");

INSERT INTO vendedores (nombre, id_sucursal) VALUES
("Laura Gomez", 1),
("Juan Ramirez", 2);

INSERT INTO categorias (nombre) VALUES
("Tecnologia");

INSERT INTO clientes (nombre, email, telefono, ciudad) VALUES
("Carlos Perez", "carlos@gmail.com", "3001234567", "Medellin"),
("Ana Torres", "ana@gmail.com", "3017654321", "Bogota"),
("Pedro Ruiz", "pedro@gmail.com", "3021112233", "Cali");

INSERT INTO productos (nombre, id_categoria, precio) VALUES
("Laptop HP", 1, 3500000),
("Mouse Logitech", 1, 80000),
("Teclado Redragon", 1, 150000),
("Monitor Samsung", 1, 900000);

INSERT INTO pedidos (fecha_pedido, id_cliente, id_vendedor) VALUES
("2026-02-01", 1, 1),
("2026-02-02", 2, 2),
("2026-02-03", 3, 1);

INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1, 1, 1, 3500000),
(1, 2, 2, 80000),
(2, 3, 1, 150000),
(3, 4, 1, 900000),
(3, 2, 1, 80000);
