const pool = require('../config/database');

class AutoModel {

    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM auto ORDER BY created_at DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM auto WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async getByPlaca(placa) {
        const [rows] = await pool.query('SELECT * FROM auto WHERE placa = ?', [placa]);
        return rows[0] || null;
    }

    static async create(data) {
        const { placa, marca, modelo, anio, color, kilometraje, tipo_combustible, transmision, numero_puertas } = data;
        const [result] = await pool.query(
            `INSERT INTO auto (placa, marca, modelo, anio, color, kilometraje, tipo_combustible, transmision, numero_puertas)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [placa, marca, modelo, anio, color, kilometraje || 0, tipo_combustible || 'gasolina', transmision || 'manual', numero_puertas || 4]
        );
        return { id: result.insertId, ...data };
    }

    static async update(id, data) {
        const { placa, marca, modelo, anio, color, kilometraje, tipo_combustible, transmision, numero_puertas } = data;
        const [result] = await pool.query(
            `UPDATE auto SET placa = ?, marca = ?, modelo = ?, anio = ?, color = ?, kilometraje = ?,
             tipo_combustible = ?, transmision = ?, numero_puertas = ? WHERE id = ?`,
            [placa, marca, modelo, anio, color, kilometraje, tipo_combustible, transmision, numero_puertas, id]
        );
        return result.affectedRows > 0;
    }

    // Falla si el auto tiene transacciones asociadas (integridad referencial)
    static async delete(id) {
        const [trans] = await pool.query('SELECT COUNT(*) as count FROM transaccion WHERE auto_id = ?', [id]);
        if (trans[0].count > 0) {
            throw new Error('No se puede eliminar: el auto tiene transacciones asociadas');
        }
        const [result] = await pool.query('DELETE FROM auto WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Inserta un array de autos, contando duplicados y errores por separado
    static async bulkCreate(autos) {
        const results = { inserted: 0, duplicates: 0, errors: [] };

        for (const auto of autos) {
            try {
                await pool.query(
                    `INSERT INTO auto (placa, marca, modelo, anio, color, kilometraje, tipo_combustible, transmision, numero_puertas)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        auto.placa, auto.marca, auto.modelo, auto.anio,
                        auto.color || null, auto.kilometraje || 0,
                        auto.tipo_combustible || 'gasolina',
                        auto.transmision || 'manual',
                        auto.numero_puertas || 4
                    ]
                );
                results.inserted++;
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    results.duplicates++;
                } else {
                    results.errors.push({ placa: auto.placa, error: err.message });
                }
            }
        }
        return results;
    }
}

module.exports = AutoModel;
