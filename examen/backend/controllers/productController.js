// Product CRUD controller with MongoDB audit log on delete.
const productRepo = require('../repositories/productRepository');
const { createAuditLog } = require('../repositories/mongoRepository');

const getAll = async (req, res) => {
  try {
    const products = await productRepo.getAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await productRepo.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { sku, name, price, id_category, id_supplier } = req.body;
    if (!sku || !name || !price || !id_category || !id_supplier)
      return res.status(400).json({ error: 'All fields are required' });
    const id = await productRepo.create({ sku, name, price, id_category, id_supplier });
    res.status(201).json({ id_product: id, sku, name, price, id_category, id_supplier });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'SKU already exists' });
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { sku, name, price, id_category, id_supplier } = req.body;
    if (!sku || !name || !price || !id_category || !id_supplier)
      return res.status(400).json({ error: 'All fields are required' });
    const affected = await productRepo.update(req.params.id, { sku, name, price, id_category, id_supplier });
    if (!affected) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE: saves audit log to MongoDB before deleting from SQL.
const remove = async (req, res) => {
  try {
    // Get product data before deletion for audit.
    const product = await productRepo.getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const affected = await productRepo.remove(req.params.id);
    if (!affected) return res.status(404).json({ error: 'Product not found' });

    // Save audit log in MongoDB.
    await createAuditLog('product', product);

    res.status(200).json({ message: 'Product deleted and audit log saved' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2')
      return res.status(409).json({ error: 'Product has orders, cannot delete' });
    res.status(500).json({ error: error.message });
  }
};

// Get categories and suppliers for form dropdowns.
const getCategories = async (req, res) => {
  try {
    res.status(200).json(await productRepo.getCategories());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSuppliers = async (req, res) => {
  try {
    res.status(200).json(await productRepo.getSuppliers());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getCategories, getSuppliers };
