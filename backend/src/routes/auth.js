// Rutas de autenticación
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');
const { manejarErroresValidacion } = require('../middlewares/validacion');

// POST /api/auth/registro - Registrar nuevo usuario
router.post(
  '/registro',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol').optional().isIn(['admin', 'cobrador']).withMessage('Rol inválido'),
    manejarErroresValidacion
  ],
  authController.registrarUsuario
);

// POST /api/auth/login - Iniciar sesión
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    manejarErroresValidacion
  ],
  authController.login
);

// GET /api/auth/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, authController.obtenerPerfil);

module.exports = router;
