// Script para reemplazar TODOS los ? por $1, $2, $3, etc.
const fs = require('fs');
const path = require('path');

function reemplazarPlaceholders(contenido) {
  const lineas = contenido.split('\n');
  let resultado = [];
  
  for (let i = 0; i < lineas.length; i++) {
    let linea = lineas[i];
    
    // Si la línea contiene pool.query y tiene ?
    if (linea.includes('pool.query') && linea.includes('?')) {
      // Buscar las siguientes líneas hasta encontrar el array de parámetros
      let queryCompleto = linea;
      let j = i + 1;
      let nivelParentesis = (linea.match(/\(/g) || []).length - (linea.match(/\)/g) || []).length;
      
      while (j < lineas.length && nivelParentesis > 0) {
        queryCompleto += '\n' + lineas[j];
        nivelParentesis += (lineas[j].match(/\(/g) || []).length - (lineas[j].match(/\)/g) || []).length;
        j++;
      }
      
      // Contar cuántos ? hay
      const cantidadPlaceholders = (queryCompleto.match(/\?/g) || []).length;
      
      // Reemplazar cada ? por $1, $2, $3, etc.
      let contador = 1;
      queryCompleto = queryCompleto.replace(/\?/g, () => `$${contador++}`);
      
      // Dividir de nuevo en líneas
      const lineasReemplazadas = queryCompleto.split('\n');
      resultado.push(...lineasReemplazadas);
      i = j - 1; // Saltar las líneas que ya procesamos
    } else {
      resultado.push(linea);
    }
  }
  
  return resultado.join('\n');
}

const controllersDir = path.join(__dirname, '../src/controllers');
const archivos = fs.readdirSync(controllersDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(controllersDir, file));

console.log('🚀 Reemplazando todos los ? por $1, $2, $3...\n');

archivos.forEach(archivo => {
  console.log(`📝 Procesando: ${path.basename(archivo)}`);
  const contenido = fs.readFileSync(archivo, 'utf8');
  
  if (contenido.includes('?')) {
    const convertido = reemplazarPlaceholders(contenido);
    fs.writeFileSync(archivo, convertido, 'utf8');
    
    const cantidadAntes = (contenido.match(/\?/g) || []).length;
    const cantidadDespues = (convertido.match(/\?/g) || []).length;
    console.log(`✅ Reemplazados ${cantidadAntes - cantidadDespues} placeholders\n`);
  } else {
    console.log(`⏭️  Sin placeholders\n`);
  }
});

console.log('🎉 Proceso completado');
