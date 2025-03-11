// Ejemplo en src/controllers/dataController.js
const pool = require('../config/db');

async function getData(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM data_1');
    // Aquí podrías aplicar transformaciones a los datos, como lo hacías con pandas
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { getData };
