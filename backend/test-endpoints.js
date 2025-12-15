// Script para probar todos los endpoints del backend
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';
let userId = '';

async function testEndpoint(name, method, url, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: useAuth ? { Authorization: `Bearer ${token}` } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${name}: OK (${response.status})`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}: FAIL (${error.response?.status || 'ERROR'})`);
    if (error.response?.data) {
      console.log(`   Error: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de endpoints...\n');
  
  // 1. Configuración (público)
  console.log('📋 CONFIGURACIÓN:');
  await testEndpoint('GET /configuracion', 'GET', '/configuracion');
  await testEndpoint('GET /configuracion/nombre_empresa', 'GET', '/configuracion/nombre_empresa');
  
  // 2. Autenticación
  console.log('\n🔐 AUTENTICACIÓN:');
  const loginData = await testEndpoint('POST /auth/login', 'POST', '/auth/login', {
    email: 'admin@prestamos.com',
    password: 'admin123'
  });
  
  if (loginData && loginData.token) {
    token = loginData.token;
    userId = loginData.usuario.id;
    console.log(`   Token obtenido: ${token.substring(0, 20)}...`);
  } else {
    console.log('\n❌ No se pudo obtener token. Deteniendo pruebas.');
    return;
  }
  
  // 3. Perfil
  console.log('\n👤 PERFIL:');
  await testEndpoint('GET /auth/perfil', 'GET', '/auth/perfil', null, true);
  
  // 4. Usuarios
  console.log('\n👥 USUARIOS:');
  await testEndpoint('GET /usuarios', 'GET', '/usuarios', null, true);
  await testEndpoint('GET /usuarios/cobradores', 'GET', '/usuarios/cobradores', null, true);
  
  // 5. Clientes
  console.log('\n📇 CLIENTES:');
  await testEndpoint('GET /clientes', 'GET', '/clientes', null, true);
  
  // 6. Préstamos
  console.log('\n💰 PRÉSTAMOS:');
  await testEndpoint('GET /prestamos', 'GET', '/prestamos', null, true);
  await testEndpoint('GET /prestamos/reportes', 'GET', '/prestamos/reportes', null, true);
  
  // 7. Pagos
  console.log('\n💵 PAGOS:');
  await testEndpoint('GET /pagos/cuotas-pendientes', 'GET', '/pagos/cuotas-pendientes', null, true);
  
  console.log('\n✅ Pruebas completadas!');
}

runTests().catch(console.error);
