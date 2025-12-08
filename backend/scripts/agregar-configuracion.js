// Script para agregar la tabla de configuración
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function agregarConfiguracion() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prestamos_db',
      multipleStatements: true
    });

    console.log('✅ Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'agregar-configuracion.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Ejecutando script SQL...');
    await connection.query(sql);

    console.log('✅ Tabla de configuración creada correctamente');
    console.log('✅ Configuración por defecto insertada');

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

agregarConfiguracion();
