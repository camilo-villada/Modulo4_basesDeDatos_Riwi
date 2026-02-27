const express = require("express");
const router = express.Router();
const { db } = require("../config/dbMySQL");

// listar productos con su categoria
router.get("/", (req, res) => {
  const sql = "SELECT id, nombre, categoria, precio FROM productos ORDER BY id";

  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al listar productos" });
    }
    res.json(resultados);
  });
});

// crear producto
router.post("/", (req, res) => {
  const { nombre, precio } = req.body;
  const categoria = req.body.categoria || req.body.id_categoria || "";
  const sql = "INSERT INTO productos (nombre, categoria, precio) VALUES (?, ?, ?)";

  db.query(sql, [nombre, categoria, precio], (error, resultado) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al crear producto" });
    }
    res.json({
      mensaje: "Producto creado",
      id: resultado.insertId,
    });
  });
});

// actualizar producto
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, precio } = req.body;
  const categoria = req.body.categoria || req.body.id_categoria || "";
  const sql = "UPDATE productos SET nombre = ?, categoria = ?, precio = ? WHERE id = ?";

  db.query(sql, [nombre, categoria, precio, id], (error) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al actualizar producto" });
    }
    res.json({ mensaje: "Producto actualizado" });
  });
});

// eliminar producto
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM productos WHERE id = ?";

  db.query(sql, [id], (error) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al eliminar producto" });
    }
    res.json({ mensaje: "Producto eliminado" });
  });
});

module.exports = router;
