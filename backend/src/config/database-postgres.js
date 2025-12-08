// Configuración de conexión a PostgreSQL para Heroku
const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones para PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión
const verificarConexion = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    const result = await client.query('SELECT NOW()');
    console.log('📅 Hora del servidor:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, verificarConexion };
