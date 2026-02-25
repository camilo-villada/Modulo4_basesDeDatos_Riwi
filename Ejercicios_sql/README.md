# Ejercicios de Consultas SQL: Jardinería


---

## 1. Consultas sobre una tabla (Básicas)

### Oficinas: Devuelve un listado con el código de oficina y la ciudad.

```sql
SELECT codigo_oficina, ciudad FROM oficina;
```

### Oficinas en España: Devuelve la ciudad y el teléfono de las oficinas de España.

```sql
SELECT ciudad, telefono FROM oficina WHERE pais = 'España';
```

### Empleados y Jefes: Nombre, apellidos y email de los empleados cuyo jefe tiene código 7.

```sql
SELECT nombre, apellido1, apellido2, email FROM empleado WHERE codigo_jefe = 7;
```

### El Gran Jefe: Nombre del puesto, nombre, apellidos y email del jefe de la empresa (sin jefe).

```sql
SELECT puesto, nombre, apellido1, apellido2, email FROM empleado WHERE codigo_jefe IS NULL;
```

### No Comerciales: Nombre, apellidos y puesto de empleados que no sean 'Representante Ventas'.

```sql
SELECT nombre, apellido1, apellido2, puesto FROM empleado WHERE puesto != 'Representante Ventas';
```

### Clientes Nacionales: Nombre de todos los clientes españoles.

```sql
SELECT nombre_cliente FROM cliente WHERE pais = 'Spain';
```

### Estados de Pedido: Listado de los distintos estados de un pedido (sin repetir).

```sql
SELECT DISTINCT estado FROM pedido;
```

### Pagos 2008: Código de cliente de aquellos que realizaron pagos en 2008 (sin repetidos).

```sql
SELECT DISTINCT codigo_cliente FROM pago WHERE YEAR(fecha_pago) = 2008;
```

### Pedidos Rechazados: Listado de pedidos rechazados en 2009.

```sql
SELECT * FROM pedido WHERE estado = 'Rechazado' AND YEAR(fecha_pedido) = 2009;
```

### Entregas de Enero: Pedidos entregados en el mes de enero de cualquier año.

```sql
SELECT * FROM pedido WHERE MONTH(fecha_entrega) = 1 AND estado = 'Entregado';
```

### Paypal 2008: Pagos realizados en 2008 vía Paypal. Ordenar de mayor a menor.

```sql
SELECT * FROM pago WHERE YEAR(fecha_pago) = 2008 AND forma_pago = 'PayPal' ORDER BY cantidad DESC;
```

### Formas de Pago: Todas las formas de pago en la tabla pago (sin repetidos).

```sql
SELECT DISTINCT forma_pago FROM pago;
```

### Stock Ornamental: Productos 'Ornamentales' con stock > 100. Ordenar por precio (desc).

```sql
SELECT * FROM producto WHERE gama = 'Ornamentales' AND cantidad_en_stock > 100 ORDER BY precio_venta DESC;
```

### Clientes Madrid: Clientes de Madrid cuyo representante tenga código 11 o 30.

```sql
SELECT * FROM cliente WHERE ciudad = 'Madrid' AND (codigo_empleado_rep_ventas = 11 OR codigo_empleado_rep_ventas = 30);
```

---

## 2. Consultas Multitabla (JOINs)

### Clientes y Representantes: Nombre de cliente y nombre/apellido de su representante.

```sql
SELECT c.nombre_cliente, e.nombre, e.apellido1, e.apellido2 
FROM cliente c 
INNER JOIN empleado e ON c.codigo_empleado_rep_ventas = e.codigo_empleado;
```

### Pagos realizados: Nombre de clientes con pagos y sus representantes.

```sql
SELECT DISTINCT c.nombre_cliente, e.nombre, e.apellido1 
FROM cliente c 
INNER JOIN pago p ON c.codigo_cliente = p.codigo_cliente 
INNER JOIN empleado e ON c.codigo_empleado_rep_ventas = e.codigo_empleado;
```

### Sin Pagos: Nombre de clientes sin pagos realizados y sus representantes.

```sql
SELECT c.nombre_cliente, e.nombre, e.apellido1 
FROM cliente c 
LEFT JOIN pago p ON c.codigo_cliente = p.codigo_cliente 
INNER JOIN empleado e ON c.codigo_empleado_rep_ventas = e.codigo_empleado 
WHERE p.codigo_pago IS NULL;
```

### Localización: Clientes con pagos, sus representantes y la ciudad de su oficina.

```sql
SELECT c.nombre_cliente, e.nombre, e.apellido1, o.ciudad 
FROM cliente c 
INNER JOIN pago p ON c.codigo_cliente = p.codigo_cliente 
INNER JOIN empleado e ON c.codigo_empleado_rep_ventas = e.codigo_empleado 
INNER JOIN oficina o ON e.codigo_oficina = o.codigo_oficina;
```

### Oficinas en Fuenlabrada: Dirección de oficinas con clientes en Fuenlabrada.

```sql
SELECT DISTINCT o.codigo_oficina, o.linea_direccion1, o.ciudad 
FROM oficina o 
INNER JOIN empleado e ON o.codigo_oficina = e.codigo_oficina 
INNER JOIN cliente c ON e.codigo_empleado = c.codigo_empleado_rep_ventas 
WHERE c.ciudad = 'Fuenlabrada';
```

### Jerarquía - Empleados junto al nombre de sus jefes:

```sql
SELECT e.codigo_empleado, e.nombre, e.apellido1, 
       j.codigo_empleado AS codigo_jefe, j.nombre AS nombre_jefe, j.apellido1 AS apellido1_jefe 
FROM empleado e 
LEFT JOIN empleado j ON e.codigo_jefe = j.codigo_empleado;
```

