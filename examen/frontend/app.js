const API = 'http://localhost:3000/api';
let productsCache = [];

// Navigation
const showSection = (id) => {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if (id === 'dashboard') loadDashboard();
  if (id === 'products') loadProducts();
  if (id === 'audit') loadAuditLogs();
};

// Dashboard
const loadDashboard = async () => {
  const [products, categories, suppliers] = await Promise.all([
    fetch(`${API}/products`).then(r => r.json()),
    fetch(`${API}/products/categories`).then(r => r.json()),
    fetch(`${API}/products/suppliers`).then(r => r.json())
  ]);
  document.getElementById('total-products').textContent = products.length;
  document.getElementById('total-categories').textContent = categories.length;
  document.getElementById('total-suppliers').textContent = suppliers.length;
};

// Products CRUD
const loadProducts = async () => {
  productsCache = await fetch(`${API}/products`).then(r => r.json());
  document.getElementById('products-table').innerHTML = productsCache.map(p => `
    <tr>
      <td>${p.id_product}</td>
      <td>${p.sku}</td>
      <td>${p.name}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${p.category}</td>
      <td>${p.supplier}</td>
      <td>
        <button class="btn-edit" data-id="${p.id_product}">Edit</button>
        <button class="btn-delete" data-id="${p.id_product}">Delete</button>
      </td>
    </tr>
  `).join('');
  loadDropdowns();
};

// Delegated click handler — avoids inline onclick and handles special chars in product names.
document.getElementById('products-table').addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  if (e.target.classList.contains('btn-edit')) {
    const product = productsCache.find(p => p.id_product === id);
    if (product) editProduct(product);
  }
  if (e.target.classList.contains('btn-delete')) {
    deleteProduct(id);
  }
});

const loadDropdowns = async () => {
  const [categories, suppliers] = await Promise.all([
    fetch(`${API}/products/categories`).then(r => r.json()),
    fetch(`${API}/products/suppliers`).then(r => r.json())
  ]);
  const catSel = document.getElementById('product-category');
  const supSel = document.getElementById('product-supplier');
  const currentCat = catSel.value;
  const currentSup = supSel.value;
  catSel.innerHTML = '<option value="">Category...</option>' +
    categories.map(c => `<option value="${c.id_category}">${c.name}</option>`).join('');
  supSel.innerHTML = '<option value="">Supplier...</option>' +
    suppliers.map(s => `<option value="${s.id_supplier}">${s.name}</option>`).join('');
  if (currentCat) catSel.value = currentCat;
  if (currentSup) supSel.value = currentSup;
};

const editProduct = (p) => {
  document.getElementById('product-id').value = p.id_product;
  document.getElementById('product-sku').value = p.sku;
  document.getElementById('product-name').value = p.name;
  document.getElementById('product-price').value = p.price;
  loadDropdowns().then(() => {
    document.getElementById('product-category').value = p.id_category;
    document.getElementById('product-supplier').value = p.id_supplier;
  });
};

const resetForm = () => {
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
};

const deleteProduct = async (id) => {
  if (!confirm('Delete this product? An audit log will be saved.')) return;
  const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    alert(`Could not delete: ${data.error}`);
  }
  loadProducts();
};

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const body = {
    sku: document.getElementById('product-sku').value,
    name: document.getElementById('product-name').value,
    price: document.getElementById('product-price').value,
    id_category: document.getElementById('product-category').value,
    id_supplier: document.getElementById('product-supplier').value
  };
  let res;
  if (id) {
    res = await fetch(`${API}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } else {
    res = await fetch(`${API}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  }
  if (!res.ok) {
    const data = await res.json();
    alert(`Error: ${data.error}`);
    return;
  }
  resetForm();
  loadProducts();
});

// Reports
const loadReport = async (type) => {
  const data = await fetch(`${API}/reports/${type}`).then(r => r.json());
  document.getElementById('report-result').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
};

const loadStarProducts = async () => {
  const category = document.getElementById('star-category').value;
  if (!category) return alert('Enter a category name');
  const data = await fetch(`${API}/reports/star-products?category=${encodeURIComponent(category)}`).then(r => r.json());
  document.getElementById('report-result').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
};

const loadCustomerHistory = async () => {
  const id = document.getElementById('history-customer').value;
  if (!id) return alert('Enter a customer ID');
  const data = await fetch(`${API}/reports/customer-history/${id}`).then(r => r.json());
  document.getElementById('report-result').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
};

// Audit logs
const loadAuditLogs = async () => {
  const data = await fetch(`${API}/mongo/audit-logs`).then(r => r.json());
  document.getElementById('audit-result').innerHTML = data.length
    ? `<pre>${JSON.stringify(data, null, 2)}</pre>`
    : '<p>No audit logs yet. Delete a product to generate one.</p>';
};

// Migration upload
document.getElementById('migration-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('migration-file').files[0];
  if (!file) return alert('Select a file first');
  const formData = new FormData();
  formData.append('file', file);
  document.getElementById('migration-result').innerHTML = '<p>⏳ Migrating... please wait.</p>';
  try {
    const res = await fetch(`${API}/migration/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    const color = res.ok ? '#2d6a4f' : '#c62828';
    document.getElementById('migration-result').innerHTML =
      `<pre style="color:${color}">${JSON.stringify(data, null, 2)}</pre>`;
    if (res.ok) loadDashboard();
  } catch (err) {
    document.getElementById('migration-result').innerHTML = `<p style="color:#c62828">Error: ${err.message}</p>`;
  }
});

// Load dashboard on startup.
loadDashboard();
