// src/config/config.js
require('dotenv').config();

module.exports = {
  secretKey: process.env.SECRET_KEY,
  accessTokenExpireMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) || 30,
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  // Puedes agregar más configuraciones aquí
};
