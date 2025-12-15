// Script para inicializar la base de datos en Supabase
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function inicializarSupabase() {
  console.log('🚀 Iniciando configuración de Supabase...\n');

  // Crear conexión
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verificar conexión
    console.log('📡 Verificando conexión...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a Supabase\n');

    // Leer y ejecutar schema
    console.log('📄 Ejecutando schema de PostgreSQL...');
    const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✅ Schema creado exitosamente\n');

    // Crear usuario administrador por defecto
    console.log('👤 Creando usuario administrador...');
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO usuarios (nombre, email, password, rol, activo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrador', 'admin@prestamos.com', passwordHash, 'admin', true]);
    
    console.log('✅ Usuario administrador creado');
    console.log('   Email: admin@prestamos.com');
    console.log('   Password: admin123\n');

    // Verificar tablas creadas
    console.log('📊 Verificando tablas creadas...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✅ Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    client.release();
    console.log('\n🎉 ¡Base de datos inicializada correctamente en Supabase!');
    
  } catch (error) {
    console.error('❌ Error al inicializar Supabase:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('   1. Tu DATABASE_URL en .env sea correcta');
    console.error('   2. Tu proyecto Supabase esté activo');
    console.error('   3. Tengas permisos de administrador');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

inicializarSupabase();
