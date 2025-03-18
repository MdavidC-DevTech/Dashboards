// index.js (en la raíz)
require('dotenv').config(); // opcional si quieres cargar .env aquí

// Importa la app que exportaste en /src/index.js
const app = require('./src/index');

// Simplemente exporta la app:
module.exports = app;
