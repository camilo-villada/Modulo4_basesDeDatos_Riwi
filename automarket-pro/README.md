# AutoMarket Pro

Sistema web para la administración de una concesionaria: gestión de inventario, personas (vendedores/compradores) y transacciones de compra-venta.

## Estructura del proyecto

```
automarket-pro/
├── backend/
│   ├── server.js
│   ├── .env
│   └── src/
│       ├── config/          # Conexión DB y Multer
│       ├── controllers/     # Lógica de cada entidad
│       ├── models/          # Consultas SQL
│       └── routes/          # Definición de endpoints
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── database/
│   └── 01_create_database.sql
└── data/
    └── autos_ejemplo.csv
```

## Requisitos

- Node.js >= 16
- MySQL >= 8

## Instalación y puesta en marcha

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Crear la base de datos (solo la primera vez)

```bash
mysql -u root --password='' < database/01_create_database.sql
```

### 3. Configurar variables de entorno

Editar `backend/.env` si las credenciales de MySQL son diferentes:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=automarket_pro
DB_PORT=3306
SERVER_PORT=3000
```

### 4. Iniciar el servidor

```bash
npm start
```

La aplicación queda disponible en `http://localhost:3000`

## API REST

Base URL: `http://localhost:3000/api`

### Autos

| Método | Endpoint               | Descripción              |
|--------|------------------------|--------------------------|
| GET    | /autos                 | Listar todos             |
| GET    | /autos/:id             | Buscar por ID            |
| GET    | /autos/placa/:placa    | Buscar por placa         |
| POST   | /autos                 | Crear auto               |
| PUT    | /autos/:id             | Actualizar auto          |
| DELETE | /autos/:id             | Eliminar auto            |
| POST   | /autos/import-csv      | Importación masiva CSV   |

### Personas

| Método | Endpoint                        | Descripción              |
|--------|---------------------------------|--------------------------|
| GET    | /personas                       | Listar todas             |
| GET    | /personas/:id                   | Buscar por ID            |
| GET    | /personas/documento/:documento  | Buscar por documento     |
| POST   | /personas                       | Crear persona            |
| PUT    | /personas/:id                   | Actualizar persona       |
| DELETE | /personas/:id                   | Eliminar persona         |

### Transacciones

| Método | Endpoint                      | Descripción                   |
|--------|-------------------------------|-------------------------------|
| GET    | /transacciones                | Listar todas                  |
| GET    | /transacciones/:id            | Buscar por ID                 |
| GET    | /transacciones/auto/:autoId   | Historial de un auto          |
| GET    | /transacciones/rentabilidad   | Margen de ganancia por auto   |
| POST   | /transacciones                | Registrar transacción         |
| DELETE | /transacciones/:id            | Eliminar transacción          |

## Importación CSV

El endpoint `POST /api/autos/import-csv` acepta un archivo `.csv` con el campo `archivo`. Columnas requeridas: `placa`, `marca`, `modelo`, `anio`. Opcionales: `color`, `kilometraje`, `tipo_combustible`, `transmision`, `numero_puertas`.

Hay un archivo de ejemplo en `data/autos_ejemplo.csv`.

## Reglas de negocio aplicadas en DB

- Un auto no puede venderse sin tener primero un registro de compra.
- Cada auto solo puede venderse una vez.
- No se pueden eliminar autos ni personas que tengan transacciones asociadas.
- Las placas y documentos de identidad son únicos.
- El margen de ganancia no se almacena; se calcula por consulta (3FN).
