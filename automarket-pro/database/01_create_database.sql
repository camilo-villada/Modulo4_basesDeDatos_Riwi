-- ============================================================
-- AUTOMARKET PRO - SISTEMA DE COMPRA Y VENTA DE AUTOS
-- Parte 3: Implementación en MySQL (CLI)
-- ============================================================

-- 1. Crear la base de datos
DROP DATABASE IF EXISTS automarket_pro;
CREATE DATABASE automarket_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE automarket_pro;

-- ============================================================
-- MODELO ENTIDAD-RELACIÓN (MER) - NORMALIZADO (3FN)
-- ============================================================
-- Entidades:
--   PERSONA        → vendedores y compradores (unificados)
--   AUTO           → inventario de vehículos
--   TRANSACCION    → registro de compras/ventas
--
-- Relaciones:
--   PERSONA (1) ──< (N) TRANSACCION (compra o venta)
--   AUTO    (1) ──< (N) TRANSACCION (máx 1 compra + 1 venta)
-- ============================================================

-- ============================================================
-- NORMALIZACIÓN APLICADA
-- ============================================================
-- 1FN: Todos los campos son atómicos (nombre y apellido separados,
--      dirección en campos individuales). Sin atributos multivaluados.
--
-- 2FN: Los datos personales están en PERSONA, no se replican en
--      TRANSACCION. Cada tabla depende completamente de su PK.
--
-- 3FN: No se almacenan datos calculables (margen de ganancia se
--      calcula como diferencia entre precio_venta y precio_compra
--      mediante consultas). Sin dependencias transitivas.
-- ============================================================

-- 2. Tabla PERSONA (vendedores y compradores)
CREATE TABLE persona (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_persona_documento UNIQUE (documento)
) ENGINE=InnoDB;

-- 3. Tabla AUTO (inventario de vehículos)
CREATE TABLE auto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio INT NOT NULL,
    color VARCHAR(30),
    kilometraje DECIMAL(10,2) DEFAULT 0,
    tipo_combustible ENUM('gasolina','diesel','electrico','hibrido') DEFAULT 'gasolina',
    transmision ENUM('manual','automatica') DEFAULT 'manual',
    numero_puertas INT DEFAULT 4,
    estado ENUM('disponible','vendido') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_auto_placa UNIQUE (placa),
    CONSTRAINT chk_anio CHECK (anio >= 1900 AND anio <= 2030),
    CONSTRAINT chk_kilometraje CHECK (kilometraje >= 0)
) ENGINE=InnoDB;

