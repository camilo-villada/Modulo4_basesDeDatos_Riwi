require("dotenv").config({ quiet: true });
const express = require("express");

require("./config/mysql");
require("./config/mongo");

const migrationRoutes = require("./routes/migration.routes");
const doctorRoutes = require("./routes/doctor.routes");
const reportRoutes = require("./routes/report.routes");
const patientRoutes = require("./routes/patient.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de SaludPlus funcionando correctamente");
});

app.use("/api/migration", migrationRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/patients", patientRoutes);

app.use((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "El archivo supera el tamaño máximo permitido (10MB)" });
  }

  if (error.message === "Solo se permiten archivos Excel o CSV") {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Error interno del servidor" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
