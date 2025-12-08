const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');

// Obtener todas las configuraciones (público para login)
router.get('/', configuracionController.obtenerTodasConfiguraciones);

// Obtener configuración por clave (público para login)
router.get('/:clave', configuracionController.obtenerConfiguracion);

// Actualizar configuración (solo admin)
router.put('/:clave', verificarToken, verificarAdmin, configuracionController.actualizarConfiguracion);

module.exports = router;