### Jerarquía - Empleado, nombre de su jefe y nombre del jefe de su jefe:

```sql
SELECT e.codigo_empleado, e.nombre, 
       j.nombre AS nombre_jefe, 
       jj.nombre AS nombre_jefe_del_jefe 
FROM empleado e 
LEFT JOIN empleado j ON e.codigo_jefe = j.codigo_empleado 
LEFT JOIN empleado jj ON j.codigo_jefe = jj.codigo_empleado;
```

### Retrasos: Clientes con pedidos no entregados a tiempo (fecha_entrega > fecha_esperada).

```sql
SELECT c.nombre_cliente, p.codigo_pedido, p.fecha_esperada, p.fecha_entrega 
FROM cliente c 
INNER JOIN pedido p ON c.codigo_cliente = p.codigo_cliente 
WHERE p.fecha_entrega > p.fecha_esperada;
```

### Gamas por Cliente: Diferentes gamas de producto compradas por cada cliente.

```sql
SELECT DISTINCT c.nombre_cliente, pr.gama 
FROM cliente c 
INNER JOIN pedido p ON c.codigo_cliente = p.codigo_cliente 
INNER JOIN detalle_pedido dp ON p.codigo_pedido = dp.codigo_pedido 
INNER JOIN producto pr ON dp.codigo_producto = pr.codigo_producto 
ORDER BY c.nombre_cliente, pr.gama;
```

---

## 3. Consultas de Conjuntos (Subconsultas y Outer Joins)

### Clientes sin actividad

#### Que no han realizado ningún pago:

```sql
SELECT c.* FROM cliente c 
WHERE c.codigo_cliente NOT IN (SELECT DISTINCT codigo_cliente FROM pago);
```

#### Que no han realizado ningún pedido:

```sql
SELECT c.* FROM cliente c 
WHERE c.codigo_cliente NOT IN (SELECT DISTINCT codigo_cliente FROM pedido);
```

#### Que no han realizado ni pagos ni pedidos:

```sql
SELECT c.* FROM cliente c 
WHERE c.codigo_cliente NOT IN (SELECT DISTINCT codigo_cliente FROM pago) 
AND c.codigo_cliente NOT IN (SELECT DISTINCT codigo_cliente FROM pedido);
```

### Empleados sin actividad

#### Que no tienen una oficina asociada:

```sql
SELECT * FROM empleado WHERE codigo_oficina IS NULL;
```

#### Que no tienen un cliente asociado:

```sql
SELECT e.* FROM empleado e 
WHERE e.codigo_empleado NOT IN (SELECT DISTINCT codigo_empleado_rep_ventas FROM cliente);
```

#### Sin cliente asociado + datos de su oficina:

```sql
SELECT e.*, o.* FROM empleado e 
LEFT JOIN oficina o ON e.codigo_oficina = o.codigo_oficina 
WHERE e.codigo_empleado NOT IN (SELECT DISTINCT codigo_empleado_rep_ventas FROM cliente WHERE codigo_empleado_rep_ventas IS NOT NULL);
```

### Productos olvidados

#### Productos que nunca han aparecido en un pedido:

```sql
SELECT pr.* FROM producto pr 
WHERE pr.codigo_producto NOT IN (SELECT DISTINCT codigo_producto FROM detalle_pedido);
```

### Casos Avanzados

#### Oficinas sin representantes de ventas cuyos clientes compraron 'Frutales':


```sql
SELECT DISTINCT o.* FROM oficina o 
WHERE o.codigo_oficina NOT IN (
    SELECT DISTINCT e.codigo_oficina FROM empleado e 
    WHERE e.puesto = 'Representante Ventas'
)
AND o.codigo_oficina IN (
    SELECT DISTINCT e.codigo_oficina FROM empleado e 
    INNER JOIN cliente c ON e.codigo_empleado = c.codigo_empleado_rep_ventas 
    INNER JOIN pedido p ON c.codigo_cliente = p.codigo_cliente 
    INNER JOIN detalle_pedido dp ON p.codigo_pedido = dp.codigo_pedido 
    INNER JOIN producto pr ON dp.codigo_producto = pr.codigo_producto 
    WHERE pr.gama = 'Frutales'
);
```

#### Clientes con pedidos pero sin pagos realizados:

```sql
SELECT c.* FROM cliente c 
WHERE c.codigo_cliente IN (SELECT DISTINCT codigo_cliente FROM pedido) 
AND c.codigo_cliente NOT IN (SELECT DISTINCT codigo_cliente FROM pago);
```

#### Empleados sin clientes y el nombre de su jefe:

```sql
SELECT e.codigo_empleado, e.nombre, e.apellido1, 
       j.nombre AS nombre_jefe, j.apellido1 AS apellido1_jefe 
FROM empleado e 
LEFT JOIN empleado j ON e.codigo_jefe = j.codigo_empleado 
WHERE e.codigo_empleado NOT IN (SELECT DISTINCT codigo_empleado_rep_ventas FROM cliente WHERE codigo_empleado_rep_ventas IS NOT NULL);
```

---

## 4. Agregación y Estadísticas

### Personal: ¿Cuántos empleados hay en la compañía?

```sql
SELECT COUNT(*) AS total_empleados FROM empleado;
```

### Países: ¿Cuántos clientes tiene cada país?

```sql
SELECT pais, COUNT(*) AS cantidad_clientes FROM cliente GROUP BY pais ORDER BY cantidad_clientes DESC;
```

### Finanzas: ¿Cuál fue el pago medio en 2009?

```sql
SELECT AVG(cantidad) AS pago_medio_2009 FROM pago WHERE YEAR(fecha_pago) = 2009;
```



