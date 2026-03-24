const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const reciclaRoutes = require('./routes/recicla');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 50mb para imagenes base64

// Rutas
app.use('/api/health', healthRoutes);
app.use('/api/usuarios', usuariosRoutes); // /api/usuarios/login, /register, /profile/:id, /:id/*
app.use('/api/productos', productosRoutes);
app.use('/api/historial', reciclaRoutes);

// Ruta raiz
app.get('/', (_req, res) => {
  res.json({ name: 'ReciApp API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`ReciApp API corriendo en http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
