const pool = require("../config/db");

const getAllData = async () => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM data_1");
    conn.release();
    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = { getAllData };
