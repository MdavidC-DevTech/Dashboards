// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const fakeUsers = require('../models/fakeUsers');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = fakeUsers[username]; // Busca en fakeUsers

    if (!user) {
      return res.status(401).json({ detail: 'Usuario o contraseña incorrectos' });
    }
    if (password !== user.password) {
      return res.status(401).json({ detail: 'Usuario o contraseña incorrectos' });
    }

    const expiresIn = config.accessTokenExpireMinutes * 60; // en segundos
    // Firma el token con datos mínimos
    const token = jwt.sign(
      { 
        sub: username,
        role: user.role,
        categoryId: user.categoryId
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
