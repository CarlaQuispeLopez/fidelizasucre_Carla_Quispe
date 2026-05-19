require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estaticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const businessesRoutes = require('./routes/businesses');
const pointsRoutes = require('./routes/points');

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/points', pointsRoutes);

// Ruta de salud del servidor (para verificar que esta corriendo)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FidelizaSucre esta corriendo correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Para todas las rutas que no sean /api, servir la pagina principal
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('=============================================');
  console.log('   FidelizaSucre - Servidor iniciado');
  console.log('=============================================');
  console.log('Puerto: ' + PORT);
  console.log('Entorno: ' + (process.env.NODE_ENV || 'development'));
  console.log('URL local: http://localhost:' + PORT);
  console.log('=============================================');
});

module.exports = app;