-- 4. Tabla TRANSACCION (compras y ventas)
CREATE TABLE transaccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('compra','venta') NOT NULL,
    auto_id INT NOT NULL,
    persona_id INT NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaccion_auto FOREIGN KEY (auto_id)
        REFERENCES auto(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_transaccion_persona FOREIGN KEY (persona_id)
        REFERENCES persona(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_precio CHECK (precio > 0)
) ENGINE=InnoDB;

-- ============================================================
-- REGLAS DE INTEGRIDAD ADICIONALES (vía triggers)
-- ============================================================

-- Trigger: No permitir venta si no hay compra previa
DELIMITER //
CREATE TRIGGER trg_before_insert_transaccion
BEFORE INSERT ON transaccion
FOR EACH ROW
BEGIN
    DECLARE compra_existe INT DEFAULT 0;
    DECLARE ya_vendido INT DEFAULT 0;

    IF NEW.tipo = 'venta' THEN
        -- Verificar que el auto fue comprado previamente
        SELECT COUNT(*) INTO compra_existe
        FROM transaccion
        WHERE auto_id = NEW.auto_id AND tipo = 'compra';

        IF compra_existe = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede vender un auto sin registro previo de compra.';
        END IF;

        -- Verificar que el auto no fue vendido previamente
        SELECT COUNT(*) INTO ya_vendido
        FROM transaccion
        WHERE auto_id = NEW.auto_id AND tipo = 'venta';

        IF ya_vendido > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Este auto ya fue vendido anteriormente. Ciclo de venta único.';
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger: Actualizar estado del auto al registrar transacción
DELIMITER //
CREATE TRIGGER trg_after_insert_transaccion
AFTER INSERT ON transaccion
FOR EACH ROW
BEGIN
    IF NEW.tipo = 'venta' THEN
        UPDATE auto SET estado = 'vendido' WHERE id = NEW.auto_id;
    END IF;
END //
DELIMITER ;

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- Personas
INSERT INTO persona (documento, nombre, apellido, telefono, email, direccion, ciudad) VALUES
('1001234567', 'Carlos', 'Gómez', '3101234567', 'carlos.gomez@email.com', 'Calle 45 #12-30', 'Bogotá'),
('1009876543', 'María', 'López', '3209876543', 'maria.lopez@email.com', 'Carrera 7 #80-15', 'Medellín'),
('1005551234', 'Juan', 'Martínez', '3005551234', 'juan.martinez@email.com', 'Av. Siempre Viva 742', 'Cali'),
('1007778899', 'Ana', 'Rodríguez', '3157778899', 'ana.rodriguez@email.com', 'Calle 100 #45-67', 'Barranquilla'),
('1003334455', 'Pedro', 'Sánchez', '3183334455', 'pedro.sanchez@email.com', 'Carrera 15 #22-10', 'Bucaramanga');

-- Autos
INSERT INTO auto (placa, marca, modelo, anio, color, kilometraje, tipo_combustible, transmision, numero_puertas) VALUES
('ABC123', 'Toyota', 'Corolla', 2020, 'Blanco', 35000.00, 'gasolina', 'automatica', 4),
('DEF456', 'Chevrolet', 'Spark', 2019, 'Rojo', 52000.50, 'gasolina', 'manual', 4),
('GHI789', 'Mazda', 'CX-5', 2021, 'Gris', 18000.00, 'gasolina', 'automatica', 4),
('JKL012', 'Renault', 'Logan', 2018, 'Negro', 78000.00, 'gasolina', 'manual', 4),
('MNO345', 'Nissan', 'Leaf', 2022, 'Azul', 5000.00, 'electrico', 'automatica', 4);

-- Transacciones de compra (la empresa compra a vendedores)
INSERT INTO transaccion (tipo, auto_id, persona_id, precio, fecha, observaciones) VALUES
('compra', 1, 1, 45000000.00, '2025-01-15', 'Compra directa, excelente estado'),
('compra', 2, 2, 28000000.00, '2025-02-20', 'Compra con revisión mecánica'),
('compra', 3, 3, 72000000.00, '2025-03-10', 'Vehículo casi nuevo'),
('compra', 4, 1, 22000000.00, '2025-04-05', 'Compra a buen precio'),
('compra', 5, 4, 95000000.00, '2025-05-01', 'Auto eléctrico con garantía vigente');

-- Transacciones de venta (la empresa vende a compradores)
INSERT INTO transaccion (tipo, auto_id, persona_id, precio, fecha, observaciones) VALUES
('venta', 1, 5, 52000000.00, '2025-06-10', 'Venta con financiación'),
('venta', 2, 4, 33000000.00, '2025-07-15', 'Venta de contado');

-- ============================================================
-- CONSULTAS ÚTILES
-- ============================================================

-- Ver inventario disponible
-- SELECT * FROM auto WHERE estado = 'disponible';

-- Ver historial completo de un auto
-- SELECT t.*, p.nombre, p.apellido FROM transaccion t
-- JOIN persona p ON t.persona_id = p.id WHERE t.auto_id = 1;

-- Calcular rentabilidad por auto vendido (3FN: no almacenamos, calculamos)
-- SELECT
--   a.placa, a.marca, a.modelo,
--   tc.precio AS precio_compra,
--   tv.precio AS precio_venta,
--   (tv.precio - tc.precio) AS margen_ganancia
-- FROM auto a
-- JOIN transaccion tc ON a.id = tc.auto_id AND tc.tipo = 'compra'
-- JOIN transaccion tv ON a.id = tv.auto_id AND tv.tipo = 'venta';
