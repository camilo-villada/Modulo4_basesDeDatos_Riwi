# Simulacro Arquitectura Backend Híbrida - SaludPlus

API REST con arquitectura híbrida:
- MySQL para datos relacionales y consistencia (pacientes, médicos, seguros, citas).
- MongoDB para consulta rápida del historial completo de pacientes.

Cumple los requisitos del simulacro:
- Normalización relacional (3FN).
- Integridad referencial.
- Migración idempotente desde Excel (multer + xlsx).
- Endpoints obligatorios para médicos, reportes e historial.

## Tecnologías usadas
- Node.js
- Express
- MySQL (`mysql2`)
- MongoDB + Mongoose
- Multer
- XLSX

## Estructura del proyecto

```text
config/
  mysql.js
  mongo.js
controllers/
  migration.controller.js
  doctor.controller.js
  report.controller.js
  patient.controller.js
models/
  patientHistory.model.js
routes/
  migration.routes.js
  doctor.routes.js
  report.routes.js
  patient.routes.js
services/
  migration.service.js
  doctor.service.js
  report.service.js
  patient.service.js
sql/
  schema.sql
uploads/
index.js
```

## Configuración

### 1) Variables de entorno (`.env`)

```env
PORT=3000

# MYSQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=saludPlus

# MONGODB
MONGO_URI=mongodb://localhost:27017/saludplus
```

### 2) Base de datos MySQL

Ejecuta el script:

```bash
mysql -u root -p < sql/schema.sql
```

Si ya tienes las tablas creadas, puedes omitir este paso.

### 3) Instalar dependencias

```bash
npm install
```

### 4) Levantar servidor

```bash
npm start
```

Servidor en: `http://localhost:3000`

## Endpoints obligatorios

## Migración
- `POST /api/migration/upload`
- `form-data`: campo `file` (Excel/CSV)

Comportamiento:
- Lee archivo Excel.
- Inserta/actualiza datos únicos en MySQL.
- Crea/actualiza documento en MongoDB (`patient_histories`).
- Es idempotente (no duplica al reejecutar).
- Valida tipo de archivo (`.xlsx`, `.xls`, `.csv`) y tamaño máximo de 10MB.

Columnas esperadas en Excel (acepta variaciones comunes):
- `patient_name`, `patient_email`, `patient_phone`, `patient_address`
- `doctor_name`, `doctor_email`, `specialty`
- `insurance_name`, `coverage_percentage`
- `appointment_id`, `appointment_date`
- `treatment_code`, `treatment_description`, `treatment_cost`, `amount_paid`

## Médicos (MySQL)
- `GET /api/doctors`
- `GET /api/doctors?specialty=Cardiology`
- `GET /api/doctors/:id`
- `PUT /api/doctors/:id`

Ejemplo `PUT /api/doctors/1`:

```json
{
  "name": "Dr. Natalia Perez",
  "email": "natalia.perez@mail.com",
  "specialty": "Pediatrics"
}
```

Regla de consistencia implementada:
- Si cambia el nombre del médico, también se actualiza en MongoDB dentro de `patient_histories.appointments[].doctorName`, vinculando por `appointment_id` del doctor para evitar actualizaciones incorrectas.

## Reportes (MySQL)
- `GET /api/reports/revenue`
- `GET /api/reports/revenue?startDate=2024-01-01&endDate=2024-12-31`

Retorna:
- `totalRevenue`
- `totalByInsurance`
- `totalByDateRange`

## Historial de paciente (MongoDB)
- `GET /api/patients/:email/history`

Ejemplo:
- `GET /api/patients/ana.torres@mail.com/history`

Retorna el documento completo del paciente en `patient_histories`.

## Decisiones técnicas clave
- MySQL se usa para integridad relacional y consultas agregadas (reportes).
- MongoDB se usa para lectura rápida de historial completo sin joins.
- Migración idempotente:
  - MySQL: `INSERT ... ON DUPLICATE KEY UPDATE`.
  - MongoDB: reemplazo lógico por `appointmentId` (remove + push).
- Optimización SQL:
  - Índices en `appointments` para fecha, doctor y aseguradora.

## Scripts disponibles

En `package.json`:
- `npm start` -> inicia la API.
