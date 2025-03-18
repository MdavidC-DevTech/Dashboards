require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./config/config'); // Configuración: puerto, etc.

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');


const app = express();

// 1. Declarar los orígenes permitidos
const allowedOrigins = [
  'https://dashboard1.crazy-shaw.74-208-19-154.plesk.page',
  'http://localhost:3000'
];

// 2. Aplicar CORS con esos orígenes
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 3. Middleware para parsear JSON
app.use(express.json());

// 4. Montar las rutas con subpaths para mayor claridad
app.use('/auth', authRoutes);   // Ejemplo: /auth/token, /auth/users/me, etc.
app.use('/data', dataRoutes);   // Endpoint(s) para datos


// 5. Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('API de Dashboard - Con Login + MariaDB');
});

// 6. Iniciar el servidor en el puerto configurado
const port = process.env.PORT || config.port || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;
