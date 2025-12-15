// Script para verificar y agregar el campo firma_cliente a la tabla prestamos
require('dotenv').config();
const { pool } = require('./src/config/database');

async function verificarYAgregarFirma() {
  try {
    console.log('🔍 Verificando si existe el campo firma_cliente en la tabla prestamos...');

    // Verificar si la columna existe
    const resultado = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'prestamos' 
      AND column_name = 'firma_cliente'
    `);

    if (resultado.rows.length > 0) {
      console.log('✅ El campo firma_cliente ya existe en la tabla prestamos');
    } else {
      console.log('⚠️  El campo firma_cliente NO existe. Agregando...');
      
      await pool.query(`
        ALTER TABLE prestamos 
        ADD COLUMN firma_cliente TEXT
      `);
      
      console.log('✅ Campo firma_cliente agregado exitosamente');
    }

    // Mostrar algunos préstamos con firma
    const prestamosConFirma = await pool.query(`
      SELECT id, cliente_id, 
             CASE 
               WHEN firma_cliente IS NOT NULL THEN 'Sí' 
               ELSE 'No' 
             END as tiene_firma
      FROM prestamos 
      LIMIT 5
    `);

    console.log('\n📋 Préstamos (primeros 5):');
    console.table(prestamosConFirma.rows);

    await pool.end();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarYAgregarFirma();
