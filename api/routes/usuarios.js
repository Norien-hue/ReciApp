const { Router } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { generateToken, verifyToken } = require('../auth');

const router = Router();
const SALT_ROUNDS = 10;

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
      return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
    }

    // Comprobar si el nombre ya existe
    const [existing] = await pool.query(
      'SELECT Id_Usuario FROM Usuarios WHERE Nombre = ?',
      [nombre]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO Usuarios (Nombre, Hash_Contraseña, Permisos, Emisiones_Reducidas) VALUES (?, ?, ?, ?)',
      [nombre, hash, 'cliente', 0]
    );

    const user = {
      id: result.insertId,
      nombre,
      permisos: 'cliente',
      emisionesReducidas: 0,
      tap: null,
    };

    const token = generateToken({ Id_Usuario: user.id, Nombre: nombre, Permisos: 'cliente' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
      return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM Usuarios WHERE Nombre = ?',
      [nombre]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const dbUser = rows[0];
    const match = await bcrypt.compare(password, dbUser.Hash_Contraseña);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = {
      id: dbUser.Id_Usuario,
      nombre: dbUser.Nombre,
      permisos: dbUser.Permisos,
      emisionesReducidas: dbUser.Emisiones_Reducidas || 0,
      tap: dbUser.TAP,
    };

    const token = generateToken(dbUser);
    res.json({ token, user });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/profile/:id
router.get('/profile/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT Id_Usuario, Nombre, Permisos, Emisiones_Reducidas, TAP FROM Usuarios WHERE Id_Usuario = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const u = rows[0];
    res.json({
      id: u.Id_Usuario,
      nombre: u.Nombre,
      permisos: u.Permisos,
      emisionesReducidas: u.Emisiones_Reducidas || 0,
      tap: u.TAP,
    });
  } catch (err) {
    console.error('Error obteniendo perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/usuarios/:id/nombre
router.put('/:id/nombre', verifyToken, async (req, res) => {
  try {
    const { nuevoNombre, passwordActual } = req.body;
    if (!nuevoNombre || !passwordActual) {
      return res.status(400).json({ error: 'Nuevo nombre y contraseña actual son obligatorios' });
    }

    // Verificar contraseña actual
    const [rows] = await pool.query(
      'SELECT * FROM Usuarios WHERE Id_Usuario = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(passwordActual, rows[0].Hash_Contraseña);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Comprobar que el nuevo nombre no exista
    const [existing] = await pool.query(
      'SELECT Id_Usuario FROM Usuarios WHERE Nombre = ? AND Id_Usuario != ?',
      [nuevoNombre, req.params.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    }

    await pool.query(
      'UPDATE Usuarios SET Nombre = ? WHERE Id_Usuario = ?',
      [nuevoNombre, req.params.id]
    );

    const u = rows[0];
    res.json({
      id: u.Id_Usuario,
      nombre: nuevoNombre,
      permisos: u.Permisos,
      emisionesReducidas: u.Emisiones_Reducidas || 0,
      tap: u.TAP,
    });
  } catch (err) {
    console.error('Error actualizando nombre:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/usuarios/:id/password
router.put('/:id/password', verifyToken, async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
    }
    if (passwordNueva.length < 4) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM Usuarios WHERE Id_Usuario = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(passwordActual, rows[0].Hash_Contraseña);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const hash = await bcrypt.hash(passwordNueva, SALT_ROUNDS);
    await pool.query(
      'UPDATE Usuarios SET Hash_Contraseña = ? WHERE Id_Usuario = ?',
      [hash, req.params.id]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error actualizando contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Contraseña obligatoria para eliminar cuenta' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM Usuarios WHERE Id_Usuario = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, rows[0].Hash_Contraseña);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // ON DELETE CASCADE borra tambien sus registros de Recicla
    await pool.query('DELETE FROM Usuarios WHERE Id_Usuario = ?', [req.params.id]);
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    console.error('Error eliminando cuenta:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
