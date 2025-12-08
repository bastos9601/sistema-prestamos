// Script completo para inicializar la base de datos
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function inicializarDB() {
  let connection;

  try {
    console.log('🚀 Iniciando configuración de base de datos...\n');

    // Conectar a MySQL sin especificar base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL');

    // Crear base de datos si no existe
    const dbName = process.env.DB_NAME || 'prestamos_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos '${dbName}' verificada`);

    // Usar la base de datos
    await connection.query(`USE ${dbName}`);

    // Leer y ejecutar schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar cada statement del schema
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('CREATE DATABASE'));

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
        await connection.query(statement);
      }
    }

    console.log('✅ Tablas creadas correctamente');

    // Verificar si ya existen usuarios
    const [usuarios] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
    
    if (usuarios[0].count === 0) {
      console.log('\n📝 Creando usuarios de prueba...');
      
      // Leer y ejecutar seed.sql
      const seedPath = path.join(__dirname, '../database/seed.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      const seedStatements = seedSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

      for (const statement of seedStatements) {
        if (statement.includes('INSERT')) {
          try {
            await connection.query(statement);
          } catch (err) {
            // Ignorar errores de duplicados
            if (!err.message.includes('Duplicate')) {
              throw err;
            }
          }
        }
      }

      console.log('✅ Datos de prueba insertados');
    } else {
      console.log('\n⚠️  Ya existen usuarios en la base de datos');
      console.log('   Saltando inserción de datos de prueba');
    }

    // Mostrar resumen
    const [tablas] = await connection.query('SHOW TABLES');
    console.log('\n📊 Resumen de la base de datos:');
    console.log(`   Base de datos: ${dbName}`);
    console.log(`   Tablas creadas: ${tablas.length}`);

    const [countUsuarios] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
    const [countClientes] = await connection.query('SELECT COUNT(*) as count FROM clientes');
    const [countPrestamos] = await connection.query('SELECT COUNT(*) as count FROM prestamos');

    console.log(`   Usuarios: ${countUsuarios[0].count}`);
    console.log(`   Clientes: ${countClientes[0].count}`);
    console.log(`   Préstamos: ${countPrestamos[0].count}`);

    console.log('\n✅ Base de datos inicializada correctamente');
    console.log('\n👥 Usuarios de prueba:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Cobrador: cobrador@test.com / cobrador123');
    console.log('\n🚀 Ahora puedes ejecutar: npm run dev');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Verifica:');
    console.error('   - MySQL está corriendo');
    console.error('   - Las credenciales en .env son correctas');
    console.error('   - El usuario tiene permisos para crear bases de datos');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

inicializarDB();
