// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const fakeUsers = require('../models/fakeUsers');

// POST /auth/token (login)
router.post('/token', authController.login);

// GET /auth/users/me
router.get('/users/me', authMiddleware, (req, res) => {
  const username = req.user.sub;
  const userData = fakeUsers[username];
  if (!userData) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  return res.json({
    user: {
      username: userData.username,
      full_name: userData.full_name+userData.email,
      email: userData.email,
      role: userData.role,
      categoryId: userData.categoryId,
      collegeName: userData.collegeName  // Asegúrate de haber agregado esta propiedad
    }
  });
});

module.exports = router;
