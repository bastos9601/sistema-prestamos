// Script para crear usuarios de prueba con contraseñas hasheadas correctamente
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const usuarios = [
  {
    nombre: 'Administrador Principal',
    email: 'admin@test.com',
    password: 'admin123',
    rol: 'admin'
  },
  {
    nombre: 'Juan Cobrador',
    email: 'cobrador@test.com',
    password: 'cobrador123',
    rol: 'cobrador'
  },
  {
    nombre: 'María Cobrador',
    email: 'maria@test.com',
    password: 'cobrador123',
    rol: 'cobrador'
  }
];

async function crearUsuarios() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'prestamos_db',
    });

    console.log('✅ Conectado a la base de datos');

    // Eliminar usuarios existentes (opcional)
    await connection.query('DELETE FROM usuarios WHERE email IN (?, ?, ?)', [
      'admin@test.com',
      'cobrador@test.com',
      'maria@test.com'
    ]);

    // Crear usuarios con contraseñas hasheadas
    for (const usuario of usuarios) {
      const passwordHash = await bcrypt.hash(usuario.password, 10);
      
      await connection.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [usuario.nombre, usuario.email, passwordHash, usuario.rol]
      );

      console.log(`✅ Usuario creado: ${usuario.email} / ${usuario.password}`);
    }

    console.log('\n✅ Todos los usuarios de prueba han sido creados correctamente');
    console.log('\nCredenciales:');
    console.log('- Admin: admin@test.com / admin123');
    console.log('- Cobrador: cobrador@test.com / cobrador123');
    console.log('- Cobrador 2: maria@test.com / cobrador123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

crearUsuarios();
