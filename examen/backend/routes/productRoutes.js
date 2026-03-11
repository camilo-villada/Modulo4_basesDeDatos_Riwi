// Router for product CRUD endpoints.
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

router.get('/categories', ctrl.getCategories);   // GET /api/products/categories
router.get('/suppliers', ctrl.getSuppliers);      // GET /api/products/suppliers
router.get('/', ctrl.getAll);                     // GET /api/products
router.get('/:id', ctrl.getById);                 // GET /api/products/:id
router.post('/', ctrl.create);                    // POST /api/products
router.put('/:id', ctrl.update);                  // PUT /api/products/:id
router.delete('/:id', ctrl.remove);               // DELETE /api/products/:id

module.exports = router;
