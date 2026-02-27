# Proyecto CRUD Tienda Electronica 

backend y bases de datos.

## Tecnologias

- Node.js
- Express
- mysql2
- MongoDB + Mongoose
- HTML + CSS basico
- JavaScript vanilla (fetch)

## Estructura

```
crud_db/
  config/
    dbMySQL.js
    dbMongo.js
  public/
    index.html
    style.css
    app.js
  routes/
    clientes.js
    productos.js
    pedidos.js
    pedidosMongo.js
  sql/
    tienda_electronica.sql
  analisis_3fn.md
  ventas_desnormalizadas.csv
  server.js
  package.json
```

## Parte 1

- Analisis y normalizacion en `analisis_3fn.md`
- Script MySQL en `sql/tienda_electronica.sql`

## Parte 2 y 3

Backend y frontend simple:

- CRUD clientes (MySQL)
- CRUD productos (MySQL)
- Pedidos MySQL (crear con detalle, listar con JOIN, eliminar)

## Parte 4

MongoDB:

- Crear pedido
- Listar pedidos
- Actualizar producto embebido dentro del pedido
- Eliminar pedido

## Como ejecutar paso a paso

1. Tener instalado:
   - Node.js
   - MySQL Server
   - MongoDB Server

2. Crear base en MySQL:
   - Abrir MySQL Workbench o consola.
   - Ejecutar el archivo `sql/tienda_electronica.sql`.

3. Revisar credenciales de MySQL:
   - Abrir `config/dbMySQL.js`.
   - Cambiar `user` y `password` si hace falta.

4. Instalar dependencias:

```bash
npm install
```

5. Ejecutar proyecto:

```bash
npm start
```

6. Abrir en navegador:
   - `http://localhost:3000`

