// Rutas de gestión de préstamos
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const prestamosController = require('../controllers/prestamosController');
const { verificarToken, verificarAdmin, verificarCobradorOAdmin } = require('../middlewares/auth');
const { manejarErroresValidacion } = require('../middlewares/validacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/prestamos - Obtener todos los préstamos
router.get('/', verificarCobradorOAdmin, prestamosController.obtenerPrestamos);

// GET /api/prestamos/reportes - Obtener reportes (solo admin)
router.get('/reportes', verificarAdmin, prestamosController.obtenerReportes);

// GET /api/prestamos/:id - Obtener préstamo por ID
router.get('/:id', verificarCobradorOAdmin, prestamosController.obtenerPrestamoPorId);

// POST /api/prestamos - Crear nuevo préstamo (admin y cobrador)
router.post(
  '/',
  verificarCobradorOAdmin,
  [
    body('cliente_id').isInt().withMessage('ID de cliente inválido'),
    body('monto_prestado').isFloat({ min: 0 }).withMessage('Monto inválido'),
    body('tasa_interes').isFloat({ min: 0 }).withMessage('Tasa de interés inválida'),
    body('numero_cuotas').isInt({ min: 1 }).withMessage('Número de cuotas inválido'),
    body('frecuencia_pago').isIn(['diario', 'semanal', 'quincenal', 'mensual']).withMessage('Frecuencia inválida'),
    body('fecha_inicio').isDate().withMessage('Fecha de inicio inválida'),
    manejarErroresValidacion
  ],
  prestamosController.crearPrestamo
);

// PUT /api/prestamos/:id - Actualizar préstamo (solo admin)
router.put('/:id', verificarAdmin, prestamosController.actualizarPrestamo);

// DELETE /api/prestamos/:id - Eliminar préstamo (solo admin)
router.delete('/:id', verificarAdmin, prestamosController.eliminarPrestamo);

module.exports = router;
