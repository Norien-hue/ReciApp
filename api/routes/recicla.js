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

// POST /api/historial — registrar un reciclaje
router.post('/', verifyToken, async (req, res) => {
  try {
    const { idUsuario, tipo, numeroBarras } = req.body;

    if (!idUsuario || !tipo || !numeroBarras) {
      return res.status(400).json({ error: 'idUsuario, tipo y numeroBarras son obligatorios' });
    }

    // Verificar que el producto existe
    const [productos] = await pool.query(
      'SELECT * FROM Productos WHERE Tipo = ? AND Numero_barras = ?',
      [tipo, numeroBarras]
    );
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar que el usuario existe
    const [usuarios] = await pool.query(
      'SELECT * FROM Usuarios WHERE Id_Usuario = ?',
      [idUsuario]
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const producto = productos[0];
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];

    // Insertar registro de reciclaje
    await pool.query(
      'INSERT INTO Recicla (Id_Usuario, Tipo, Numero_barras, Fecha, Hora) VALUES (?, ?, ?, ?, ?)',
      [idUsuario, tipo, numeroBarras, fecha, hora]
    );

    // Acumular emisiones reducidas en el usuario
    const emisionesProducto = producto.Emisiones_Reducibles || 0;
    await pool.query(
      'UPDATE Usuarios SET Emisiones_Reducidas = Emisiones_Reducidas + ? WHERE Id_Usuario = ?',
      [emisionesProducto, idUsuario]
    );

    // Obtener emisiones actualizadas del usuario
    const [updatedUser] = await pool.query(
      'SELECT Emisiones_Reducidas FROM Usuarios WHERE Id_Usuario = ?',
      [idUsuario]
    );

    res.status(201).json({
      message: 'Reciclaje registrado correctamente',
      reciclaje: {
        idUsuario,
        tipo,
        numeroBarras: String(numeroBarras),
        fecha,
        hora,
        productoNombre: producto.Nombre,
        productoMaterial: producto.Material,
        emisionesReducibles: producto.Emisiones_Reducibles,
      },
      emisionesAcumuladas: updatedUser[0].Emisiones_Reducidas,
    });
  } catch (err) {
    console.error('Error registrando reciclaje:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
