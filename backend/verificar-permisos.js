// Script para verificar que las rutas estén configuradas correctamente
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de permisos...\n');

// Verificar archivo de rutas de usuarios
const usuariosPath = path.join(__dirname, 'src', 'routes', 'usuarios.js');
const usuariosContent = fs.readFileSync(usuariosPath, 'utf8');

console.log('📁 Verificando backend/src/routes/usuarios.js');
if (usuariosContent.includes('verificarCobradorOAdmin')) {
  console.log('✅ verificarCobradorOAdmin encontrado');
} else {
  console.log('❌ verificarCobradorOAdmin NO encontrado');
}

if (usuariosContent.includes("router.get('/cobradores', verificarCobradorOAdmin")) {
  console.log('✅ Ruta /cobradores permite acceso a cobradores');
} else {
  console.log('❌ Ruta /cobradores NO permite acceso a cobradores');
}

// Verificar archivo de rutas de clientes
const clientesPath = path.join(__dirname, 'src', 'routes', 'clientes.js');
const clientesContent = fs.readFileSync(clientesPath, 'utf8');

console.log('\n📁 Verificando backend/src/routes/clientes.js');
if (!clientesContent.includes("router.post(\n  '/',\n  verificarAdmin")) {
  console.log('✅ Crear cliente NO requiere verificarAdmin');
} else {
  console.log('❌ Crear cliente requiere verificarAdmin (incorrecto)');
}

// Verificar archivo de rutas de préstamos
const prestamosPath = path.join(__dirname, 'src', 'routes', 'prestamos.js');
const prestamosContent = fs.readFileSync(prestamosPath, 'utf8');

console.log('\n📁 Verificando backend/src/routes/prestamos.js');
if (prestamosContent.includes('verificarCobradorOAdmin')) {
  console.log('✅ verificarCobradorOAdmin encontrado');
} else {
  console.log('❌ verificarCobradorOAdmin NO encontrado');
}

// Verificar middleware
const authPath = path.join(__dirname, 'src', 'middlewares', 'auth.js');
const authContent = fs.readFileSync(authPath, 'utf8');

console.log('\n📁 Verificando backend/src/middlewares/auth.js');
if (authContent.includes('const verificarCobradorOAdmin')) {
  console.log('✅ Middleware verificarCobradorOAdmin existe');
} else {
  console.log('❌ Middleware verificarCobradorOAdmin NO existe');
}

console.log('\n✅ Verificación completada');
console.log('\n💡 Si todo está correcto, reinicia el backend:');
console.log('   cd backend');
console.log('   npm start');
