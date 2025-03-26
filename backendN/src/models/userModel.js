// src/models/userModel.js
const pool = require("../config/db");

const getUserByUsername = async (username) => {
  try {
    const conn = await pool.getConnection();
    // Nota: Asegúrate de que el campo 'username' en la tabla eva_user tenga el correo o dato que uses para loguear.
    const [rows] = await conn.query("SELECT * FROM eva_user WHERE username = ?", [username]);
    conn.release();
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    throw err;
  }
};

module.exports = { getUserByUsername };
