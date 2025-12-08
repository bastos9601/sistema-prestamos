// Script para agregar configuración del logo
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function agregarLogoConfig() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prestamos_db'
    });

    console.log('✅ Conectado a la base de datos');

    await connection.query(
      `INSERT INTO configuracion (clave, valor) 
       VALUES ('logo_sistema', '') 
       ON DUPLICATE KEY UPDATE valor = valor`
    );

    console.log('✅ Configuración del logo agregada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

agregarLogoConfig();
