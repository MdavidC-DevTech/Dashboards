require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./config/config'); // Configuración: puerto, etc.

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

const app = express();

// 1. Declarar orígenes permitidos
const allowedOrigins = [
  'https://dashboard1.crazy-shaw.74-208-19-154.plesk.page',
  'http://localhost:3000'
];

// 2. Aplicar CORS global
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));

// 3. Middleware parsear JSON
app.use(express.json());

// 4. Montar rutas
app.use('/auth', authRoutes);
app.use('/data', dataRoutes);

// 5. Ruta de prueba
app.get('/', (req, res) => {
  res.send('Funciona: API de Dashboard - Con Login + MariaDB');
});

// 6. Arrancar
const port = process.env.PORT || config.port || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
// Middleware de manejo de errores
app.use((err, req, res, next) => {
  // Imprime el stack en la consola para depuración
  console.error("Error capturado por middleware:", err.stack);
  
  // Envía una respuesta JSON con detalles (modo desarrollo)
  res.status(500).json({
    error: err.message,
    // Puedes incluir el stack solo si NODE_ENV no es production:
    stack: process.env.NODE_ENV !== 'production' ? err.stack : {}
  });
});

module.exports = app;
