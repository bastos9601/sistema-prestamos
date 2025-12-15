// Controlador de gestión de préstamos
const { pool } = require('../config/database');

// Obtener todos los préstamos (admin) o préstamos asignados (cobrador)
const obtenerPrestamos = async (req, res) => {
  try {
    let query = `
      SELECT p.*, 
             c.nombre as cliente_nombre, 
             c.apellido as cliente_apellido,
             c.cedula as cliente_cedula,
             c.foto_url as cliente_foto_url,
             u.nombre as cobrador_nombre
      FROM prestamos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN usuarios u ON p.cobrador_id = u.id
    `;

    const params = [];

    // Si es cobrador, solo ver sus préstamos asignados
    if (req.usuario.rol === 'cobrador') {
      query += ' WHERE p.cobrador_id = $1';
      params.push(req.usuario.id);
    }

    query += ' ORDER BY p.creado_en DESC';

    const resultado = await pool.query(query, params);

    res.json({ prestamos: resultado.rows });
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({ error: 'Error al obtener préstamos' });
  }
};

// Obtener préstamo por ID con detalles de cuotas
const obtenerPrestamoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener préstamo
    const prestamos = await pool.query(
      `SELECT p.*, 
              p.interes_porcentaje as tasa_interes,
              c.nombre as cliente_nombre, 
              c.apellido as cliente_apellido,
              c.cedula as cliente_cedula,
              c.telefono as cliente_telefono,
              c.foto_url as cliente_foto_url,
              u.nombre as cobrador_nombre
       FROM prestamos p
       INNER JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN usuarios u ON p.cobrador_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (prestamos.rows.length === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    const prestamo = prestamos.rows[0];

    // Verificar permisos si es cobrador
    if (req.usuario.rol === 'cobrador' && prestamo.cobrador_id !== req.usuario.id) {
      return res.status(403).json({ 
        error: 'No tiene permisos para ver este préstamo' 
      });
    }

    // Obtener cuotas del préstamo
    const resultadoCuotas = await pool.query(
      'SELECT *, monto as monto_cuota FROM cuotas WHERE prestamo_id = $1 ORDER BY numero_cuota',
      [id]
    );

    res.json({ 
      prestamo,
      cuotas: resultadoCuotas.rows
    });
  } catch (error) {
    console.error('Error al obtener préstamo:', error);
    res.status(500).json({ error: 'Error al obtener préstamo' });
  }
};

// Crear nuevo préstamo
const crearPrestamo = async (req, res) => {
  // Transacciones PostgreSQL se manejan diferente
  
  try {
    await pool.query("BEGIN");

    let {
      cliente_id,
      cobrador_id,
      monto_prestado,
      tasa_interes,
      numero_cuotas,
      frecuencia_pago,
      fecha_inicio,
      notas,
      firma_cliente
    } = req.body;

    // Si es cobrador, asignarse automáticamente
    if (req.usuario.rol === 'cobrador') {
      cobrador_id = req.usuario.id;
    }

    // Calcular monto total con interés
    const interes = (monto_prestado * tasa_interes) / 100;
    const monto_total = parseFloat(monto_prestado) + interes;
    const monto_cuota = monto_total / numero_cuotas;

    // Calcular fecha de fin según frecuencia
    const fechaInicio = new Date(fecha_inicio);
    let diasPorCuota = 30; // mensual por defecto

    switch (frecuencia_pago) {
      case 'diario':
        diasPorCuota = 1;
        break;
      case 'semanal':
        diasPorCuota = 7;
        break;
      case 'quincenal':
        diasPorCuota = 15;
        break;
      case 'mensual':
        diasPorCuota = 30;
        break;
    }

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + (diasPorCuota * numero_cuotas));

    // Insertar préstamo
    const resultado = await pool.query(
      `INSERT INTO prestamos 
       (cliente_id, cobrador_id, monto_prestado, interes_porcentaje, monto_total, 
        numero_cuotas, monto_cuota, frecuencia_pago, fecha_inicio, fecha_fin, observaciones, creado_por, firma_cliente)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [
        cliente_id,
        cobrador_id || null,
        monto_prestado,
        tasa_interes,
        monto_total,
        numero_cuotas,
        monto_cuota,
        frecuencia_pago,
        fecha_inicio,
        fechaFin.toISOString().split('T')[0],
        notas,
        req.usuario.id,
        firma_cliente || null
      ]
    );

    const prestamo_id = resultado.rows[0].id;

    // Crear cuotas
    for (let i = 1; i <= numero_cuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + (diasPorCuota * i));

      await pool.query(
        'INSERT INTO cuotas (prestamo_id, numero_cuota, monto, fecha_vencimiento) VALUES ($1, $2, $3, $4)',
        [prestamo_id, i, monto_cuota, fechaVencimiento.toISOString().split('T')[0]]
      );
    }

    await pool.query("COMMIT");

    res.status(201).json({
      mensaje: 'Préstamo creado exitosamente',
      prestamo: {
        id: prestamo_id,
        monto_prestado,
        monto_total,
        numero_cuotas,
        monto_cuota
      }
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error('Error al crear préstamo:', error);
    res.status(500).json({ error: 'Error al crear préstamo' });
  } finally {
    // No necesario en PostgreSQL con pool.query
  }
};

