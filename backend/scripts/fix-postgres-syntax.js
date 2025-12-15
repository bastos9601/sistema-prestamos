// Script mejorado para convertir sintaxis MySQL a PostgreSQL
const fs = require('fs');
const path = require('path');

function convertirAPostgreSQL(contenido) {
  let resultado = contenido;
  
  // 1. Convertir placeholders ? a $1, $2, $3 línea por línea
  const lineas = resultado.split('\n');
  const lineasConvertidas = lineas.map(linea => {
    // Solo procesar líneas que contengan pool.query y ?
    if (linea.includes('pool.query') || linea.includes('query +=')) {
      let contador = 1;
      // Contar cuántos $ ya existen antes de esta línea para continuar la numeración
      const lineaAnterior = lineas.slice(0, lineas.indexOf(linea)).join('\n');
      const matchesAnteriores = lineaAnterior.match(/\$\d+/g);
      if (matchesAnteriores && linea.includes('query +=')) {
        contador = matchesAnteriores.length + 1;
      }
      
      return linea.replace(/\?/g, () => `$${contador++}`);
    }
    return linea;
  });
  resultado = lineasConvertidas.join('\n');
  
  // 2. Convertir funciones de fecha MySQL a PostgreSQL
  resultado = resultado.replace(/MONTH\(([^)]+)\)/g, 'EXTRACT(MONTH FROM $1)');
  resultado = resultado.replace(/YEAR\(([^)]+)\)/g, 'EXTRACT(YEAR FROM $1)');
  resultado = resultado.replace(/CURRENT_DATE\(\)/g, 'CURRENT_DATE');
  resultado = resultado.replace(/NOW\(\)/g, 'NOW()');
  
  // 3. Convertir resultado.affectedRows a resultado.rowCount
  resultado = resultado.replace(/resultado\.affectedRows/g, 'resultado.rowCount');
  
  return resultado;
}

const controllersDir = path.join(__dirname, '../src/controllers');
const archivos = fs.readdirSync(controllersDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(controllersDir, file));

console.log('🚀 Corrigiendo sintaxis PostgreSQL...\n');

archivos.forEach(archivo => {
  console.log(`📝 Procesando: ${path.basename(archivo)}`);
  const contenido = fs.readFileSync(archivo, 'utf8');
  const convertido = convertirAPostgreSQL(contenido);
  
  if (contenido !== convertido) {
    fs.writeFileSync(archivo, convertido, 'utf8');
    console.log(`✅ Corregido\n`);
  } else {
    console.log(`⏭️  Sin cambios\n`);
  }
});

console.log('🎉 Proceso completado');
