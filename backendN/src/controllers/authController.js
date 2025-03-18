// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const fakeUsers = require('../models/fakeUsers');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = fakeUsers[username]; // user = { username, password, role, categoryId, ... }

    if (!user) {
      return res.status(401).json({ detail: 'Usuario o contraseña incorrectos' });
    }
    if (password !== user.password) {
      return res.status(401).json({ detail: 'Usuario o contraseña incorrectos' });
    }

    const expiresIn = config.accessTokenExpireMinutes * 60; // en segundos
    // dentro user tienes user.role, user.categoryId, etc.
    const token = jwt.sign(
      { 
        sub: username,  // o user.id si tu fakeUsers tiene un 'id' numérico
        role: user.role,
        categoryId: user.categoryId,
      },
      config.secretKey,
      { expiresIn }
    );

    res.json({ 
      access_token: token,
      token_type: 'bearer'
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno en login' });
  }
}

module.exports = { login };
