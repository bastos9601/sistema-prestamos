// Rutas de gestión de usuarios
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken, verificarAdmin, verificarCobradorOAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/usuarios/cobradores - Obtener solo cobradores activos (admin y cobrador)
router.get('/cobradores', verificarCobradorOAdmin, usuariosController.obtenerCobradores);

// Las siguientes rutas requieren rol de admin
router.use(verificarAdmin);

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', usuariosController.obtenerUsuarios);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', usuariosController.obtenerUsuarioPorId);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', usuariosController.actualizarUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;
