# PARTE 5: INVESTIGACIÓN DE MULTER

## 1. Definición y Flujo de un Middleware

Un **middleware** en Express.js es una función que tiene acceso al objeto de solicitud (`req`), al objeto de respuesta (`res`) y a la función `next()` del ciclo solicitud-respuesta. Los middleware se ejecutan en cadena secuencial y pueden:

- Ejecutar código antes de que llegue al controlador.
- Modificar los objetos `req` y `res`.
- Finalizar el ciclo de solicitud-respuesta.
- Llamar a `next()` para pasar el control al siguiente middleware.

### Flujo de ejecución:

```
Cliente → Solicitud HTTP
    ↓
[Middleware 1] → cors()
    ↓ next()
[Middleware 2] → express.json()
    ↓ next()
[Middleware 3] → multer (procesa archivos)
    ↓ next()
[Controlador] → Lógica de negocio
    ↓
Respuesta HTTP → Cliente
```

### Ejemplo básico:

```javascript
// Middleware personalizado de logging
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next(); // Pasa al siguiente middleware
};

app.use(logger);
```

---

## 2. Protocolo multipart/form-data

El protocolo **multipart/form-data** es un tipo de codificación utilizado en formularios HTML para el envío de datos que incluyen archivos binarios. A diferencia de `application/x-www-form-urlencoded` (que solo maneja texto), `multipart/form-data`:

- **Divide el cuerpo** de la solicitud HTTP en múltiples partes, separadas por un "boundary" (delimitador único).
- **Cada parte** contiene sus propias cabeceras (`Content-Disposition`, `Content-Type`) y un cuerpo con los datos.
- **Permite enviar** archivos binarios (imágenes, CSV, PDF) junto con campos de texto en una misma solicitud.

### Estructura de una solicitud multipart:

```
POST /api/autos/import-csv HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="archivo"; filename="autos.csv"
Content-Type: text/csv

placa,marca,modelo,anio,color
ABC123,Toyota,Corolla,2020,Blanco
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

### ¿Por qué Express no lo procesa nativamente?

Express con `express.json()` y `express.urlencoded()` solo procesa cuerpos con codificación JSON y URL-encoded. Para procesar `multipart/form-data`, se necesita un middleware especializado como **Multer**.

---

## 3. Mecanismos Internos de Multer

**Multer** es un middleware de Node.js para el manejo de `multipart/form-data`, diseñado principalmente para la carga de archivos. Utiliza internamente la librería `busboy` para parsear los datos multipart.

### Flujo interno de Multer:

```
1. Intercepta la solicitud HTTP con Content-Type: multipart/form-data
2. Usa busboy para parsear el stream del cuerpo
3. Extrae los campos de texto → los coloca en req.body
4. Extrae los archivos → los procesa según la estrategia de almacenamiento
5. Coloca la información del archivo en req.file (single) o req.files (array)
6. Llama a next() para continuar al controlador
```

### 3.1 diskStorage (Almacenamiento en disco)

Guarda los archivos directamente en el sistema de archivos del servidor.

```javascript
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');  // Carpeta destino
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
```

**Características:**
- [+] El archivo persiste en disco después de la solicitud.
- [+] Ideal para archivos grandes que no caben en memoria.
- [+] Se puede acceder al archivo posteriormente por su ruta.
- [!] Requiere gestión manual de limpieza de archivos temporales.
- [!] Más lento por operación de I/O en disco.

**Objeto `req.file` con diskStorage:**
```javascript
{
    fieldname: 'archivo',
    originalname: 'autos.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    destination: './uploads',
    filename: '1677123456789-autos.csv',
    path: 'uploads/1677123456789-autos.csv',
    size: 2048
}
```

### 3.2 memoryStorage (Almacenamiento en memoria)

Guarda los archivos como objetos `Buffer` en la memoria RAM.

```javascript
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
```

**Características:**
- [+] Más rápido: no hay operaciones de I/O en disco.
- [+] Ideal para archivos pequeños que se procesan y descartan.
- [+] No deja archivos temporales en el sistema.
- [!] Consume memoria RAM del servidor.
- [!] Riesgo de crash si se cargan archivos muy grandes.

**Objeto `req.file` con memoryStorage:**
```javascript
{
    fieldname: 'archivo',
    originalname: 'autos.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: <Buffer 70 6c 61 63 61 ...>,  // Datos del archivo en memoria
    size: 2048
}
```

### 3.3 Tabla Comparativa

| Característica       | diskStorage              | memoryStorage           |
|----------------------|--------------------------|-------------------------|
| Almacenamiento       | Sistema de archivos      | RAM (Buffer)            |
| Velocidad            | Más lento (I/O disco)    | Más rápido              |
| Persistencia         | Archivo persiste         | Se pierde al terminar   |
| Uso de memoria       | Bajo                     | Alto                    |
| Archivos grandes     | Si - Recomendado         | No - Riesgoso           |
| Procesamiento rápido | No - Requiere leer archivo | Si - Buffer disponible |
| Limpieza             | Manual (fs.unlink)       | Automática (GC)         |

### Decisión para este proyecto:

Se eligió **diskStorage** porque:
1. Los archivos CSV pueden variar en tamaño.
2. Necesitamos leer el archivo línea por línea con `csv-parser` (stream).
3. Podemos limpiar el archivo después del procesamiento.
4. Es más seguro para un entorno de producción.
