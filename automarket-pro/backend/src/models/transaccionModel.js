const pool = require('../config/database');

class TransaccionModel {

    static async getAll() {
        const [rows] = await pool.query(`
            SELECT t.*, 
                   a.placa, a.marca, a.modelo AS modelo_auto,
                   p.nombre AS persona_nombre, p.apellido AS persona_apellido, p.documento
            FROM transaccion t
            JOIN auto a ON t.auto_id = a.id
            JOIN persona p ON t.persona_id = p.id
            ORDER BY t.fecha DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT t.*, 
                   a.placa, a.marca, a.modelo AS modelo_auto,
                   p.nombre AS persona_nombre, p.apellido AS persona_apellido, p.documento
            FROM transaccion t
            JOIN auto a ON t.auto_id = a.id
            JOIN persona p ON t.persona_id = p.id
            WHERE t.id = ?
        `, [id]);
        return rows[0] || null;
    }

    static async getByAutoId(autoId) {
        const [rows] = await pool.query(`
            SELECT t.*, 
                   p.nombre AS persona_nombre, p.apellido AS persona_apellido
            FROM transaccion t
            JOIN persona p ON t.persona_id = p.id
            WHERE t.auto_id = ?
            ORDER BY t.fecha ASC
        `, [autoId]);
        return rows;
    }

    static async create(data) {
        const { tipo, auto_id, persona_id, precio, fecha, observaciones } = data;
        const [result] = await pool.query(
            `INSERT INTO transaccion (tipo, auto_id, persona_id, precio, fecha, observaciones)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tipo, auto_id, persona_id, precio, fecha, observaciones]
        );
        return { id: result.insertId, ...data };
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM transaccion WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Calcula margen de ganancia comparando precio de compra vs venta por auto
    static async getRentabilidad() {
        const [rows] = await pool.query(`
            SELECT 
                a.id, a.placa, a.marca, a.modelo,
                tc.precio AS precio_compra,
                tv.precio AS precio_venta,
                (tv.precio - tc.precio) AS margen_ganancia,
                ROUND(((tv.precio - tc.precio) / tc.precio) * 100, 2) AS porcentaje_ganancia
            FROM auto a
            JOIN transaccion tc ON a.id = tc.auto_id AND tc.tipo = 'compra'
            JOIN transaccion tv ON a.id = tv.auto_id AND tv.tipo = 'venta'
            ORDER BY margen_ganancia DESC
        `);
        return rows;
    }
}

module.exports = TransaccionModel;
