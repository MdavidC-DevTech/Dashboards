const pool = require("../config/db");

const getUserByUsername = async (username) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    conn.release();
    // Si no se encuentra, rows será un arreglo vacío.
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    throw err;
  }
};

module.exports = { getUserByUsername };
