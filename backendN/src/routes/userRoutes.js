// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { updateUserFields } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Si deseas autenticación

// Usamos PATCH para actualizar
router.patch('/update', authMiddleware, updateUserFields);

module.exports = router;
