// Rutas de gestión de pagos
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { verificarToken, verificarCobradorOAdmin } = require('../middlewares/auth');
const { manejarErroresValidacion } = require('../middlewares/validacion');

// Todas las rutas requieren autenticación
router.use(verificarToken, verificarCobradorOAdmin);

// POST /api/pagos - Registrar un pago
router.post(
  '/',
  [
    body('cuota_id').isInt().withMessage('ID de cuota inválido'),
    body('prestamo_id').isInt().withMessage('ID de préstamo inválido'),
    body('monto').isFloat({ min: 0 }).withMessage('Monto inválido'),
    body('fecha_pago').isDate().withMessage('Fecha de pago inválida'),
    body('tipo_pago').isIn(['efectivo', 'transferencia', 'cheque', 'otro']).withMessage('Tipo de pago inválido'),
    manejarErroresValidacion
  ],
  pagosController.registrarPago
);

// GET /api/pagos/prestamo/:prestamo_id - Obtener pagos de un préstamo
router.get('/prestamo/:prestamo_id', pagosController.obtenerPagosPorPrestamo);

// GET /api/pagos/cuotas-pendientes/:cliente_id - Obtener cuotas pendientes de un cliente
router.get('/cuotas-pendientes/:cliente_id', pagosController.obtenerCuotasPendientes);

// GET /api/pagos/clientes-pendientes - Obtener clientes con cuotas pendientes
router.get('/clientes-pendientes', pagosController.obtenerClientesConCuotasPendientes);

module.exports = router;
