const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const productoSchema = new mongoose.Schema(
  {
    nombre: String,
    cantidad: Number,
    precio: Number,
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema({
  fecha_pedido: String,
  cliente: {
    nombre: String,
    email: String,
    telefono: String,
    ciudad: String,
  },
  productos: [productoSchema],
});

const PedidoMongo =
  mongoose.models.PedidoMongo ||
  mongoose.model("PedidoMongo", pedidoSchema, "pedidos");

// crear pedido
router.post("/", async (req, res) => {
  try {
    const nuevoPedido = new PedidoMongo(req.body);
    const guardado = await nuevoPedido.save();
    res.json({ mensaje: "Pedido Mongo creado", pedido: guardado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear pedido Mongo" });
  }
});

// listar pedidos
router.get("/", async (req, res) => {
  try {
    const pedidos = await PedidoMongo.find();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar pedidos Mongo" });
  }
});

// actualizar un producto dentro del pedido por indice
router.put("/:id/producto/:indice", async (req, res) => {
  try {
    const id = req.params.id;
    const indice = Number(req.params.indice);

    const pedido = await PedidoMongo.findById(id);
    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    if (!pedido.productos[indice]) {
      return res.status(404).json({ mensaje: "Producto no encontrado en indice" });
    }

    pedido.productos[indice] = req.body;
    await pedido.save();

    res.json({ mensaje: "Producto del pedido actualizado", pedido });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto en Mongo" });
  }
});

// eliminar pedido
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await PedidoMongo.findByIdAndDelete(id);
    res.json({ mensaje: "Pedido Mongo eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar pedido Mongo" });
  }
});

module.exports = router;
