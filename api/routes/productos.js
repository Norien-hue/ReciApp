const { Router } = require('express');
const pool = require('../db');
const { verifyToken } = require('../auth');

const router = Router();

// GET /api/productos — lista todos (con conteo de veces reciclado por el usuario)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.Tipo, p.Numero_barras, p.Nombre, p.Emisiones_Reducibles,
              p.Material, p.Imagen,
              COUNT(r.Id_Usuario) AS vecesReciclado
       FROM Productos p
       LEFT JOIN Recicla r ON p.Tipo = r.Tipo
         AND p.Numero_barras = r.Numero_barras
         AND r.Id_Usuario = ?
       GROUP BY p.Tipo, p.Numero_barras`,
      [userId]
    );

    const productos = rows.map((r) => ({
      tipo: r.Tipo,
      numeroBarras: String(r.Numero_barras),
      nombre: r.Nombre,
      emisionesReducibles: r.Emisiones_Reducibles,
      material: r.Material,
      imagen: r.Imagen,
      vecesReciclado: r.vecesReciclado,
    }));

    res.json(productos);
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/productos/search?q=texto
router.get('/search', verifyToken, async (req, res) => {
  try {
    const q = req.query.q || '';
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.Tipo, p.Numero_barras, p.Nombre, p.Emisiones_Reducibles,
              p.Material, p.Imagen,
              COUNT(r.Id_Usuario) AS vecesReciclado
       FROM Productos p
       LEFT JOIN Recicla r ON p.Tipo = r.Tipo
         AND p.Numero_barras = r.Numero_barras
         AND r.Id_Usuario = ?
       WHERE p.Nombre LIKE ? OR CAST(p.Numero_barras AS CHAR) LIKE ?
       GROUP BY p.Tipo, p.Numero_barras`,
      [userId, `%${q}%`, `%${q}%`]
    );

    const productos = rows.map((r) => ({
      tipo: r.Tipo,
      numeroBarras: String(r.Numero_barras),
      nombre: r.Nombre,
      emisionesReducibles: r.Emisiones_Reducibles,
      material: r.Material,
      imagen: r.Imagen,
      vecesReciclado: r.vecesReciclado,
    }));

    res.json(productos);
  } catch (err) {
    console.error('Error buscando productos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/productos/barcode/:barras — buscar producto solo por numero de barras
router.get('/barcode/:barras', verifyToken, async (req, res) => {
  try {
    const { barras } = req.params;
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.Tipo, p.Numero_barras, p.Nombre, p.Emisiones_Reducibles,
              p.Material, p.Imagen,
              COUNT(r.Id_Usuario) AS vecesReciclado
       FROM Productos p
       LEFT JOIN Recicla r ON p.Tipo = r.Tipo
         AND p.Numero_barras = r.Numero_barras
         AND r.Id_Usuario = ?
       WHERE p.Numero_barras = ?
       GROUP BY p.Tipo, p.Numero_barras`,
      [userId, barras]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const r = rows[0];
    res.json({
      tipo: r.Tipo,
      numeroBarras: String(r.Numero_barras),
      nombre: r.Nombre,
      emisionesReducibles: r.Emisiones_Reducibles,
      material: r.Material,
      imagen: r.Imagen,
      vecesReciclado: r.vecesReciclado,
    });
  } catch (err) {
    console.error('Error buscando producto por barras:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/productos/:tipo/:barras — detalle de un producto
router.get('/:tipo/:barras', verifyToken, async (req, res) => {
  try {
    const { tipo, barras } = req.params;
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.Tipo, p.Numero_barras, p.Nombre, p.Emisiones_Reducibles,
              p.Material, p.Imagen,
              COUNT(r.Id_Usuario) AS vecesReciclado
       FROM Productos p
       LEFT JOIN Recicla r ON p.Tipo = r.Tipo
         AND p.Numero_barras = r.Numero_barras
         AND r.Id_Usuario = ?
       WHERE p.Tipo = ? AND p.Numero_barras = ?
       GROUP BY p.Tipo, p.Numero_barras`,
      [userId, tipo, barras]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const r = rows[0];
    res.json({
      tipo: r.Tipo,
      numeroBarras: String(r.Numero_barras),
      nombre: r.Nombre,
      emisionesReducibles: r.Emisiones_Reducibles,
      material: r.Material,
      imagen: r.Imagen,
      vecesReciclado: r.vecesReciclado,
    });
  } catch (err) {
    console.error('Error obteniendo producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
