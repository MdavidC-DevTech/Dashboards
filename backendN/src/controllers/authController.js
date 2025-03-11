// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { fakeUsersDb } = require('../models/fakeUsers'); // Puedes tener una simulación similar
const fakeUsers = require('../models/fakeUsers'); 

// Función para autenticar usuario
async function login(req, res) {
  const { username, password } = req.body;
  // Aquí buscas el usuario en la base de datos o en tu objeto de usuarios simulados
  const user = fakeUsersDb[username];
  if (!user) {
    return res.status(401).json({ detail: "Nombre de usuario o contraseña incorrectos" });
  }
  const validPassword = bcrypt.compareSync(password, user.hashed_password);
  if (!validPassword) {
    return res.status(401).json({ detail: "Nombre de usuario o contraseña incorrectos" });
  }
  // Crear token
  const expiresIn = config.accessTokenExpireMinutes * 60; // en segundos
  const token = jwt.sign({ sub: user.username }, config.secretKey, { expiresIn });
  res.json({ access_token: token, token_type: "bearer" });
}

module.exports = { login };
