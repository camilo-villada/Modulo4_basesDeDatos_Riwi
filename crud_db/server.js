const express = require("express");
const path = require("path");

const { conectarMySQL } = require("./config/dbMySQL");
const conectarMongo = require("./config/dbMongo");

const clientesRoutes = require("./routes/clientes");
const productosRoutes = require("./routes/productos");
const pedidosRoutes = require("./routes/pedidos");
const pedidosMongoRoutes = require("./routes/pedidosMongo");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// aqui sirvo la carpeta del frontend
app.use(express.static(path.join(__dirname, "public")));

// aqui conecto las bases de datos
conectarMySQL();
conectarMongo();

// rutas MySQL
app.use("/api/clientes", clientesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/pedidos", pedidosRoutes);

// rutas MongoDB
app.use("/api/pedidos-mongo", pedidosMongoRoutes);

app.get("/api", (req, res) => {
  res.send("API funcionando");
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});
