const express = require("express");
const router = express.Router();
const { db } = require("../config/dbMySQL");

// listar clientes
router.get("/", (req, res) => {
  const sql = "SELECT id, nombre, email, telefono, ciudad FROM clientes ORDER BY id";

  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al listar clientes" });
    }
    res.json(resultados);
  });
});

// crear cliente
router.post("/", (req, res) => {
  const { nombre, email, telefono, ciudad } = req.body;
  const sql =
    "INSERT INTO clientes (nombre, email, telefono, ciudad) VALUES (?, ?, ?, ?)";

  db.query(sql, [nombre, email, telefono, ciudad], (error, resultado) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al crear cliente" });
    }
    res.json({
      mensaje: "Cliente creado",
      id: resultado.insertId,
    });
  });
});

// actualizar cliente
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, email, telefono, ciudad } = req.body;
  const sql =
    "UPDATE clientes SET nombre = ?, email = ?, telefono = ?, ciudad = ? WHERE id = ?";

  db.query(sql, [nombre, email, telefono, ciudad, id], (error) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al actualizar cliente" });
    }
    res.json({ mensaje: "Cliente actualizado" });
  });
});

// eliminar cliente
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM clientes WHERE id = ?";

  db.query(sql, [id], (error) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al eliminar cliente" });
    }
    res.json({ mensaje: "Cliente eliminado" });
  });
});

module.exports = router;
