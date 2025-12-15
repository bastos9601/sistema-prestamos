// Script para agregar campo firma_cliente a la tabla prestamos
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function agregarCampoFirma() {
  try {
    console.log('📝 Agregando campo firma_cliente a tabla prestamos...\n');
    
    // Verificar si la columna ya existe
    const verificar = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'prestamos' AND column_name = 'firma_cliente'
    `);
    
    if (verificar.rows.length > 0) {
      console.log('✅ El campo firma_cliente ya existe');
    } else {
      // Agregar columna
      await pool.query(`
        ALTER TABLE prestamos 
        ADD COLUMN firma_cliente TEXT
      `);
      console.log('✅ Campo firma_cliente agregado exitosamente');
    }
    
    // Verificar columnas de la tabla
    const columnas = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prestamos'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columnas de la tabla prestamos:');
    columnas.rows.forEach(c => {
      console.log(`  - ${c.column_name} (${c.data_type})`);
    });
    
    console.log('\n🎉 Completado!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

agregarCampoFirma();
