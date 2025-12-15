// Script para corregir TODOS los problemas de MySQL a PostgreSQL
const fs = require('fs');
const path = require('path');

function corregirControlador(contenido) {
  let resultado = contenido;
  
  // 1. Reemplazar monto_cuota por monto en queries
  resultado = resultado.replace(/c\.monto_cuota/g, 'c.monto');
  resultado = resultado.replace(/cuota\.monto_cuota/g, 'cuota.monto');
  resultado = resultado.replace(/SUM\(monto_cuota/g, 'SUM(monto');
  
  // 2. Eliminar referencias a connection.getConnection() y transacciones MySQL
  resultado = resultado.replace(/const connection = await pool\.getConnection\(\);/g, '// Transacciones PostgreSQL se manejan diferente');
  resultado = resultado.replace(/await connection\.beginTransaction\(\);/g, 'await pool.query("BEGIN");');
  resultado = resultado.replace(/await connection\.commit\(\);/g, 'await pool.query("COMMIT");');
  resultado = resultado.replace(/await connection\.rollback\(\);/g, 'await pool.query("ROLLBACK");');
  resultado = resultado.replace(/connection\.release\(\);/g, '// No necesario en PostgreSQL con pool.query');
  
  // 3. Reemplazar connection.query por pool.query
  resultado = resultado.replace(/await connection\.query\(/g, 'await pool.query(');
  resultado = resultado.replace(/const \[([^\]]+)\] = await connection\.query/g, 'const $1 = await pool.query');
  
  // 4. Corregir INSERT con VALUES ? (MySQL bulk insert)
  // Esto es más complejo, lo haremos manualmente si es necesario
  
  // 5. Corregir estados: 'parcial' no existe en el schema
  resultado = resultado.replace(/'parcial'/g, "'pendiente'");
  
  // 6. Corregir 'pagado' a 'completado' para préstamos
  resultado = resultado.replace(/estado = 'pagado'/g, "estado = 'completado'");
  resultado = resultado.replace(/estado != 'pagado'/g, "estado != 'completado'");
  
  // 7. Corregir resultadoPago.insertId a resultadoPago.rows[0].id
  resultado = resultado.replace(/resultadoPago\.insertId/g, 'resultadoPago.rows[0].id');
  
  // 8. Corregir cuotasPendientes[0] a cuotasPendientes.rows[0]
  resultado = resultado.replace(/cuotasPendientes\[0\]/g, 'cuotasPendientes.rows[0]');
  
  return resultado;
}

const controllersDir = path.join(__dirname, '../src/controllers');
const archivos = [
  'pagosController.js',
  'prestamosController.js'
].map(file => path.join(controllersDir, file));

console.log('🚀 Corrigiendo controladores...\n');

archivos.forEach(archivo => {
  if (!fs.existsSync(archivo)) {
    console.log(`⚠️  ${path.basename(archivo)} no encontrado\n`);
    return;
  }
  
  console.log(`📝 Procesando: ${path.basename(archivo)}`);
  const contenido = fs.readFileSync(archivo, 'utf8');
  const convertido = corregirControlador(contenido);
  
  if (contenido !== convertido) {
    fs.writeFileSync(archivo, convertido, 'utf8');
    console.log(`✅ Corregido\n`);
  } else {
    console.log(`⏭️  Sin cambios\n`);
  }
});

console.log('🎉 Proceso completado');
console.log('\n⚠️  NOTA: Las transacciones y bulk inserts necesitan revisión manual');
