const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'automarket_pro',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión al iniciar
pool.getConnection()
    .then(conn => {
        console.log('[OK] Conexion a MySQL establecida correctamente');
        conn.release();
    })
    .catch(err => {
        console.error('[ERROR] Conectando a MySQL:', err.message);
    });

module.exports = pool;
