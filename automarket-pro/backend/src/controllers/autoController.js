const AutoModel = require('../models/autoModel');
const fs = require('fs');
const csv = require('csv-parser');

const autoController = {

    getAll: async (req, res) => {
        try {
            const autos = await AutoModel.getAll();
            res.json({ success: true, data: autos, count: autos.length });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const auto = await AutoModel.getById(req.params.id);
            if (!auto) return res.status(404).json({ success: false, message: 'Auto no encontrado' });
            res.json({ success: true, data: auto });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getByPlaca: async (req, res) => {
        try {
            const auto = await AutoModel.getByPlaca(req.params.placa);
            if (!auto) return res.status(404).json({ success: false, message: 'Auto no encontrado con esa placa' });
            res.json({ success: true, data: auto });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { placa, marca, modelo, anio } = req.body;
            if (!placa || !marca || !modelo || !anio) {
                return res.status(400).json({ success: false, message: 'Campos obligatorios: placa, marca, modelo, anio' });
            }
            const auto = await AutoModel.create(req.body);
            res.status(201).json({ success: true, message: 'Auto creado exitosamente', data: auto });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Ya existe un auto con esa placa' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const exists = await AutoModel.getById(req.params.id);
            if (!exists) return res.status(404).json({ success: false, message: 'Auto no encontrado' });

            const updated = await AutoModel.update(req.params.id, req.body);
            if (updated) {
                const auto = await AutoModel.getById(req.params.id);
                res.json({ success: true, message: 'Auto actualizado exitosamente', data: auto });
            } else {
                res.status(400).json({ success: false, message: 'No se pudo actualizar' });
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Ya existe un auto con esa placa' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const exists = await AutoModel.getById(req.params.id);
            if (!exists) return res.status(404).json({ success: false, message: 'Auto no encontrado' });

            await AutoModel.delete(req.params.id);
            res.json({ success: true, message: 'Auto eliminado exitosamente' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    importCsv: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Debe enviar un archivo CSV' });
            }

            const autos = [];
            const filePath = req.file.path;

            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv({
                        separator: ',',
                        mapHeaders: ({ header }) => header.trim().toLowerCase()
                    }))
                    .on('data', (row) => {
                        if (row.placa && row.marca && row.modelo && row.anio) {
                            autos.push({
                                placa: row.placa.trim().toUpperCase(),
                                marca: row.marca.trim(),
                                modelo: row.modelo.trim(),
                                anio: parseInt(row.anio),
                                color: row.color ? row.color.trim() : null,
                                kilometraje: row.kilometraje ? parseFloat(row.kilometraje) : 0,
                                tipo_combustible: row.tipo_combustible ? row.tipo_combustible.trim() : 'gasolina',
                                transmision: row.transmision ? row.transmision.trim() : 'manual',
                                numero_puertas: row.numero_puertas ? parseInt(row.numero_puertas) : 4
                            });
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            if (autos.length === 0) {
                fs.unlinkSync(filePath);
                return res.status(400).json({ success: false, message: 'El archivo CSV no contiene datos válidos. Columnas requeridas: placa, marca, modelo, anio' });
            }

            const results = await AutoModel.bulkCreate(autos);
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                message: 'Importación CSV completada',
                data: {
                    total_procesados: autos.length,
                    insertados: results.inserted,
                    duplicados: results.duplicates,
                    errores: results.errors
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = autoController;
