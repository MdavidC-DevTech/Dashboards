// src/controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function updateUserFields(req, res) {
  try {
    // Se espera que en el body se envíen: username, password y categoryId
    const { username, password, categoryId } = req.body;
    if (!username || !password || !categoryId) {
      return res.status(400).json({ error: "Faltan datos: username, password y categoryId son requeridos" });
    }
    // Generamos el hash de la contraseña (10 rondas)
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Actualizamos los campos contrasenaDashboard y categoryId en la tabla eva_user
    const sql = "UPDATE eva_user SET contrasenaDashboard = ?, categoryId = ? WHERE username = ?";
    const [result] = await pool.query(sql, [hashedPassword, categoryId, username]);

    res.json({ message: "Usuario actualizado", result });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { updateUserFields };
