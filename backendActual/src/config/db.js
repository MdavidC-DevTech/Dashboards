// src/models/db.js
const config = require('../config/config').db;
// src/config/db.js
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'analisis',
  password: 'adminanalisis',
  database: 'Analisis',
  connectionLimit: 5
});

module.exports = pool;