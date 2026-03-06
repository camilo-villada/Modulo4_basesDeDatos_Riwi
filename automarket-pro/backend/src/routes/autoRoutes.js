const express = require('express');
const router = express.Router();
const autoController = require('../controllers/autoController');
const upload = require('../config/multer');

router.get('/', autoController.getAll);
router.get('/placa/:placa', autoController.getByPlaca);
router.get('/:id', autoController.getById);
router.post('/', autoController.create);
router.post('/import-csv', upload.single('archivo'), autoController.importCsv);
router.put('/:id', autoController.update);
router.delete('/:id', autoController.delete);

module.exports = router;
