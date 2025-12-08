const { pool } = require('../config/database');

// Obtener configuración por clave
exports.obtenerConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM configuracion WHERE clave = ?',
      [clave]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.json({ configuracion: rows[0] });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

// Obtener todas las configuraciones
exports.obtenerTodasConfiguraciones = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion');
    res.json({ configuraciones: rows });
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
};

// Actualizar configuración
exports.actualizarConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;

    if (!valor) {
      return res.status(400).json({ error: 'El valor es requerido' });
    }

    // Verificar si la configuración existe
    const [existing] = await pool.query(
      'SELECT * FROM configuracion WHERE clave = ?',
      [clave]
    );

    if (existing.length === 0) {
      // Crear nueva configuración
      await pool.query(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?)',
        [clave, valor]
      );
    } else {
      // Actualizar configuración existente
      await pool.query(
        'UPDATE configuracion SET valor = ? WHERE clave = ?',
        [valor, clave]
      );
    }

    res.json({ 
      mensaje: 'Configuración actualizada correctamente',
      clave,
      valor
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};
