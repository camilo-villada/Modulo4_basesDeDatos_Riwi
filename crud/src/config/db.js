//conexión a la base de datos

const mysql = require('mysql2');

const conection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: 'Qwe.123*',
    database: 'sistema_ventas'
});

conection.connect((err) => {
    if (err) {
        console.error('Error de conexión: ', err);
        return;
    }
    console.log('Conectado a la base de datos: ');
});

module.exports = conection;