// Actualizar préstamo
const actualizarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const { cobrador_id, estado, notas } = req.body;

    const prestamoExiste = await pool.query(
      'SELECT id FROM prestamos WHERE id = $1',
      [id]
    );

    if (prestamoExiste.rows.length === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    // Construir query dinámicamente
    let query = 'UPDATE prestamos SET ';
    const valores = [];
    const campos = [];
    let paramCounter = 1;

    if (cobrador_id !== undefined) {
      campos.push(`cobrador_id = $${paramCounter++}`);
      valores.push(cobrador_id);
    }
    if (estado) {
      campos.push(`estado = $${paramCounter++}`);
      valores.push(estado);
    }
    if (notas !== undefined) {
      campos.push(`notas = $${paramCounter++}`);
      valores.push(notas);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    query += campos.join(', ') + ` WHERE id = $${paramCounter}`;
    valores.push(id);

    await pool.query(query, valores);

    res.json({ mensaje: 'Préstamo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar préstamo:', error);
    res.status(500).json({ error: 'Error al actualizar préstamo' });
  }
};

// Eliminar préstamo
const eliminarPrestamo = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      'DELETE FROM prestamos WHERE id = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    res.json({ mensaje: 'Préstamo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar préstamo:', error);
    res.status(500).json({ error: 'Error al eliminar préstamo' });
  }
};

// Obtener reportes (solo admin)
const obtenerReportes = async (req, res) => {
  try {
    // Total de préstamos por estado
    const estadisticas = await pool.query(`
      SELECT 
        COUNT(*) as total_prestamos,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as pagados,
        SUM(CASE WHEN estado = 'vencido' THEN 1 ELSE 0 END) as vencidos,
        SUM(monto_prestado) as total_prestado,
        SUM(monto_total) as total_con_interes
      FROM prestamos
    `);

    // Cuotas pendientes
    const cuotasPendientes = await pool.query(`
      SELECT COUNT(*) as total, SUM(monto - monto_pagado) as monto_pendiente
      FROM cuotas
      WHERE estado IN ('pendiente', 'vencida')
    `);

    // Pagos del mes actual
    const pagosDelMes = await pool.query(`
      SELECT COUNT(*) as total_pagos, SUM(monto) as monto_recaudado
      FROM pagos
      WHERE EXTRACT(MONTH FROM COALESCE(fecha_pago, creado_en)) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM COALESCE(fecha_pago, creado_en)) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    // Total de clientes
    const totalClientes = await pool.query(`
      SELECT COUNT(*) as total_clientes,
             SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as clientes_activos
      FROM clientes
    `);

    // Total de usuarios
    const totalUsuarios = await pool.query(`
      SELECT COUNT(*) as total_usuarios,
             SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as usuarios_activos,
             SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as administradores,
             SUM(CASE WHEN rol = 'cobrador' THEN 1 ELSE 0 END) as cobradores
      FROM usuarios
    `);

    res.json({
      estadisticas: estadisticas.rows[0],
      cuotas_pendientes: cuotasPendientes.rows[0],
      pagos_mes_actual: pagosDelMes.rows[0],
      clientes: totalClientes.rows[0],
      usuarios: totalUsuarios.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
};

module.exports = {
  obtenerPrestamos,
  obtenerPrestamoPorId,
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  obtenerReportes
};
