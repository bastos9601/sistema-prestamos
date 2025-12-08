// Middleware para validación de datos
const { validationResult } = require('express-validator');

// Manejar errores de validación
const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  
  if (!errores.isEmpty()) {
    return res.status(400).json({ 
      error: 'Datos inválidos',
      errores: errores.array().map(err => ({
        campo: err.path,
        mensaje: err.msg
      }))
    });
  }
  
  next();
};

module.exports = { manejarErroresValidacion };
