const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');

router.get('/', transaccionController.getAll);
router.get('/rentabilidad', transaccionController.getRentabilidad);
router.get('/:id', transaccionController.getById);
router.get('/auto/:autoId', transaccionController.getByAutoId);
router.post('/', transaccionController.create);
router.delete('/:id', transaccionController.delete);

module.exports = router;
