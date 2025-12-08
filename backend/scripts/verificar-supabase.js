// Script para verificar conexión a Supabase
require('dotenv').config();
const { Pool } = require('pg');

const verificarSupabase = async () => {
  console.log('🔍 Verificando conexión a Supabase...\n');

  // Verificar que DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está definida en .env');
    console.log('\n💡 Asegúrate de tener DATABASE_URL en tu archivo .env');
    console.log('   Ejemplo: DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL encontrada');
  console.log('📍 URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Ocultar password

  // Crear pool de conexiones
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Probar conexión
    console.log('\n🔌 Conectando a Supabase...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!\n');

    // Verificar hora del servidor
    const timeResult = await client.query('SELECT NOW()');
    console.log('⏰ Hora del servidor:', timeResult.rows[0].now);

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('🐘 PostgreSQL:', versionResult.rows[0].version.split(' ')[1]);

    // Listar tablas
    console.log('\n📊 Verificando tablas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No hay tablas creadas aún');
      console.log('\n💡 Ejecuta el schema SQL en Supabase:');
      console.log('   1. Ir a Supabase Dashboard > SQL Editor');
      console.log('   2. Copiar contenido de: backend/database/schema-postgres.sql');
      console.log('   3. Pegar y ejecutar (Run)');
    } else {
      console.log('✅ Tablas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

      // Contar registros en cada tabla
      console.log('\n📈 Registros por tabla:');
      for (const row of tablesResult.rows) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
        console.log(`   - ${row.table_name}: ${countResult.rows[0].count} registros`);
      }
    }

    client.release();
    await pool.end();

    console.log('\n✅ Verificación completada exitosamente!');
    console.log('🚀 Tu base de datos está lista para usar en Koyeb\n');

  } catch (error) {
    console.error('\n❌ ERROR al conectar a Supabase:');
    console.error('   Mensaje:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Solución: Verifica tu password en DATABASE_URL');
      console.log('   1. Ir a Supabase > Settings > Database');
      console.log('   2. Copiar "Connection string" > URI');
      console.log('   3. Reemplazar [YOUR-PASSWORD] con tu password real');
    } else if (error.message.includes('no pg_hba.conf entry')) {
      console.log('\n💡 Solución: Verifica la configuración SSL');
      console.log('   La conexión debe usar SSL (ya está configurado)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Solución: Verifica tu conexión a internet y la URL');
      console.log('   La URL debe ser de Supabase (aws-0-*.pooler.supabase.com)');
    }

    await pool.end();
    process.exit(1);
  }
};

// Ejecutar verificación
verificarSupabase();
