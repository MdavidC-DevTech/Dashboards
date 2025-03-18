// src/controllers/dataController.js
const pool = require('../config/db');

async function getDatos(req, res) {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM data_1');
    conn.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la consulta' });
  }
}

// Exporta la función de manera que esté disponible para otras partes del código
module.exports = { getDatos };
