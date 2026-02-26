
use("streamhub_semana3");

db.dropDatabase();

// TASK 2: Insercion de datos


db.usuarios.insertOne({
  nombre: "Ana Lopez",
  email: "ana@streamhub.com",
  plan: "basico",
  edad: 24,
  preferencias: ["Drama", "Sci-Fi"],
  historial: [
    { contenidoId: ObjectId("65f100000000000000000001"), vistoEn: new Date("2026-02-01"), progreso: 100 },
    { contenidoId: ObjectId("65f100000000000000000002"), vistoEn: new Date("2026-02-02"), progreso: 80 }
  ]
});

db.usuarios.insertMany([
  {
    nombre: "Bruno Diaz",
    email: "bruno@streamhub.com",
    plan: "premium",
    edad: 31,
    preferencias: ["Accion", "Thriller"],
    historial: [
      { contenidoId: ObjectId("65f100000000000000000003"), vistoEn: new Date("2026-02-01"), progreso: 100 },
      { contenidoId: ObjectId("65f100000000000000000004"), vistoEn: new Date("2026-02-03"), progreso: 100 },
      { contenidoId: ObjectId("65f100000000000000000005"), vistoEn: new Date("2026-02-04"), progreso: 100 },
      { contenidoId: ObjectId("65f100000000000000000006"), vistoEn: new Date("2026-02-05"), progreso: 100 },
      { contenidoId: ObjectId("65f100000000000000000007"), vistoEn: new Date("2026-02-06"), progreso: 100 },
      { contenidoId: ObjectId("65f100000000000000000001"), vistoEn: new Date("2026-02-07"), progreso: 100 }
    ]
  },
  {
    nombre: "Carla Mena",
    email: "carla@streamhub.com",
    plan: "familiar",
    edad: 28,
    preferencias: ["Comedia", "Animacion"],
    historial: [
      { contenidoId: ObjectId("65f100000000000000000008"), vistoEn: new Date("2026-02-08"), progreso: 100 }
    ]
  },
  {
    nombre: "Diego Ruiz",
    email: "diego@streamhub.com",
    plan: "premium",
    edad: 35,
    preferencias: ["Documental", "Drama"],
    historial: []
  }
]);

db.contenidos.insertMany([
  {
    _id: ObjectId("65f100000000000000000001"),
    tipo: "pelicula",
    titulo: "Ciudad de Hielo",
    generos: ["Drama", "Thriller"],
    duracionMin: 132,
    anio: 2024,
    detalles: { idioma: "es", clasificacion: "+16" }
  },
  {
    _id: ObjectId("65f100000000000000000002"),
    tipo: "pelicula",
    titulo: "Rumbo a Marte",
    generos: ["Sci-Fi"],
    duracionMin: 145,
    anio: 2023,
    detalles: { idioma: "es", clasificacion: "+13" }
  },
  {
    _id: ObjectId("65f100000000000000000003"),
    tipo: "pelicula",
    titulo: "Noche Final",
    generos: ["Accion", "Thriller"],
    duracionMin: 118,
    anio: 2022,
    detalles: { idioma: "en", clasificacion: "+16" }
  },
  {
    _id: ObjectId("65f100000000000000000004"),
    tipo: "pelicula",
    titulo: "Risa Total",
    generos: ["Comedia"],
    duracionMin: 98,
    anio: 2021,
    detalles: { idioma: "es", clasificacion: "ATP" }
  },
  {
    _id: ObjectId("65f100000000000000000005"),
    tipo: "serie",
    titulo: "Distrito 9",
    generos: ["Drama", "Sci-Fi"],
    temporadas: 3,
    episodios: 24,
    anio: 2024,
    detalles: { idioma: "es", estado: "en_emision" }
  },
  {
    _id: ObjectId("65f100000000000000000006"),
    tipo: "serie",
    titulo: "Cocina de Barrio",
    generos: ["Comedia"],
    temporadas: 2,
    episodios: 16,
    anio: 2023,
    detalles: { idioma: "es", estado: "finalizada" }
  },
  {
    _id: ObjectId("65f100000000000000000007"),
    tipo: "pelicula",
    titulo: "Bosque Vivo",
    generos: ["Documental"],
    duracionMin: 102,
    anio: 2020,
    detalles: { idioma: "es", clasificacion: "ATP" }
  },
  {
    _id: ObjectId("65f100000000000000000008"),
    tipo: "pelicula",
    titulo: "Aventura Pixel",
    generos: ["Animacion", "Comedia"],
    duracionMin: 95,
    anio: 2024,
    detalles: { idioma: "es", clasificacion: "ATP" }
  }
]);

