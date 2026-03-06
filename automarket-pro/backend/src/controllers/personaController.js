const PersonaModel = require('../models/personaModel');

const personaController = {

    getAll: async (req, res) => {
        try {
            const personas = await PersonaModel.getAll();
            res.json({ success: true, data: personas, count: personas.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const persona = await PersonaModel.getById(req.params.id);
            if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });
            res.json({ success: true, data: persona });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getByDocumento: async (req, res) => {
        try {
            const persona = await PersonaModel.getByDocumento(req.params.documento);
            if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada con ese documento' });
            res.json({ success: true, data: persona });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { documento, nombre, apellido } = req.body;
            if (!documento || !nombre || !apellido) {
                return res.status(400).json({ success: false, message: 'Campos obligatorios: documento, nombre, apellido' });
            }
            const persona = await PersonaModel.create(req.body);
            res.status(201).json({ success: true, message: 'Persona creada exitosamente', data: persona });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Ya existe una persona con ese documento' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const exists = await PersonaModel.getById(req.params.id);
            if (!exists) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

            const updated = await PersonaModel.update(req.params.id, req.body);
            if (updated) {
                const persona = await PersonaModel.getById(req.params.id);
                res.json({ success: true, message: 'Persona actualizada exitosamente', data: persona });
            } else {
                res.status(400).json({ success: false, message: 'No se pudo actualizar' });
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Ya existe una persona con ese documento' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const exists = await PersonaModel.getById(req.params.id);
            if (!exists) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

            await PersonaModel.delete(req.params.id);
            res.json({ success: true, message: 'Persona eliminada exitosamente' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

module.exports = personaController;
