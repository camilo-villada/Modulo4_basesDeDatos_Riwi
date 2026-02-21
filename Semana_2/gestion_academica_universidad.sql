-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_academica_universidad;
USE gestion_academica_universidad;


-- TASK 1: Crear tablas

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    genero VARCHAR(20) NOT NULL,
    identificacion VARCHAR(20) NOT NULL UNIQUE,
    carrera VARCHAR(80) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    fecha_ingreso DATE NOT NULL,
    CHECK (genero IN ('Masculino', 'Femenino', 'Otro'))
);

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(100) NOT NULL UNIQUE,
    departamento_academico VARCHAR(80) NOT NULL,
    anios_experiencia INT NOT NULL CHECK (anios_experiencia >= 0)
);

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    creditos INT NOT NULL CHECK (creditos >= 1),
    semestre INT NOT NULL CHECK (semestre >= 1),
    id_docente INT,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE SET NULL
);

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    calificacion_final DECIMAL(3,1) NOT NULL CHECK (calificacion_final >= 0 AND calificacion_final <= 5),
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE
);


-- TASK 2: Insertar datos

INSERT INTO estudiantes (nombre_completo, correo_electronico, genero, identificacion, carrera, fecha_nacimiento, fecha_ingreso)
VALUES
('Carlos Mendoza', 'carlos.mendoza@correo.com', 'Masculino', '1001234567', 'Ingenieria de Sistemas', '2000-03-15', '2019-02-01'),
('Laura Jimenez', 'laura.jimenez@correo.com', 'Femenino', '1009876543', 'Administracion', '2001-07-22', '2020-01-20'),
('Pedro Suarez', 'pedro.suarez@correo.com', 'Masculino', '1005551234', 'Contaduria', '1999-11-10', '2018-07-15'),
('Maria Gonzalez', 'maria.gonzalez@correo.com', 'Femenino', '1003334444', 'Ingenieria de Sistemas', '2002-05-30', '2021-01-18'),
('Andres Perez', 'andres.perez@correo.com', 'Masculino', '1007778888', 'Economia', '2000-09-08', '2019-07-10');

INSERT INTO docentes (nombre_completo, correo_institucional, departamento_academico, anios_experiencia)
VALUES
('Jorge Ramirez', 'j.ramirez@uni.edu', 'Ingenieria', 10),
('Sandra Lopez', 's.lopez@uni.edu', 'Ciencias Basicas', 3),
('Miguel Torres', 'm.torres@uni.edu', 'Administracion', 7);

INSERT INTO cursos (nombre, codigo, creditos, semestre, id_docente)
VALUES
('Programacion I', 'SIS101', 4, 1, 1),
('Calculo Diferencial', 'MAT101', 3, 2, 2),
('Contabilidad General', 'ADM101', 3, 2, 3),
('Bases de Datos', 'SIS201', 4, 3, 1);

INSERT INTO inscripciones (id_estudiante, id_curso, fecha_inscripcion, calificacion_final)
VALUES
(1, 1, '2024-02-05', 4.2),
(1, 4, '2024-02-05', 3.8),
(2, 3, '2024-02-06', 4.5),
(2, 2, '2024-02-06', 3.1),
(3, 3, '2024-02-07', 2.9),
(4, 1, '2024-02-07', 4.8),
(5, 2, '2024-02-08', 3.5),
(4, 4, '2024-02-08', 4.0),
(3, 1, '2024-02-09', 3.6);


-- TASK 3: Consultas basicas y manipulacion

-- Listar estudiantes con sus cursos inscritos
SELECT estudiantes.nombre_completo, cursos.nombre, inscripciones.fecha_inscripcion, inscripciones.calificacion_final
FROM estudiantes
INNER JOIN inscripciones ON inscripciones.id_estudiante = estudiantes.id_estudiante
INNER JOIN cursos ON cursos.id_curso = inscripciones.id_curso;

-- Cursos dictados por docentes con mas de 5 anos de experiencia
SELECT cursos.nombre, docentes.nombre_completo, docentes.anios_experiencia
FROM cursos
INNER JOIN docentes ON docentes.id_docente = cursos.id_docente
WHERE docentes.anios_experiencia > 5;

