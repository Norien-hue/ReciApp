const { Router } = require('express');
const pool = require('../db');

const router = Router();

// GET /api/health — comprobar conexion
router.get('/', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', error: 'No se pudo conectar a la base de datos' });
  }
});

module.exports = router;
