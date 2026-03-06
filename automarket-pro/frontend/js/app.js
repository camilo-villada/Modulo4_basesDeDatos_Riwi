const API_URL = 'http://localhost:3000/api';
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');

        // Cargar datos al cambiar de tab
        const tab = btn.dataset.tab;
        if (tab === 'autos') loadAutos();
        if (tab === 'personas') loadPersonas();
        if (tab === 'transacciones') loadTransacciones();
        if (tab === 'rentabilidad') loadRentabilidad();
    });
});

// --- Utilidades ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function formatMoney(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO');
}

// --- Autos ---
async function loadAutos() {
    try {
        const res = await fetch(API_URL + '/autos');
        const data = await res.json();
        const tbody = document.getElementById('autos-tbody');

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="loading">No hay vehiculos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(a => `
            <tr>
                <td>${a.id}</td>
                <td><strong>${a.placa}</strong></td>
                <td>${a.marca}</td>
                <td>${a.modelo}</td>
                <td>${a.anio}</td>
                <td>${a.color || '-'}</td>
                <td>${Number(a.kilometraje).toLocaleString()} km</td>
                <td>${a.tipo_combustible}</td>
                <td><span class="badge badge-${a.estado}">${a.estado}</span></td>
                <td class="action-btns">
                    <button class="btn btn-warning btn-sm" onclick="editAuto(${a.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAuto(${a.id}, '${a.placa}')">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error cargando autos: ' + error.message, 'error');
    }
}

function showAutoForm(auto = null) {
    document.getElementById('auto-form-container').classList.remove('hidden');
    const title = document.getElementById('auto-form-title');

    if (auto) {
        title.textContent = 'Editar Auto';
        document.getElementById('auto-id').value = auto.id;
        document.getElementById('auto-placa').value = auto.placa;
        document.getElementById('auto-marca').value = auto.marca;
        document.getElementById('auto-modelo').value = auto.modelo;
        document.getElementById('auto-anio').value = auto.anio;
        document.getElementById('auto-color').value = auto.color || '';
        document.getElementById('auto-kilometraje').value = auto.kilometraje || 0;
        document.getElementById('auto-combustible').value = auto.tipo_combustible || 'gasolina';
        document.getElementById('auto-transmision').value = auto.transmision || 'manual';
        document.getElementById('auto-puertas').value = auto.numero_puertas || 4;
    } else {
        title.textContent = 'Registrar Nuevo Auto';
        document.getElementById('auto-form').reset();
        document.getElementById('auto-id').value = '';
    }
}

function hideAutoForm() {
    document.getElementById('auto-form-container').classList.add('hidden');
    document.getElementById('auto-form').reset();
    document.getElementById('auto-id').value = '';
}

async function handleAutoSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('auto-id').value;
    const body = {
        placa: document.getElementById('auto-placa').value.toUpperCase().trim(),
        marca: document.getElementById('auto-marca').value.trim(),
        modelo: document.getElementById('auto-modelo').value.trim(),
        anio: parseInt(document.getElementById('auto-anio').value),
        color: document.getElementById('auto-color').value.trim() || null,
        kilometraje: parseFloat(document.getElementById('auto-kilometraje').value) || 0,
        tipo_combustible: document.getElementById('auto-combustible').value,
        transmision: document.getElementById('auto-transmision').value,
        numero_puertas: parseInt(document.getElementById('auto-puertas').value) || 4
    };

    try {
        const url = id ? `${API_URL}/autos/${id}` : `${API_URL}/autos`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (data.success) {
            showToast(data.message);
            hideAutoForm();
            loadAutos();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function editAuto(id) {
    try {
        const res = await fetch(`${API_URL}/autos/${id}`);
        const data = await res.json();
        if (data.success) {
            showAutoForm(data.data);
        }
    } catch (error) {
        showToast('Error cargando auto', 'error');
    }
}

async function deleteAuto(id, placa) {
    if (!confirm(`¿Eliminar el auto con placa ${placa}? Esta accion no se puede deshacer.`)) return;

    try {
        const res = await fetch(`${API_URL}/autos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast(data.message);
            loadAutos();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// --- Personas ---
async function loadPersonas() {
    try {
        const res = await fetch(API_URL + '/personas');
        const data = await res.json();
        const tbody = document.getElementById('personas-tbody');

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No hay personas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.documento}</strong></td>
                <td>${p.nombre}</td>
                <td>${p.apellido}</td>
                <td>${p.telefono || '-'}</td>
                <td>${p.email || '-'}</td>
                <td>${p.ciudad || '-'}</td>
                <td class="action-btns">
                    <button class="btn btn-warning btn-sm" onclick="editPersona(${p.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePersona(${p.id}, '${p.documento}')">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error cargando personas: ' + error.message, 'error');
    }
}

function showPersonaForm(persona = null) {
    document.getElementById('persona-form-container').classList.remove('hidden');
    const title = document.getElementById('persona-form-title');

    if (persona) {
        title.textContent = 'Editar Persona';
        document.getElementById('persona-id').value = persona.id;
        document.getElementById('persona-documento').value = persona.documento;
        document.getElementById('persona-nombre').value = persona.nombre;
        document.getElementById('persona-apellido').value = persona.apellido;
        document.getElementById('persona-telefono').value = persona.telefono || '';
        document.getElementById('persona-email').value = persona.email || '';
        document.getElementById('persona-direccion').value = persona.direccion || '';
        document.getElementById('persona-ciudad').value = persona.ciudad || '';
    } else {
        title.textContent = 'Registrar Nueva Persona';
        document.getElementById('persona-form').reset();
        document.getElementById('persona-id').value = '';
    }
}

function hidePersonaForm() {
    document.getElementById('persona-form-container').classList.add('hidden');
    document.getElementById('persona-form').reset();
    document.getElementById('persona-id').value = '';
}

async function handlePersonaSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('persona-id').value;
    const body = {
        documento: document.getElementById('persona-documento').value.trim(),
        nombre: document.getElementById('persona-nombre').value.trim(),
        apellido: document.getElementById('persona-apellido').value.trim(),
        telefono: document.getElementById('persona-telefono').value.trim() || null,
        email: document.getElementById('persona-email').value.trim() || null,
        direccion: document.getElementById('persona-direccion').value.trim() || null,
        ciudad: document.getElementById('persona-ciudad').value.trim() || null
    };

    try {
        const url = id ? `${API_URL}/personas/${id}` : `${API_URL}/personas`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (data.success) {
            showToast(data.message);
            hidePersonaForm();
            loadPersonas();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function editPersona(id) {
    try {
        const res = await fetch(`${API_URL}/personas/${id}`);
        const data = await res.json();
        if (data.success) {
            showPersonaForm(data.data);
        }
    } catch (error) {
        showToast('Error cargando persona', 'error');
    }
}

async function deletePersona(id, documento) {
    if (!confirm(`¿Eliminar la persona con documento ${documento}?`)) return;

    try {
        const res = await fetch(`${API_URL}/personas/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast(data.message);
            loadPersonas();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// --- Transacciones ---
async function loadTransacciones() {
    try {
        // Cargar selects de autos y personas
        await loadTransaccionSelects();

        const res = await fetch(API_URL + '/transacciones');
        const data = await res.json();
        const tbody = document.getElementById('transacciones-tbody');

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No hay transacciones registradas</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(t => `
            <tr>
                <td>${t.id}</td>
                <td><span class="badge badge-${t.tipo}">${t.tipo.toUpperCase()}</span></td>
                <td>${t.placa} - ${t.marca} ${t.modelo_auto}</td>
                <td>${t.persona_nombre} ${t.persona_apellido}</td>
                <td class="money">${formatMoney(t.precio)}</td>
                <td>${formatDate(t.fecha)}</td>
                <td>${t.observaciones || '-'}</td>
                <td class="action-btns">
                    <button class="btn btn-danger btn-sm" onclick="deleteTransaccion(${t.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Error cargando transacciones: ' + error.message, 'error');
    }
}

async function loadTransaccionSelects() {
    try {
        const [autosRes, personasRes] = await Promise.all([
            fetch(API_URL + '/autos'),
            fetch(API_URL + '/personas')
        ]);
        const autosData = await autosRes.json();
        const personasData = await personasRes.json();

        const autoSelect = document.getElementById('trans-auto');
        autoSelect.innerHTML = '<option value="">Seleccione un auto...</option>';
        if (autosData.success) {
            autosData.data.forEach(a => {
                autoSelect.innerHTML += `<option value="${a.id}">${a.placa} - ${a.marca} ${a.modelo} (${a.estado})</option>`;
            });
        }

        const personaSelect = document.getElementById('trans-persona');
        personaSelect.innerHTML = '<option value="">Seleccione una persona...</option>';
        if (personasData.success) {
            personasData.data.forEach(p => {
                personaSelect.innerHTML += `<option value="${p.id}">${p.documento} - ${p.nombre} ${p.apellido}</option>`;
            });
        }
    } catch (error) {
        console.error('Error cargando selects:', error);
    }
}

function showTransaccionForm() {
    document.getElementById('transaccion-form-container').classList.remove('hidden');
    document.getElementById('trans-fecha').value = new Date().toISOString().split('T')[0];
}

function hideTransaccionForm() {
    document.getElementById('transaccion-form-container').classList.add('hidden');
    document.getElementById('transaccion-form').reset();
}

async function handleTransaccionSubmit(e) {
    e.preventDefault();
    const body = {
        tipo: document.getElementById('trans-tipo').value,
        auto_id: parseInt(document.getElementById('trans-auto').value),
        persona_id: parseInt(document.getElementById('trans-persona').value),
        precio: parseFloat(document.getElementById('trans-precio').value),
        fecha: document.getElementById('trans-fecha').value,
        observaciones: document.getElementById('trans-observaciones').value.trim() || null
    };

    try {
        const res = await fetch(`${API_URL}/transacciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (data.success) {
            showToast(data.message);
            hideTransaccionForm();
            loadTransacciones();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function deleteTransaccion(id) {
    if (!confirm('¿Eliminar esta transaccion?')) return;

    try {
        const res = await fetch(`${API_URL}/transacciones/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast(data.message);
            loadTransacciones();
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// --- Rentabilidad ---
async function loadRentabilidad() {
    try {
        const res = await fetch(API_URL + '/transacciones/rentabilidad');
        const data = await res.json();
        const tbody = document.getElementById('rentabilidad-tbody');

        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay datos de rentabilidad disponibles</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(r => {
            const gananciaClass = r.margen_ganancia >= 0 ? 'money-positive' : 'money-negative';
            return `
                <tr>
                    <td><strong>${r.placa}</strong></td>
                    <td>${r.marca}</td>
                    <td>${r.modelo}</td>
                    <td class="money">${formatMoney(r.precio_compra)}</td>
                    <td class="money">${formatMoney(r.precio_venta)}</td>
                    <td class="money ${gananciaClass}">${formatMoney(r.margen_ganancia)}</td>
                    <td class="money ${gananciaClass}">${r.porcentaje_ganancia}%</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        showToast('Error cargando rentabilidad: ' + error.message, 'error');
    }
}

// --- Importacion CSV ---
function updateFileName(input) {
    const label = document.getElementById('file-name');
    if (input.files.length > 0) {
        label.textContent = input.files[0].name;
    } else {
        label.textContent = 'Seleccionar archivo CSV...';
    }
}

async function handleCsvUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('csv-file');
    if (!fileInput.files.length) {
        showToast('Seleccione un archivo CSV', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('archivo', fileInput.files[0]);

    try {
        showToast('Procesando archivo...', 'warning');

        const res = await fetch(`${API_URL}/autos/import-csv`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        const resultsDiv = document.getElementById('csv-results');
        const contentDiv = document.getElementById('csv-results-content');
        resultsDiv.classList.remove('hidden');

        if (data.success) {
            const d = data.data;
            contentDiv.innerHTML = `
                <div class="result-card">
                    <div class="result-item info">
                        <span class="number">${d.total_procesados}</span>
                        <span class="label">Total procesados</span>
                    </div>
                    <div class="result-item success">
                        <span class="number">${d.insertados}</span>
                        <span class="label">Insertados</span>
                    </div>
                    <div class="result-item warning">
                        <span class="number">${d.duplicados}</span>
                        <span class="label">Duplicados (omitidos)</span>
                    </div>
                    <div class="result-item error">
                        <span class="number">${d.errores.length}</span>
                        <span class="label">Errores</span>
                    </div>
                </div>
                ${d.errores.length > 0 ? '<p style="margin-top:1rem;color:var(--danger)">Errores: ' + d.errores.map(e => e.placa + ': ' + e.error).join(', ') + '</p>' : ''}
            `;
            showToast(`Importacion completada: ${d.insertados} vehiculos insertados`);
        } else {
            contentDiv.innerHTML = `<p style="color:var(--danger)">${data.message}</p>`;
            showToast(data.message, 'error');
        }

        // Reset form
        fileInput.value = '';
        document.getElementById('file-name').textContent = 'Seleccionar archivo CSV...';
    } catch (error) {
        showToast('Error subiendo archivo: ' + error.message, 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadAutos();
});
