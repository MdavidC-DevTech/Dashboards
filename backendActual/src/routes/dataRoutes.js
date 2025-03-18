// src/routes/dataRoutes.js
const express = require('express');
const router = express.Router();

// Asegúrate de que la ruta relativa sea correcta:
const dataController = require('../controllers/dataController');

// Registra la ruta usando la función exportada
router.get('/datos', dataController.getDatos);

module.exports = router;
