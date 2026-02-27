const configuracion = {
  clientes: {
    titulo: "Clientes",
    endpoint: "/api/clientes",
    idLabel: "ID cliente",
    idPlaceholder: "Solo para actualizar o eliminar",
    campos: [
      { nombre: "nombre", label: "Nombre", tipo: "text", placeholder: "Ej: Carlos Perez" },
      { nombre: "email", label: "Email", tipo: "text", placeholder: "Ej: correo@gmail.com" },
      { nombre: "telefono", label: "Telefono", tipo: "text", placeholder: "Ej: 3001234567" },
      { nombre: "ciudad", label: "Ciudad", tipo: "text", placeholder: "Ej: Medellin" },
    ],
  },
  productos: {
    titulo: "Productos",
    endpoint: "/api/productos",
    idLabel: "ID producto",
    idPlaceholder: "Solo para actualizar o eliminar",
    campos: [
      { nombre: "nombre", label: "Nombre", tipo: "text", placeholder: "Ej: Mouse Logitech" },
      { nombre: "categoria", label: "Categoria", tipo: "text", placeholder: "Ej: Tecnologia" },
      { nombre: "precio", label: "Precio", tipo: "text", placeholder: "Ej: 80000" },
    ],
  },
  pedidos: {
    titulo: "Pedidos",
    endpoint: "/api/pedidos",
    idLabel: "ID pedido",
    idPlaceholder: "Usar para eliminar",
    campos: [
      { nombre: "fecha_pedido", label: "Fecha pedido", tipo: "text", placeholder: "YYYY-MM-DD" },
      { nombre: "id_cliente", label: "ID cliente", tipo: "text", placeholder: "Ej: 1" },
      { nombre: "id_vendedor", label: "ID vendedor", tipo: "text", placeholder: "Ej: 1" },
      {
        nombre: "productos",
        label: "Productos (JSON)",
        tipo: "textarea",
        placeholder: '[{"id_producto":1,"cantidad":1,"precio_unitario":3500000}]',
      },
    ],
    nota: "Nota: en pedidos el backend no tiene ruta para actualizar, solo crear/listar/eliminar.",
  },
};

const selectEntidad = document.getElementById("entidad");
const tituloFormulario = document.getElementById("titulo-formulario");
const camposDinamicos = document.getElementById("campos-dinamicos");
const mensaje = document.getElementById("mensaje");

const btnCrear = document.getElementById("btn-crear");
const btnActualizar = document.getElementById("btn-actualizar");
const btnEliminar = document.getElementById("btn-eliminar");
const btnListar = document.getElementById("btn-listar");

document.getElementById("form-dinamico").addEventListener("submit", (e) => {
  e.preventDefault();
});

selectEntidad.addEventListener("change", cambiarEntidad);
btnCrear.addEventListener("click", crearRegistro);
btnActualizar.addEventListener("click", actualizarRegistro);
btnEliminar.addEventListener("click", eliminarRegistro);
btnListar.addEventListener("click", listarRegistros);

function mostrarMensaje(texto) {
  mensaje.innerText = texto;
}

function cambiarEntidad() {
  // aqui detecto que tabla selecciono el usuario
  const entidad = selectEntidad.value;
  const conf = configuracion[entidad];

  tituloFormulario.innerText = "Formulario de " + conf.titulo;
  renderizarCampos(conf);

  if (entidad === "pedidos") {
    btnActualizar.disabled = true;
  } else {
    btnActualizar.disabled = false;
  }

  limpiarTabla();
  mostrarMensaje("Entidad seleccionada: " + conf.titulo);
}

function renderizarCampos(conf) {
  let html = `
    <label>${conf.idLabel}</label>
    <input id="campo_id" type="text" placeholder="${conf.idPlaceholder}" />
  `;

  for (let i = 0; i < conf.campos.length; i++) {
    const campo = conf.campos[i];

    if (campo.tipo === "textarea") {
      html += `
        <label>${campo.label}</label>
        <textarea id="campo_${campo.nombre}" rows="4" placeholder="${campo.placeholder}"></textarea>
      `;
    } else {
      html += `
        <label>${campo.label}</label>
        <input id="campo_${campo.nombre}" type="${campo.tipo}" placeholder="${campo.placeholder}" />
      `;
    }
  }

  if (conf.nota) {
    html += `<p>${conf.nota}</p>`;
  }

  camposDinamicos.innerHTML = html;
}

