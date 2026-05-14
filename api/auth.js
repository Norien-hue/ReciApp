const jwt = require('jsonwebtoken');

const JWT_SECRET = 'reciapp-secret-key-cambiar-en-produccion';
const JWT_EXPIRES = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.Id_Usuario, nombre: user.Nombre, permisos: user.Permisos },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

module.exports = { generateToken, verifyToken, JWT_SECRET };
