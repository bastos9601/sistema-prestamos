// Script para migrar datos de MySQL a PostgreSQL
// Útil si ya tienes datos en MySQL local y quieres moverlos a Heroku

const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración MySQL (local)
const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'prestamos_db',
  port: process.env.DB_PORT || 3306
};

// Configuración PostgreSQL (Heroku)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function migrarDatos() {
  let mysqlConnection;
  
  try {
    console.log('🔄 Iniciando migración de MySQL a PostgreSQL...\n');

    // Conectar a MySQL
    console.log('📡 Conectando a MySQL...');
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conectado a MySQL\n');

    // Conectar a PostgreSQL
    console.log('📡 Conectando a PostgreSQL...');
    const pgClient = await pgPool.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Migrar usuarios
    console.log('👥 Migrando usuarios...');
    const [usuarios] = await mysqlConnection.execute('SELECT * FROM usuarios');
    for (const usuario of usuarios) {
      await pgClient.query(`
        INSERT INTO usuarios (id, nombre, email, password, rol, telefono, foto_url, activo, creado_en, actualizado_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO NOTHING
      `, [
        usuario.id, usuario.nombre, usuario.email, usuario.password,
        usuario.rol, usuario.telefono, usuario.foto_url, usuario.activo,
        usuario.creado_en, usuario.actualizado_en
      ]);
    }
    console.log(`✅ ${usuarios.length} usuarios migrados\n`);

    // Migrar clientes
    console.log('👤 Migrando clientes...');
    const [clientes] = await mysqlConnection.execute('SELECT * FROM clientes');
    for (const cliente of clientes) {
      await pgClient.query(`
        INSERT INTO clientes (id, nombre, cedula, telefono, direccion, foto_url, cobrador_id, activo, creado_por, creado_en, actualizado_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (cedula) DO NOTHING
      `, [
        cliente.id, cliente.nombre, cliente.cedula, cliente.telefono,
        cliente.direccion, cliente.foto_url, cliente.cobrador_id,
        cliente.activo, cliente.creado_por, cliente.creado_en, cliente.actualizado_en
      ]);
    }
    console.log(`✅ ${clientes.length} clientes migrados\n`);

    // Migrar préstamos
    console.log('💰 Migrando préstamos...');
    const [prestamos] = await mysqlConnection.execute('SELECT * FROM prestamos');
    for (const prestamo of prestamos) {
      await pgClient.query(`
        INSERT INTO prestamos (id, cliente_id, monto_prestado, interes_porcentaje, monto_total, numero_cuotas, monto_cuota, frecuencia_pago, fecha_inicio, fecha_fin, estado, cobrador_id, observaciones, creado_por, creado_en, actualizado_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `, [
        prestamo.id, prestamo.cliente_id, prestamo.monto_prestado,
        prestamo.interes_porcentaje, prestamo.monto_total, prestamo.numero_cuotas,
        prestamo.monto_cuota, prestamo.frecuencia_pago, prestamo.fecha_inicio,
        prestamo.fecha_fin, prestamo.estado, prestamo.cobrador_id,
        prestamo.observaciones, prestamo.creado_por, prestamo.creado_en,
        prestamo.actualizado_en
      ]);
    }
    console.log(`✅ ${prestamos.length} préstamos migrados\n`);

    // Migrar cuotas
    console.log('📋 Migrando cuotas...');
    const [cuotas] = await mysqlConnection.execute('SELECT * FROM cuotas');
    for (const cuota of cuotas) {
      await pgClient.query(`
        INSERT INTO cuotas (id, prestamo_id, numero_cuota, monto, fecha_vencimiento, estado, fecha_pago, monto_pagado, creado_en, actualizado_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        cuota.id, cuota.prestamo_id, cuota.numero_cuota, cuota.monto,
        cuota.fecha_vencimiento, cuota.estado, cuota.fecha_pago,
        cuota.monto_pagado, cuota.creado_en, cuota.actualizado_en
      ]);
    }
    console.log(`✅ ${cuotas.length} cuotas migradas\n`);

    // Migrar pagos
    console.log('💵 Migrando pagos...');
    const [pagos] = await mysqlConnection.execute('SELECT * FROM pagos');
    for (const pago of pagos) {
      await pgClient.query(`
        INSERT INTO pagos (id, cuota_id, prestamo_id, cliente_id, monto, metodo_pago, referencia, observaciones, cobrador_id, firma_url, creado_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        pago.id, pago.cuota_id, pago.prestamo_id, pago.cliente_id,
        pago.monto, pago.metodo_pago, pago.referencia, pago.observaciones,
        pago.cobrador_id, pago.firma_url, pago.creado_en
      ]);
    }
    console.log(`✅ ${pagos.length} pagos migrados\n`);

    // Migrar configuración
    console.log('⚙️ Migrando configuración...');
    const [config] = await mysqlConnection.execute('SELECT * FROM configuracion');
    for (const conf of config) {
      await pgClient.query(`
        INSERT INTO configuracion (id, clave, valor, descripcion, creado_en, actualizado_en)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (clave) DO UPDATE SET valor = $3, descripcion = $4
      `, [
        conf.id, conf.clave, conf.valor, conf.descripcion,
        conf.creado_en, conf.actualizado_en
      ]);
    }
    console.log(`✅ ${config.length} configuraciones migradas\n`);

    // Actualizar secuencias de PostgreSQL
    console.log('🔄 Actualizando secuencias...');
    await pgClient.query(`SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios))`);
    await pgClient.query(`SELECT setval('clientes_id_seq', (SELECT MAX(id) FROM clientes))`);
    await pgClient.query(`SELECT setval('prestamos_id_seq', (SELECT MAX(id) FROM prestamos))`);
    await pgClient.query(`SELECT setval('cuotas_id_seq', (SELECT MAX(id) FROM cuotas))`);
    await pgClient.query(`SELECT setval('pagos_id_seq', (SELECT MAX(id) FROM pagos))`);
    await pgClient.query(`SELECT setval('configuracion_id_seq', (SELECT MAX(id) FROM configuracion))`);
    console.log('✅ Secuencias actualizadas\n');

    pgClient.release();
    await mysqlConnection.end();

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Usuarios: ${usuarios.length}`);
    console.log(`   - Clientes: ${clientes.length}`);
    console.log(`   - Préstamos: ${prestamos.length}`);
    console.log(`   - Cuotas: ${cuotas.length}`);
    console.log(`   - Pagos: ${pagos.length}`);
    console.log(`   - Configuraciones: ${config.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
    if (mysqlConnection) await mysqlConnection.end();
    await pgPool.end();
    process.exit(1);
  }
}

// Ejecutar migración
migrarDatos();
