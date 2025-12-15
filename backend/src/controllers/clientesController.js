// Controlador de gestión de clientes
const { pool } = require('../config/database');

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    let query = 'SELECT * FROM clientes WHERE activo = TRUE';
    const params = [];

    // Si es cobrador, solo ver sus propios clientes
    if (req.usuario.rol === 'cobrador') {
      query += ' AND creado_por = $1';
      params.push(req.usuario.id);
    }

    query += ' ORDER BY nombre, apellido';

    const resultado = await pool.query(query, params);

    res.json({ clientes: resultado.rows });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const clientes = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );

    if (clientes.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ cliente: clientes.rows[0] });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Crear nuevo cliente
const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, cedula, telefono, direccion, email, foto_url } = req.body;

    // Verificar si la cédula ya existe
    const clienteExiste = await pool.query(
      'SELECT id FROM clientes WHERE cedula = $1',
      [cedula]
    );

    if (clienteExiste.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un cliente con esta cédula' 
      });
    }

    const resultado = await pool.query(
      'INSERT INTO clientes (nombre, apellido, cedula, telefono, direccion, email, foto_url, creado_por) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [nombre, apellido, cedula, telefono, direccion, email, foto_url, req.usuario.id]
    );

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: {
        id: resultado.rows[0].id,
        nombre,
        apellido,
        cedula,
        foto_url
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, cedula, telefono, direccion, email, foto_url, activo } = req.body;

    const clienteExiste = await pool.query(
      'SELECT id, creado_por FROM clientes WHERE id = $1',
      [id]
    );

    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si es cobrador, verificar que sea su cliente
    if (req.usuario.rol === 'cobrador' && clienteExiste.rows[0].creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No tiene permisos para editar este cliente' });
    }

    // Construir query dinámicamente
    let query = 'UPDATE clientes SET ';
    const valores = [];
    const campos = [];
    let paramCounter = 1;

    if (nombre) {
      campos.push(`nombre = $${paramCounter++}`);
      valores.push(nombre);
    }
    if (apellido) {
      campos.push(`apellido = $${paramCounter++}`);
      valores.push(apellido);
    }
    if (cedula) {
      campos.push(`cedula = $${paramCounter++}`);
      valores.push(cedula);
    }
    if (telefono !== undefined) {
      campos.push(`telefono = $${paramCounter++}`);
      valores.push(telefono);
    }
    if (direccion !== undefined) {
      campos.push(`direccion = $${paramCounter++}`);
      valores.push(direccion);
    }
    if (email !== undefined) {
      campos.push(`email = $${paramCounter++}`);
      valores.push(email);
    }
    if (foto_url !== undefined) {
      campos.push(`foto_url = $${paramCounter++}`);
      valores.push(foto_url);
    }
    if (activo !== undefined) {
      campos.push(`activo = $${paramCounter++}`);
      valores.push(activo);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    query += campos.join(', ') + ` WHERE id = $${paramCounter}`;
    valores.push(id);

    await pool.query(query, valores);

    res.json({ mensaje: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Eliminar cliente (soft delete)
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el cliente existe y obtener creado_por
    const clienteExiste = await pool.query(
      'SELECT id, creado_por FROM clientes WHERE id = $1',
      [id]
    );

    if (clienteExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si es cobrador, verificar que sea su cliente
    if (req.usuario.rol === 'cobrador' && clienteExiste.rows[0].creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No tiene permisos para eliminar este cliente' });
    }

    // Verificar si el cliente tiene préstamos activos
    const prestamosActivos = await pool.query(
      'SELECT COUNT(*) as total FROM prestamos WHERE cliente_id = $1 AND estado = $2',
      [id, 'activo']
    );

    if (parseInt(prestamosActivos.rows[0].total) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene préstamos activos. Primero debe completar o cancelar los préstamos.' 
      });
    }

    // Eliminar físicamente el cliente (CASCADE eliminará préstamos completados, cuotas y pagos)
    const resultado = await pool.query(
      'DELETE FROM clientes WHERE id = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Obtener estadísticas del cobrador
const obtenerEstadisticasCobrador = async (req, res) => {
  try {
    // Total de clientes creados por el cobrador
    const totalClientes = await pool.query(
      'SELECT COUNT(*) as total FROM clientes WHERE creado_por = $1 AND activo = TRUE',
      [req.usuario.id]
    );

    // Total de préstamos asignados al cobrador
    const totalPrestamos = await pool.query(
      'SELECT COUNT(*) as total FROM prestamos WHERE cobrador_id = $1',
      [req.usuario.id]
    );

    // Estadísticas financieras del cobrador (solo préstamos que él creó)
    const estadisticasFinancieras = await pool.query(
      `SELECT 
        SUM(monto_prestado) as total_prestado,
        SUM(monto_total) as total_con_interes,
        SUM(monto_total - monto_prestado) as ganancia_estimada
       FROM prestamos 
       WHERE creado_por = $1 AND estado IN ('activo', 'completado')`,
      [req.usuario.id]
    );

    res.json({
      total_clientes: parseInt(totalClientes.rows[0].total),
      total_prestamos: parseInt(totalPrestamos.rows[0].total),
      total_prestado: parseFloat(estadisticasFinancieras.rows[0].total_prestado) || 0,
      total_con_interes: parseFloat(estadisticasFinancieras.rows[0].total_con_interes) || 0,
      ganancia_estimada: parseFloat(estadisticasFinancieras.rows[0].ganancia_estimada) || 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  obtenerEstadisticasCobrador
};
