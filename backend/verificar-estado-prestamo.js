// Script para verificar el estado de los préstamos y sus cuotas
require('dotenv').config();
const { pool } = require('./src/config/database');

async function verificarEstadoPrestamos() {
  try {
    console.log('🔍 Verificando estado de préstamos y cuotas...\n');

    // Obtener todos los préstamos activos
    const prestamos = await pool.query(`
      SELECT id, cliente_id, estado, numero_cuotas, monto_total
      FROM prestamos
      ORDER BY id
    `);

    for (const prestamo of prestamos.rows) {
      console.log(`\n📋 Préstamo ID: ${prestamo.id} - Estado: ${prestamo.estado}`);
      
      // Obtener cuotas del préstamo
      const cuotas = await pool.query(`
        SELECT id, numero_cuota, monto, monto_pagado, estado
        FROM cuotas
        WHERE prestamo_id = $1
        ORDER BY numero_cuota
      `, [prestamo.id]);

      console.log(`   Total cuotas: ${cuotas.rows.length}`);
      
      let todasPagadas = true;
      cuotas.rows.forEach(cuota => {
        const pagado = parseFloat(cuota.monto_pagado);
        const total = parseFloat(cuota.monto);
        const pendiente = total - pagado;
        
        console.log(`   Cuota #${cuota.numero_cuota}: ${cuota.estado} - Monto: ${total}, Pagado: ${pagado}, Pendiente: ${pendiente}`);
        
        if (cuota.estado !== 'pagada') {
          todasPagadas = false;
        }
      });

      // Verificar si el estado del préstamo debería ser "completado"
      if (todasPagadas && cuotas.rows.length > 0) {
        if (prestamo.estado !== 'completado') {
          console.log(`   ⚠️  INCONSISTENCIA: Todas las cuotas están pagadas pero el préstamo está en estado "${prestamo.estado}"`);
          console.log(`   🔧 Actualizando estado a "completado"...`);
          
          await pool.query(
            'UPDATE prestamos SET estado = $1 WHERE id = $2',
            ['completado', prestamo.id]
          );
          
          console.log(`   ✅ Estado actualizado correctamente`);
        } else {
          console.log(`   ✅ Estado correcto: completado`);
        }
      } else if (!todasPagadas) {
        console.log(`   ℹ️  Aún hay cuotas pendientes`);
      }
    }

    await pool.end();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarEstadoPrestamos();
