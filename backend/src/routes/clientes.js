// Rutas de gestión de clientes
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const { manejarErroresValidacion } = require('../middlewares/validacion');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/clientes - Obtener todos los clientes
router.get('/', clientesController.obtenerClientes);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', clientesController.obtenerClientePorId);

// POST /api/clientes - Crear nuevo cliente (admin y cobrador)
router.post(
  '/',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('cedula').notEmpty().withMessage('El DNI es requerido'),
    manejarErroresValidacion
  ],
  clientesController.crearCliente
);

// PUT /api/clientes/:id - Actualizar cliente (admin y cobrador)
router.put('/:id', clientesController.actualizarCliente);

// DELETE /api/clientes/:id - Eliminar cliente (admin y cobrador)
router.delete('/:id', clientesController.eliminarCliente);

module.exports = router;
