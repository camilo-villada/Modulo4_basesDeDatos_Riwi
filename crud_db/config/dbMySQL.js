const mysql = require("mysql2");
require("dotenv").config();

// aqui creo la conexion a MySQL
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

function conectarMySQL() {
  db.connect((error) => {
    if (error) {
      console.log("Error conectando a MySQL:", error.message);
    } else {
      console.log("Conectado a MySQL");
    }
  });
}

module.exports = { db, conectarMySQL };
