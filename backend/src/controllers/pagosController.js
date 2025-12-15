// Controlador de gestión de pagos
const { pool } = require('../config/database');

// Registrar un pago
const registrarPago = async (req, res) => {
  // Transacciones PostgreSQL se manejan diferente
  
  try {
    await pool.query("BEGIN");

    const {
      cuota_id,
      prestamo_id,
      monto,
      fecha_pago,
      tipo_pago,
      referencia,
      notas
    } = req.body;

    // Verificar que la cuota existe y obtener información del préstamo
    const cuotas = await pool.query(
      `SELECT c.*, p.cliente_id 
       FROM cuotas c
       INNER JOIN prestamos p ON c.prestamo_id = p.id
       WHERE c.id = $1 AND c.prestamo_id = $2`,
      [cuota_id, prestamo_id]
    );

    if (cuotas.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotas.rows[0];
    const montoPendiente = cuota.monto - cuota.monto_pagado;

    if (monto > montoPendiente) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ 
        error: 'El monto excede el saldo pendiente de la cuota',
        monto_pendiente: montoPendiente
      });
    }

    // Registrar el pago
    const resultadoPago = await pool.query(
      `INSERT INTO pagos 
       (cuota_id, prestamo_id, cliente_id, cobrador_id, monto, fecha_pago, metodo_pago, referencia, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        cuota_id,
        prestamo_id,
        cuota.cliente_id,
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
    const montoCuota = parseFloat(cuota.monto);
    let nuevoEstado = 'pendiente';

    // Comparar con un pequeño margen de error para evitar problemas de precisión decimal
    if (nuevoMontoPagado >= montoCuota - 0.01) {
      nuevoEstado = 'pagada';
    }

    console.log(`Actualizando cuota ${cuota_id}: monto_pagado=${nuevoMontoPagado}, estado=${nuevoEstado}`);

    await pool.query(
      'UPDATE cuotas SET monto_pagado = $1, estado = $2 WHERE id = $3',
      [nuevoMontoPagado, nuevoEstado, cuota_id]
    );

    // Verificar si todas las cuotas están pagadas para actualizar estado del préstamo
    const cuotasPendientes = await pool.query(
      `SELECT COUNT(*) as pendientes 
       FROM cuotas 
       WHERE prestamo_id = $1 AND estado != 'pagada'`,
      [prestamo_id]
    );

    const totalPendientes = parseInt(cuotasPendientes.rows[0].pendientes);
    console.log(`Préstamo ${prestamo_id}: cuotas pendientes = ${totalPendientes}`);

    if (totalPendientes === 0) {
      console.log(`Actualizando préstamo ${prestamo_id} a estado "completado"`);
      await pool.query(
        'UPDATE prestamos SET estado = $1 WHERE id = $2',
        ['completado', prestamo_id]
      );
    }

    await pool.query("COMMIT");

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      pago: {
        id: resultadoPago.rows[0].id,
        monto,
        fecha_pago,
        saldo_restante: cuota.monto - nuevoMontoPagado
      }
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  } finally {
    // No necesario en PostgreSQL con pool.query
  }
};

// Obtener pagos de un préstamo
const obtenerPagosPorPrestamo = async (req, res) => {
  try {
    const { prestamo_id } = req.params;

    const resultado = await pool.query(
      `SELECT p.*, 
              c.numero_cuota,
              u.nombre as cobrador_nombre
       FROM pagos p
       INNER JOIN cuotas c ON p.cuota_id = c.id
       LEFT JOIN usuarios u ON p.cobrador_id = u.id
       WHERE p.prestamo_id = $1
       ORDER BY p.fecha_pago DESC`,
      [prestamo_id]
    );

    res.json({ pagos: resultado.rows });
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
             c.monto as monto_cuota,
             p.monto_prestado,
             p.cliente_id,
             cl.nombre as cliente_nombre,
             cl.apellido as cliente_apellido,
             cl.telefono as cliente_telefono,
             cl.direccion as cliente_direccion
      FROM cuotas c
      INNER JOIN prestamos p ON c.prestamo_id = p.id
      INNER JOIN clientes cl ON p.cliente_id = cl.id
      WHERE c.estado IN ('pendiente', 'vencida')
        AND p.estado = 'activo'
        AND cl.id = $1
    `;

    const params = [cliente_id];

    // Si es cobrador, solo ver sus cuotas asignadas
    if (req.usuario.rol === 'cobrador') {
      query += ' AND p.cobrador_id = $2';
      params.push(req.usuario.id);
    }

    query += ' ORDER BY c.fecha_vencimiento ASC';

    const resultado = await pool.query(query, params);

    res.json({ cuotas: resultado.rows });
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
             SUM(c.monto - c.monto_pagado) as monto_pendiente
      FROM clientes cl
      INNER JOIN prestamos p ON cl.id = p.cliente_id
      INNER JOIN cuotas c ON p.id = c.prestamo_id
      WHERE c.estado IN ('pendiente', 'vencida')
        AND p.estado = 'activo'
    `;

    const params = [];

    // Si es cobrador, solo ver sus clientes asignados
    if (req.usuario.rol === 'cobrador') {
      query += ' AND p.cobrador_id = $1';
      params.push(req.usuario.id);
    }

    query += ' GROUP BY cl.id ORDER BY cl.nombre, cl.apellido';

    const resultado = await pool.query(query, params);

    res.json({ clientes: resultado.rows });
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
