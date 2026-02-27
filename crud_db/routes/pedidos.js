const express = require("express");
const router = express.Router();
const { db } = require("../config/dbMySQL");

// crear pedido con detalle
router.post("/", (req, res) => {
  const { fecha_pedido, id_cliente, id_vendedor, productos } = req.body;

  const sqlPedido = "INSERT INTO pedidos (fecha, cliente_id, vendedor_id) VALUES (?, ?, ?)";

  db.query(sqlPedido, [fecha_pedido, id_cliente, id_vendedor], (error, resultado) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al crear pedido" });
    }

    const id_pedido = resultado.insertId;

    // si no mandan productos, igual se crea el pedido
    if (!productos || productos.length === 0) {
      return res.json({ mensaje: "Pedido creado sin detalle", id_pedido });
    }

    let terminados = 0;
    let huboError = false;

    for (let i = 0; i < productos.length; i++) {
      const item = productos[i];
      const sqlDetalle = "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)";

      db.query(
        sqlDetalle,
        [id_pedido, item.id_producto, item.cantidad],
        (errorDetalle) => {
          if (errorDetalle && !huboError) {
            huboError = true;
            return res
              .status(500)
              .json({ mensaje: "Error al guardar detalle del pedido" });
          }

          terminados++;
          if (terminados === productos.length && !huboError) {
            res.json({ mensaje: "Pedido creado con detalle", id_pedido });
          }
        }
      );
    }
  });
});

// listar pedidos con join
router.get("/", (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.fecha,
      c.nombre AS cliente,
      v.nombre AS vendedor,
      v.sucursal AS sucursal,
      pr.nombre AS producto,
      dp.cantidad,
      pr.precio,
      (dp.cantidad * pr.precio) AS subtotal
    FROM pedidos p
    INNER JOIN clientes c ON p.cliente_id = c.id
    INNER JOIN vendedores v ON p.vendedor_id = v.id
    INNER JOIN detalle_pedido dp ON p.id = dp.pedido_id
    INNER JOIN productos pr ON dp.producto_id = pr.id
    ORDER BY p.id
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al listar pedidos" });
    }
    res.json(resultados);
  });
});

// eliminar pedido
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM pedidos WHERE id = ?";

  db.query(sql, [id], (error) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al eliminar pedido" });
    }
    res.json({ mensaje: "Pedido eliminado" });
  });
});

module.exports = router;
