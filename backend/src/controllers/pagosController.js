// Controlador de gestión de pagos
const { pool } = require('../config/database');

// Registrar un pago
const registrarPago = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      cuota_id,
      prestamo_id,
      monto,
      fecha_pago,
      tipo_pago,
      referencia,
      notas
    } = req.body;

    // Verificar que la cuota existe y obtener información
    const [cuotas] = await connection.query(
      'SELECT * FROM cuotas WHERE id = ? AND prestamo_id = ?',
      [cuota_id, prestamo_id]
    );

    if (cuotas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotas[0];
    const montoPendiente = cuota.monto_cuota - cuota.monto_pagado;

    if (monto > montoPendiente) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'El monto excede el saldo pendiente de la cuota',
        monto_pendiente: montoPendiente
      });
    }

    // Registrar el pago
    const [resultadoPago] = await connection.query(
      `INSERT INTO pagos 
       (cuota_id, prestamo_id, cobrador_id, monto, fecha_pago, tipo_pago, referencia, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cuota_id,
        prestamo_id,
        req.usuario.id,
        monto,
        fecha_pago,
        tipo_pago,
        referencia,
        notas
      ]
    );

    // Actualizar monto pagado de la cuota
    const nuevoMontoPagado = parseFloat(cuota.monto_pagado) + parseFloat(monto);
    let nuevoEstado = 'parcial';

    if (nuevoMontoPagado >= cuota.monto_cuota) {
      nuevoEstado = 'pagada';
    }

    await connection.query(
      'UPDATE cuotas SET monto_pagado = ?, estado = ? WHERE id = ?',
      [nuevoMontoPagado, nuevoEstado, cuota_id]
    );

    // Verificar si todas las cuotas están pagadas para actualizar estado del préstamo
    const [cuotasPendientes] = await connection.query(
      'SELECT COUNT(*) as pendientes FROM cuotas WHERE prestamo_id = ? AND estado != ?',
      [prestamo_id, 'pagada']
    );

    if (cuotasPendientes[0].pendientes === 0) {
      await connection.query(
        'UPDATE prestamos SET estado = ? WHERE id = ?',
        ['pagado', prestamo_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      pago: {
        id: resultadoPago.insertId,
        monto,
        fecha_pago,
        saldo_restante: cuota.monto_cuota - nuevoMontoPagado
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  } finally {
    connection.release();
  }
};

// Obtener pagos de un préstamo
const obtenerPagosPorPrestamo = async (req, res) => {
  try {
    const { prestamo_id } = req.params;

    const [pagos] = await pool.query(
      `SELECT p.*, 
              c.numero_cuota,
              u.nombre as cobrador_nombre
       FROM pagos p
       INNER JOIN cuotas c ON p.cuota_id = c.id
       LEFT JOIN usuarios u ON p.cobrador_id = u.id
       WHERE p.prestamo_id = ?
       ORDER BY p.fecha_pago DESC`,
      [prestamo_id]
    );

    res.json({ pagos });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

// Obtener cuotas pendientes de un cliente (para cobrador)
const obtenerCuotasPendientes = async (req, res) => {
  try {
    const { cliente_id } = req.params;

    let query = `
      SELECT c.*, 
             p.monto_prestado,
             p.cliente_id,
             cl.nombre as cliente_nombre,
             cl.apellido as cliente_apellido,
             cl.telefono as cliente_telefono,
             cl.direccion as cliente_direccion
      FROM cuotas c
      INNER JOIN prestamos p ON c.prestamo_id = p.id
      INNER JOIN clientes cl ON p.cliente_id = cl.id
      WHERE c.estado IN ('pendiente', 'vencida', 'parcial')
        AND p.estado = 'activo'
        AND cl.id = ?
    `;

    const params = [cliente_id];

    // Si es cobrador, solo ver sus cuotas asignadas
    if (req.usuario.rol === 'cobrador') {
      query += ' AND p.cobrador_id = ?';
      params.push(req.usuario.id);
    }

    query += ' ORDER BY c.fecha_vencimiento ASC';

    const [cuotas] = await pool.query(query, params);

    res.json({ cuotas });
  } catch (error) {
    console.error('Error al obtener cuotas pendientes:', error);
    res.status(500).json({ error: 'Error al obtener cuotas pendientes' });
  }
};

// Obtener clientes con cuotas pendientes (para cobrador)
const obtenerClientesConCuotasPendientes = async (req, res) => {
  try {
    let query = `
      SELECT DISTINCT cl.id, cl.nombre, cl.apellido, cl.cedula, cl.telefono, cl.direccion,
             COUNT(DISTINCT p.id) as total_prestamos,
             COUNT(c.id) as cuotas_pendientes,
             SUM(c.monto_cuota - c.monto_pagado) as monto_pendiente
      FROM clientes cl
      INNER JOIN prestamos p ON cl.id = p.cliente_id
      INNER JOIN cuotas c ON p.id = c.prestamo_id
      WHERE c.estado IN ('pendiente', 'vencida', 'parcial')
        AND p.estado = 'activo'
    `;

    const params = [];

    // Si es cobrador, solo ver sus clientes asignados
    if (req.usuario.rol === 'cobrador') {
      query += ' AND p.cobrador_id = ?';
      params.push(req.usuario.id);
    }

    query += ' GROUP BY cl.id ORDER BY cl.nombre, cl.apellido';

    const [clientes] = await pool.query(query, params);

    res.json({ clientes });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

module.exports = {
  registrarPago,
  obtenerPagosPorPrestamo,
  obtenerCuotasPendientes,
  obtenerClientesConCuotasPendientes
};
