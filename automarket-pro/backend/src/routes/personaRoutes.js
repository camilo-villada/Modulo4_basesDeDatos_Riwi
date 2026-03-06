const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');

router.get('/', personaController.getAll);
router.get('/:id', personaController.getById);
router.get('/documento/:documento', personaController.getByDocumento);
router.post('/', personaController.create);
router.put('/:id', personaController.update);
router.delete('/:id', personaController.delete);

module.exports = router;
