// src/models/dbTest.js
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'tu-host-de-la-nueva-db',   // por ejemplo "localhost" o una IP
  port: 3306,                       // puerto (si no es el default)
  user: 'select_user',
  password: '96u$k9lI2',
  database: 'nombre_de_tu_nueva_db',  // la base de datos donde está tu tabla
  connectionLimit: 5
});

module.exports = pool;