function obtenerId() {
  return document.getElementById("campo_id").value.trim();
}

function leerDatosFormulario(entidad) {
  const conf = configuracion[entidad];
  const datos = {};

  for (let i = 0; i < conf.campos.length; i++) {
    const campo = conf.campos[i];
    const valor = document.getElementById("campo_" + campo.nombre).value;
    datos[campo.nombre] = valor;
  }

  if (entidad === "pedidos") {
    try {
      datos.productos = JSON.parse(datos.productos || "[]");
    } catch (error) {
      throw new Error("El JSON de productos no es valido");
    }
  }

  return datos;
}

async function enviarPeticion(url, metodo, cuerpo) {
  // aqui envio los datos al backend
  const opciones = {
    method: metodo,
    headers: { "Content-Type": "application/json" },
  };

  if (cuerpo) {
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(url, opciones);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || "Error en el servidor");
  }

  return data;
}

async function crearRegistro() {
  const entidad = selectEntidad.value;
  const conf = configuracion[entidad];

  try {
    const datos = leerDatosFormulario(entidad);
    const respuesta = await enviarPeticion(conf.endpoint, "POST", datos);
    mostrarMensaje(respuesta.mensaje || "Creado correctamente");
    listarRegistros();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function actualizarRegistro() {
  const entidad = selectEntidad.value;
  const conf = configuracion[entidad];

  if (entidad === "pedidos") {
    mostrarMensaje("Pedidos no tiene actualizar en este backend.");
    return;
  }

  const id = obtenerId();
  if (!id) {
    mostrarMensaje("Debes escribir un ID para actualizar");
    return;
  }

  try {
    const datos = leerDatosFormulario(entidad);
    const respuesta = await enviarPeticion(conf.endpoint + "/" + id, "PUT", datos);
    mostrarMensaje(respuesta.mensaje || "Actualizado correctamente");
    listarRegistros();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function eliminarRegistro() {
  const entidad = selectEntidad.value;
  const conf = configuracion[entidad];

  const id = obtenerId();
  if (!id) {
    mostrarMensaje("Debes escribir un ID para eliminar");
    return;
  }

  try {
    const respuesta = await enviarPeticion(conf.endpoint + "/" + id, "DELETE");
    mostrarMensaje(respuesta.mensaje || "Eliminado correctamente");
    listarRegistros();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function listarRegistros() {
  const entidad = selectEntidad.value;
  const conf = configuracion[entidad];

  try {
    const respuesta = await fetch(conf.endpoint);
    const data = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensaje(data.mensaje || "Error al listar");
      return;
    }

    construirTabla(data);
    mostrarMensaje("Listado cargado");
  } catch (error) {
    mostrarMensaje("No se pudo listar");
  }
}

function construirTabla(lista) {
  // aqui construyo la tabla dinamicamente
  const thead = document.getElementById("tabla-head");
  const tbody = document.getElementById("tabla-body");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (!Array.isArray(lista) || lista.length === 0) {
    thead.innerHTML = "<tr><th>Sin datos</th></tr>";
    return;
  }

  const columnas = Object.keys(lista[0]);
  let filaEncabezado = "<tr>";
  for (let i = 0; i < columnas.length; i++) {
    filaEncabezado += "<th>" + columnas[i] + "</th>";
  }
  filaEncabezado += "</tr>";
  thead.innerHTML = filaEncabezado;

  for (let i = 0; i < lista.length; i++) {
    const fila = lista[i];
    let htmlFila = "<tr>";

    for (let j = 0; j < columnas.length; j++) {
      const columna = columnas[j];
      const valor = fila[columna];
      htmlFila += "<td>" + formatearValor(valor) + "</td>";
    }

    htmlFila += "</tr>";
    tbody.innerHTML += htmlFila;
  }
}

function formatearValor(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  if (typeof valor === "object") {
    return JSON.stringify(valor);
  }

  return valor;
}

function limpiarTabla() {
  document.getElementById("tabla-head").innerHTML = "";
  document.getElementById("tabla-body").innerHTML = "";
}

// inicio basico
cambiarEntidad();
listarRegistros();
