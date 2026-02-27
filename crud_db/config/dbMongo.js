const mongoose = require("mongoose");
require("dotenv").config();

function conectarMongo() {
  // aqui conecto MongoDB usando variable de entorno
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Conectado a MongoDB");
    })
    .catch((error) => {
      console.log("Error conectando a MongoDB:", error.message);
    });
}

module.exports = conectarMongo;
