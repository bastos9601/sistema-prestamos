// Middleware de autenticación y autorización
const jwt = require('jsonwebtoken');

// Verificar token JWT
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      mensaje: 'Debe incluir un token de autenticación'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Agregar datos del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      mensaje: 'Por favor inicie sesión nuevamente'
    });
  }
};

// Verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      mensaje: 'Solo los administradores pueden realizar esta acción'
    });
  }
  next();
};

// Verificar rol de cobrador o admin
const verificarCobradorOAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'cobrador') {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      mensaje: 'No tiene permisos para realizar esta acción'
    });
  }
  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarCobradorOAdmin
};
