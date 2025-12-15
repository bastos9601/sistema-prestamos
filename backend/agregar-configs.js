// Script para agregar configuraciones faltantes
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function agregarConfiguraciones() {
  try {
    console.log('📝 Agregando configuraciones faltantes...\n');
    
    // Agregar nombre_sistema (alias de nombre_empresa)
    await pool.query(`
      INSERT INTO configuracion (clave, valor, descripcion)
      VALUES ($1, $2, $3)
      ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor
    `, ['nombre_sistema', 'Sistema de Préstamos', 'Nombre del sistema']);
    console.log('✅ nombre_sistema agregado');
    
    // Agregar logo_sistema (alias de logo_url)
    await pool.query(`
      INSERT INTO configuracion (clave, valor, descripcion)
      VALUES ($1, $2, $3)
      ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor
    `, ['logo_sistema', '', 'URL del logo del sistema']);
    console.log('✅ logo_sistema agregado');
    
    // Verificar
    const result = await pool.query('SELECT clave, valor FROM configuracion ORDER BY clave');
    console.log('\n📋 Configuraciones actuales:');
    result.rows.forEach(r => {
      console.log(`  - ${r.clave}: "${r.valor}"`);
    });
    
    console.log('\n🎉 Completado!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

agregarConfiguraciones();
