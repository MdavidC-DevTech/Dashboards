// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /token (login)
router.post('/token', authController.login);

// GET /users/me (obtener datos de usuario autenticado)
router.get('/users/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
