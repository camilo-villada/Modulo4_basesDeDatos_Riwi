const TransaccionModel = require('../models/transaccionModel');

const transaccionController = {

    getAll: async (req, res) => {
        try {
            const transacciones = await TransaccionModel.getAll();
            res.json({ success: true, data: transacciones, count: transacciones.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const transaccion = await TransaccionModel.getById(req.params.id);
            if (!transaccion) return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
            res.json({ success: true, data: transaccion });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getByAutoId: async (req, res) => {
        try {
            const transacciones = await TransaccionModel.getByAutoId(req.params.autoId);
            res.json({ success: true, data: transacciones, count: transacciones.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { tipo, auto_id, persona_id, precio, fecha } = req.body;
            if (!tipo || !auto_id || !persona_id || !precio || !fecha) {
                return res.status(400).json({ success: false, message: 'Campos obligatorios: tipo, auto_id, persona_id, precio, fecha' });
            }
            const transaccion = await TransaccionModel.create(req.body);
            res.status(201).json({ success: true, message: 'Transacción creada exitosamente', data: transaccion });
        } catch (error) {
            // Capturar errores de triggers MySQL
            if (error.sqlState === '45000') {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const exists = await TransaccionModel.getById(req.params.id);
            if (!exists) return res.status(404).json({ success: false, message: 'Transacción no encontrada' });

            const deleted = await TransaccionModel.delete(req.params.id);
            res.json({ success: true, message: 'Transacción eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getRentabilidad: async (req, res) => {
        try {
            const rentabilidad = await TransaccionModel.getRentabilidad();
            res.json({ success: true, data: rentabilidad, count: rentabilidad.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = transaccionController;
