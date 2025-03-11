// src/index.js
const express = require('express');
const cors = require('cors');
const config = require('./config/config');

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS: asegúrate de incluir los orígenes que usará tu frontend
const allowedOrigins = [
  'https://dashboard1.crazy-shaw.74-208-19-154.plesk.page',
  'http://localhost:3000'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Montar rutas
app.use('/', authRoutes);  // La ruta /token se definirá en authRoutes
app.use('/', dataRoutes);  // La ruta /datos se definirá en dataRoutes

// Ruta raíz para pruebas
app.get('/', (req, res) => {
  res.send('API de Dashboard - Con Login + MariaDB');
});

// Inicia el servidor
app.listen(config.port, () => {
  console.log(`Servidor corriendo en el puerto ${config.port}`);
});
