const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/autos', require('./src/routes/autoRoutes'));
app.use('/api/personas', require('./src/routes/personaRoutes'));
app.use('/api/transacciones', require('./src/routes/transaccionRoutes'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Manejo de errores de Multer
app.use((err, req, res, next) => {
    if (err.message === 'Solo se permiten archivos .csv') {
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'El archivo excede el tamaño máximo de 5MB' });
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[OK] AutoMarket Pro corriendo en http://localhost:${PORT}`);
    console.log(`[API] Disponible en http://localhost:${PORT}/api`);
});