-- Promedio de calificaciones por curso
SELECT cursos.nombre, AVG(inscripciones.calificacion_final) AS promedio
FROM cursos
INNER JOIN inscripciones ON inscripciones.id_curso = cursos.id_curso
GROUP BY cursos.nombre;

-- Estudiantes inscritos en mas de un curso
SELECT estudiantes.nombre_completo, COUNT(*) AS total_cursos
FROM estudiantes
INNER JOIN inscripciones ON inscripciones.id_estudiante = estudiantes.id_estudiante
GROUP BY estudiantes.nombre_completo
HAVING COUNT(*) > 1;

-- Agregar columna estado_academico
ALTER TABLE estudiantes ADD COLUMN estado_academico VARCHAR(20) DEFAULT 'Activo';

-- Ver cursos antes de eliminar docente
SELECT id_curso, nombre, id_docente FROM cursos;

-- Eliminar docente 2
DELETE FROM docentes WHERE id_docente = 2;

-- Ver cursos despues, id_docente queda NULL donde corresponde
SELECT id_curso, nombre, id_docente FROM cursos;

-- Cursos con mas de 2 estudiantes inscritos
SELECT cursos.nombre, COUNT(inscripciones.id_inscripcion) AS cantidad
FROM cursos
INNER JOIN inscripciones ON inscripciones.id_curso = cursos.id_curso
GROUP BY cursos.nombre
HAVING COUNT(inscripciones.id_inscripcion) > 2;


-- TASK 4: Subconsultas y funciones

-- Estudiantes con promedio mayor al promedio general
SELECT estudiantes.nombre_completo, AVG(inscripciones.calificacion_final) AS promedio
FROM estudiantes
INNER JOIN inscripciones ON inscripciones.id_estudiante = estudiantes.id_estudiante
GROUP BY estudiantes.nombre_completo
HAVING AVG(inscripciones.calificacion_final) > (SELECT AVG(calificacion_final) FROM inscripciones);

-- Carreras con estudiantes en cursos de semestre >= 2
SELECT DISTINCT estudiantes.carrera
FROM estudiantes
WHERE EXISTS (
    SELECT 1 FROM inscripciones
    INNER JOIN cursos ON cursos.id_curso = inscripciones.id_curso
    WHERE inscripciones.id_estudiante = estudiantes.id_estudiante
    AND cursos.semestre >= 2
);

-- Indicadores generales
SELECT COUNT(*) AS total_inscripciones,
       ROUND(AVG(calificacion_final), 2) AS promedio_general,
       SUM(calificacion_final) AS suma_calificaciones,
       MAX(calificacion_final) AS nota_maxima,
       MIN(calificacion_final) AS nota_minima
FROM inscripciones;


-- TASK 5: Vista del historial academico

DROP VIEW IF EXISTS vista_historial_academico;

CREATE VIEW vista_historial_academico AS
SELECT estudiantes.nombre_completo AS estudiante,
       cursos.nombre AS curso,
       docentes.nombre_completo AS docente,
       cursos.semestre,
       inscripciones.calificacion_final
FROM inscripciones
INNER JOIN estudiantes ON estudiantes.id_estudiante = inscripciones.id_estudiante
INNER JOIN cursos ON cursos.id_curso = inscripciones.id_curso
LEFT JOIN docentes ON docentes.id_docente = cursos.id_docente;

SELECT * FROM vista_historial_academico;


-- TASK 6: Permisos y transacciones

CREATE ROLE IF NOT EXISTS revisor_academico;
GRANT SELECT ON gestion_academica_universidad.vista_historial_academico TO revisor_academico;
REVOKE INSERT, UPDATE, DELETE ON gestion_academica_universidad.inscripciones FROM revisor_academico;

BEGIN;

UPDATE inscripciones SET calificacion_final = 4.9 WHERE id_inscripcion = 6;

SAVEPOINT punto1;

UPDATE inscripciones SET calificacion_final = 1.0 WHERE id_inscripcion = 8;

ROLLBACK TO punto1;

COMMIT;

SELECT * FROM inscripciones;
