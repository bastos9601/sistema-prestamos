// Controlador de gestión de usuarios
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol, activo, foto_url, creado_en FROM usuarios ORDER BY creado_en DESC'
    );

    res.json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarios] = await pool.query(
      'SELECT id, nombre, email, rol, activo, foto_url, creado_en FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario: usuarios[0] });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;

    // Verificar si el usuario existe
    const [usuarioExiste] = await pool.query(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarioExiste.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Construir query dinámicamente
    let query = 'UPDATE usuarios SET ';
    const valores = [];
    const campos = [];

    if (nombre) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (email) {
      campos.push('email = ?');
      valores.push(email);
    }
    if (rol) {
      campos.push('rol = ?');
      valores.push(rol);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      campos.push('password = ?');
      valores.push(passwordHash);
    }
    if (req.body.foto_url !== undefined) {
      campos.push('foto_url = ?');
      valores.push(req.body.foto_url);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    query += campos.join(', ') + ' WHERE id = ?';
    valores.push(id);

    await pool.query(query, valores);

    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ 
        error: 'No puede eliminar su propio usuario' 
      });
    }

    const [resultado] = await pool.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Obtener cobradores activos
const obtenerCobradores = async (req, res) => {
  try {
    const [cobradores] = await pool.query(
      'SELECT id, nombre, email, foto_url FROM usuarios WHERE rol = ? AND activo = TRUE',
      ['cobrador']
    );

    res.json({ cobradores });
  } catch (error) {
    console.error('Error al obtener cobradores:', error);
    res.status(500).json({ error: 'Error al obtener cobradores' });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  obtenerCobradores
};
