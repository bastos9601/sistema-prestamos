// Script para verificar usuarios en la base de datos
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testUsuarios() {
  try {
    // 1. Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@prestamos.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    console.log('Usuario:', loginResponse.data.usuario);
    
    // 2. Obtener usuarios
    console.log('\n👥 Obteniendo usuarios...');
    const usuariosResponse = await axios.get(`${BASE_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Respuesta completa:', JSON.stringify(usuariosResponse.data, null, 2));
    
    const usuarios = usuariosResponse.data.usuarios || usuariosResponse.data;
    console.log('\nTotal usuarios:', usuarios.length);
    console.log('\nLista de usuarios:');
    usuarios.forEach(u => {
      console.log(`  - ${u.nombre} (${u.email}) - Rol: ${u.rol}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUsuarios();
