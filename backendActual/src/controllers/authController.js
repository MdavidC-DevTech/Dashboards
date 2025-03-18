// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const fakeUsers = require('../models/fakeUsers');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Buscar en fakeUsers:
    const user = fakeUsers[username];
    if (!user) {
      return res.status(401).json({ detail: "Usuario o contraseña incorrectos" });
    }

    // Comparar contraseñas
    if (password !== user.password) {
      return res.status(401).json({ detail: "Usuario o contraseña incorrectos" });
    }

    // Crear token
    const expiresIn = config.accessTokenExpireMinutes * 60; // en segundos
    const token = jwt.sign({ sub: user.username }, config.secretKey, { expiresIn });

    return res.json({
      access_token: token,
      token_type: "bearer"
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno en login' });
  }
}

// Nuevo endpoint: obtener datos del usuario autenticado
async function getCurrentUser(req, res) {
  try {
    // Se asume que authMiddleware ha verificado el token y asignado req.user
    const username = req.user && req.user.sub;
    if (!username) {
      return res.status(401).json({ error: "No autorizado" });
    }
    const user = fakeUsers[username];
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    // Excluimos la contraseña de la respuesta
    const { password, ...userData } = user;
    return res.json(userData);
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return res.status(500).json({ error: "Error interno al obtener usuario" });
  }
}

module.exports = { login, getCurrentUser };
