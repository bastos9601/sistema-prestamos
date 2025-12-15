// Configuración de conexión a PostgreSQL (Supabase)
const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones para mejor rendimiento
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión
const verificarConexion = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL (Supabase) exitosa');
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, verificarConexion };
