const { Router } = require('express');
const pool = require('../db');
const { verifyToken } = require('../auth');

const router = Router();

// GET /api/historial/:idUsuario
router.get('/:idUsuario', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.Id_Usuario, r.Tipo, CAST(r.Numero_barras AS CHAR) AS Numero_barras,
              r.Fecha, r.Hora,
              p.Nombre AS productoNombre,
              p.Material AS productoMaterial,
              p.Emisiones_Reducibles AS emisionesReducibles
       FROM Recicla r
       JOIN Productos p ON r.Tipo = p.Tipo AND r.Numero_barras = p.Numero_barras
       WHERE r.Id_Usuario = ?
       ORDER BY r.Fecha DESC, r.Hora DESC`,
      [req.params.idUsuario]
    );

    const historial = rows.map((r) => ({
      idUsuario: r.Id_Usuario,
      tipo: r.Tipo,
      numeroBarras: r.Numero_barras,
      fecha: r.Fecha instanceof Date
        ? r.Fecha.toISOString().split('T')[0]
        : String(r.Fecha),
      hora: r.Hora,
      productoNombre: r.productoNombre,
      productoMaterial: r.productoMaterial,
      emisionesReducibles: r.emisionesReducibles,
    }));

    res.json(historial);
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
