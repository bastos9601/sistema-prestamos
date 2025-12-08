// Controlador de gestión de clientes
const { pool } = require('../config/database');

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    let query = 'SELECT * FROM clientes WHERE activo = TRUE';
    const params = [];

    // Si es cobrador, solo ver sus propios clientes
    if (req.usuario.rol === 'cobrador') {
      query += ' AND creado_por = ?';
      params.push(req.usuario.id);
    }

    query += ' ORDER BY nombre, apellido';

    const [clientes] = await pool.query(query, params);

    res.json({ clientes });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [clientes] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [id]
    );

    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ cliente: clientes[0] });
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
    const [clienteExiste] = await pool.query(
      'SELECT id FROM clientes WHERE cedula = ?',
      [cedula]
    );

    if (clienteExiste.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un cliente con esta cédula' 
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO clientes (nombre, apellido, cedula, telefono, direccion, email, foto_url, creado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, cedula, telefono, direccion, email, foto_url, req.usuario.id]
    );

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: {
        id: resultado.insertId,
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

    const [clienteExiste] = await pool.query(
      'SELECT id, creado_por FROM clientes WHERE id = ?',
      [id]
    );

    if (clienteExiste.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si es cobrador, verificar que sea su cliente
    if (req.usuario.rol === 'cobrador' && clienteExiste[0].creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No tiene permisos para editar este cliente' });
    }

    // Construir query dinámicamente
    let query = 'UPDATE clientes SET ';
    const valores = [];
    const campos = [];

    if (nombre) {
      campos.push('nombre = ?');
      valores.push(nombre);
    }
    if (apellido) {
      campos.push('apellido = ?');
      valores.push(apellido);
    }
    if (cedula) {
      campos.push('cedula = ?');
      valores.push(cedula);
    }
    if (telefono !== undefined) {
      campos.push('telefono = ?');
      valores.push(telefono);
    }
    if (direccion !== undefined) {
      campos.push('direccion = ?');
      valores.push(direccion);
    }
    if (email !== undefined) {
      campos.push('email = ?');
      valores.push(email);
    }
    if (foto_url !== undefined) {
      campos.push('foto_url = ?');
      valores.push(foto_url);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    query += campos.join(', ') + ' WHERE id = ?';
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
    const [clienteExiste] = await pool.query(
      'SELECT id, creado_por FROM clientes WHERE id = ?',
      [id]
    );

    if (clienteExiste.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Si es cobrador, verificar que sea su cliente
    if (req.usuario.rol === 'cobrador' && clienteExiste[0].creado_por !== req.usuario.id) {
      return res.status(403).json({ error: 'No tiene permisos para eliminar este cliente' });
    }

    const [resultado] = await pool.query(
      'UPDATE clientes SET activo = FALSE WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};
