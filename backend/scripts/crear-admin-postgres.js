// Script para crear usuario administrador en PostgreSQL
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function crearUsuariosIniciales() {
  try {
    console.log('🔄 Creando usuarios iniciales...');

    // Hash de contraseñas
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordCobrador = await bcrypt.hash('cobrador123', 10);

    // Crear administrador
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol, telefono, activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrador Principal', 'admin@test.com', passwordAdmin, 'admin', '809-555-0001', true]);

    console.log('✅ Usuario admin creado: admin@test.com / admin123');

    // Crear cobrador de prueba
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol, telefono, activo)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['Cobrador de Prueba', 'cobrador@test.com', passwordCobrador, 'cobrador', '809-555-0002', true]);

    console.log('✅ Usuario cobrador creado: cobrador@test.com / cobrador123');

    console.log('\n🎉 Usuarios creados exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Cobrador: cobrador@test.com / cobrador123');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error.message);
    await pool.end();
    process.exit(1);
  }
}

crearUsuariosIniciales();
