const pool = require('../config/database');

class PersonaModel {

    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM persona ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM persona WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async getByDocumento(documento) {
        const [rows] = await pool.query('SELECT * FROM persona WHERE documento = ?', [documento]);
        return rows[0] || null;
    }

    static async create(data) {
        const { documento, nombre, apellido, telefono, email, direccion, ciudad } = data;
        const [result] = await pool.query(
            `INSERT INTO persona (documento, nombre, apellido, telefono, email, direccion, ciudad)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [documento, nombre, apellido, telefono, email, direccion, ciudad]
        );
        return { id: result.insertId, ...data };
    }

    static async update(id, data) {
        const { documento, nombre, apellido, telefono, email, direccion, ciudad } = data;
        const [result] = await pool.query(
            `UPDATE persona SET documento = ?, nombre = ?, apellido = ?, telefono = ?,
             email = ?, direccion = ?, ciudad = ? WHERE id = ?`,
            [documento, nombre, apellido, telefono, email, direccion, ciudad, id]
        );
        return result.affectedRows > 0;
    }

    // Falla si la persona tiene transacciones asociadas
    static async delete(id) {
        const [trans] = await pool.query('SELECT COUNT(*) as count FROM transaccion WHERE persona_id = ?', [id]);
        if (trans[0].count > 0) {
            throw new Error('No se puede eliminar: la persona tiene transacciones asociadas');
        }
        const [result] = await pool.query('DELETE FROM persona WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PersonaModel;
