// src/routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /datos => filtra los logs según el colegio del usuario
router.get('/datos', authMiddleware, dataController.getDatos);

module.exports = router;
