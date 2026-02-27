
## 1 Redundancias que veo

En el CSV todo esta junto en una sola tabla, entonces se repiten muchos datos:

- El cliente "Carlos Perez" aparece repetido en cada producto del mismo pedido.
- El vendedor "Laura Gomez" y su sucursal "Centro" tambien se repiten.
- El pedido 1 aparece dos veces porque tiene dos productos.
- El nombre de categoria "Tecnologia" se repite para varios productos.

Eso hace que el archivo crezca rapido y sea mas facil cometer errores.

## 2 Dependencias funcionales

Dependencias principales que se observan:

- `pedido_id -> fecha_pedido, cliente, vendedor`
- `cliente_email -> cliente_nombre, cliente_telefono, cliente_ciudad`
- `producto_nombre -> producto_categoria, producto_precio` (en este ejemplo)
- `vendedor_nombre -> vendedor_sucursal` (en este ejemplo)
- `(pedido_id, producto_nombre) -> cantidad`

## 3 Anomalias posibles

- Anomalia de insercion: no puedo guardar un cliente nuevo si no existe pedido.
- Anomalia de actualizacion: si cambia telefono del cliente debo actualizar muchas filas.
- Anomalia de eliminacion: si borro el ultimo pedido de un producto, pierdo informacion del producto.

## 4 Claves primarias posibles

En la tabla desnormalizada se puede usar clave compuesta:

- `(pedido_id, producto_nombre)`

Pero en modelo normalizado es mejor usar IDs:

- `id_cliente`
- `id_producto`
- `id_vendedor`
- `id_pedido`
- `id_detalle`

## 5 Normalizacion hasta 3FN

## 1FN

Separar para que no haya grupos repetidos dentro de una misma fila.
En este caso el problema era que un pedido trae varios productos.

## 2FN

Quitar dependencias parciales de clave compuesta.
Si usara `(pedido_id, producto)` como clave, los datos del cliente dependen solo de `pedido_id`, por eso se separa:

- `pedidos`
- `detalle_pedido`

## 3FN

Quitar dependencias transitivas.
Por ejemplo:

- categoria depende de producto, no del pedido
- sucursal depende del vendedor, no del pedido

Tablas finales en 3FN:

- `clientes(id_cliente, nombre, email, telefono, ciudad)`
- `sucursales(id_sucursal, nombre)`
- `vendedores(id_vendedor, nombre, id_sucursal)`
- `categorias(id_categoria, nombre)`
- `productos(id_producto, nombre, id_categoria, precio)`
- `pedidos(id_pedido, fecha_pedido, id_cliente, id_vendedor)`
- `detalle_pedido(id_detalle, id_pedido, id_producto, cantidad, precio_unitario)`


