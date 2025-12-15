// Script para verificar configuraciones
const axios = require('axios');

async function testConfig() {
  try {
    const response = await axios.get('http://localhost:3000/api/configuracion');
    console.log('✅ Configuraciones en la base de datos:');
    response.data.configuraciones.forEach(c => {
      console.log(`  - ${c.clave}: "${c.valor}"`);
    });
    
    console.log('\n🔍 Probando claves específicas:');
    
    // Probar nombre_sistema
    try {
      const r1 = await axios.get('http://localhost:3000/api/configuracion/nombre_sistema');
      console.log('✅ nombre_sistema:', r1.data);
    } catch (e) {
      console.log('❌ nombre_sistema: 404');
    }
    
    // Probar logo_sistema
    try {
      const r2 = await axios.get('http://localhost:3000/api/configuracion/logo_sistema');
      console.log('✅ logo_sistema:', r2.data);
    } catch (e) {
      console.log('❌ logo_sistema: 404');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConfig();