db.valoraciones.insertMany([
  { usuarioEmail: "ana@streamhub.com", contenidoId: ObjectId("65f100000000000000000001"), puntuacion: 9, comentario: "Muy buena", likes: 2 },
  { usuarioEmail: "ana@streamhub.com", contenidoId: ObjectId("65f100000000000000000002"), puntuacion: 8, comentario: "Buen ritmo", likes: 1 },
  { usuarioEmail: "bruno@streamhub.com", contenidoId: ObjectId("65f100000000000000000003"), puntuacion: 7, comentario: "Aceptable", likes: 0 },
  { usuarioEmail: "bruno@streamhub.com", contenidoId: ObjectId("65f100000000000000000001"), puntuacion: 10, comentario: "Top", likes: 5 },
  { usuarioEmail: "carla@streamhub.com", contenidoId: ObjectId("65f100000000000000000008"), puntuacion: 9, comentario: "Ideal familia", likes: 3 },
  { usuarioEmail: "diego@streamhub.com", contenidoId: ObjectId("65f100000000000000000007"), puntuacion: 8, comentario: "Interesante", likes: 1 }
]);

db.listas.insertMany([
  {
    usuarioEmail: "ana@streamhub.com",
    nombre: "Ver fin de semana",
    items: [ObjectId("65f100000000000000000001"), ObjectId("65f100000000000000000005")]
  },
  {
    usuarioEmail: "carla@streamhub.com",
    nombre: "Para ver en familia",
    items: [ObjectId("65f100000000000000000008"), ObjectId("65f100000000000000000004")]
  }
]);

// TASK 3: Consultas find con operadores


// $gt: peliculas con duracion mayor a 120 min
db.contenidos.find({ tipo: "pelicula", duracionMin: { $gt: 120 } });

// $lt: contenidos antes de 2023
db.contenidos.find({ anio: { $lt: 2023 } });

// $eq: usuarios premium
db.usuarios.find({ plan: { $eq: "premium" } });

// $in: contenidos de generos seleccionados
db.contenidos.find({ generos: { $in: ["Sci-Fi", "Documental"] } });

// $and: peliculas 2023+ y duracion menor a 150
db.contenidos.find({
  $and: [{ tipo: "pelicula" }, { anio: { $gt: 2022 } }, { duracionMin: { $lt: 150 } }]
});

// $or: plan premium o familiar
db.usuarios.find({ $or: [{ plan: "premium" }, { plan: "familiar" }] });

// $regex: titulos que empiezan con "R"
db.contenidos.find({ titulo: { $regex: "^R", $options: "i" } });

// Usuarios que vieron mas de 5 contenidos (expresion)
db.usuarios.find({ $expr: { $gt: [{ $size: "$historial" }, 5] } });


// TASK 4: Updates y deletions


// updateOne: cambiar puntuacion
db.valoraciones.updateOne(
  { usuarioEmail: "ana@streamhub.com", contenidoId: ObjectId("65f100000000000000000002") },
  { $set: { puntuacion: 9, comentario: "Mejor de lo esperado" } }
);

// updateMany: subir likes a valoraciones de 9 o mas
db.valoraciones.updateMany({ puntuacion: { $gte: 9 } }, { $inc: { likes: 1 } });

// updateOne: agregar elemento al historial
db.usuarios.updateOne(
  { email: "diego@streamhub.com" },
  {
    $push: {
      historial: {
        contenidoId: ObjectId("65f100000000000000000005"),
        vistoEn: new Date("2026-02-10"),
        progreso: 60
      }
    }
  }
);

// deleteOne: eliminar una valoracion baja
db.valoraciones.deleteOne({ usuarioEmail: "bruno@streamhub.com", puntuacion: 7 });

// deleteMany: limpiar contenido muy antiguo
db.contenidos.deleteMany({ anio: { $lt: 2021 } });


// TASK 5: Indices y revision


db.usuarios.createIndex({ email: 1 }, { unique: true });
db.contenidos.createIndex({ titulo: 1 });
db.contenidos.createIndex({ generos: 1 });
db.valoraciones.createIndex({ contenidoId: 1 });
db.valoraciones.createIndex({ usuarioEmail: 1, puntuacion: -1 });

db.usuarios.getIndexes();
db.contenidos.getIndexes();
db.valoraciones.getIndexes();


// Agregaciones (minimo 2 solicitadas)


// 1) Promedio de puntuacion por contenido
db.valoraciones.aggregate([
  { $match: { puntuacion: { $gte: 7 } } },
  {
    $group: {
      _id: "$contenidoId",
      promedio: { $avg: "$puntuacion" },
      totalValoraciones: { $sum: 1 }
    }
  },
  { $sort: { promedio: -1, totalValoraciones: -1 } },
  {
    $project: {
      _id: 0,
      contenidoId: "$_id",
      promedio: { $round: ["$promedio", 2] },
      totalValoraciones: 1
    }
  }
]);

// 2) Generos mas consumidos segun historial de usuarios
db.usuarios.aggregate([
  { $match: { historial: { $ne: [] } } },
  { $unwind: "$historial" },
  {
    $lookup: {
      from: "contenidos",
      localField: "historial.contenidoId",
      foreignField: "_id",
      as: "contenido"
    }
  },
  { $unwind: "$contenido" },
  { $unwind: "$contenido.generos" },
  {
    $group: {
      _id: "$contenido.generos",
      reproducciones: { $sum: 1 }
    }
  },
  { $sort: { reproducciones: -1 } },
  {
    $project: {
      _id: 0,
      genero: "$_id",
      reproducciones: 1
    }
  }
]);


