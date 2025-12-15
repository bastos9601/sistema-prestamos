// Script para convertir sintaxis MySQL a PostgreSQL en los controladores
const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../src/controllers');

// Función para convertir un archivo
function convertirArchivo(filePath) {
  console.log(`\n📝 Procesando: ${path.basename(filePath)}`);
  
  let contenido = fs.readFileSync(filePath, 'utf8');
  let cambios = 0;

  // 1. Convertir const [variable] = await pool.query a const variable = await pool.query
  const regex1 = /const \[([^\]]+)\] = await pool\.query/g;
  contenido = contenido.replace(regex1, (match, variable) => {
    cambios++;
    return `const ${variable} = await pool.query`;
  });

  // 2. Convertir placeholders ? a $1, $2, $3, etc.
  const lineas = contenido.split('\n');
  const lineasConvertidas = lineas.map(linea => {
    if (linea.includes('pool.query') && linea.includes('?')) {
      let contador = 1;
      const lineaConvertida = linea.replace(/\?/g, () => `$${contador++}`);
      if (lineaConvertida !== linea) cambios++;
      return lineaConvertida;
    }
    return linea;
  });
  contenido = lineasConvertidas.join('\n');

  // 3. Convertir acceso a resultados: variable[0] a variable.rows[0]
  // Pero solo para variables que vienen de pool.query
  const variablesQuery = [];
  const regex2 = /const ([a-zA-Z_][a-zA-Z0-9_]*) = await pool\.query/g;
  let match;
  while ((match = regex2.exec(contenido)) !== null) {
    variablesQuery.push(match[1]);
  }

  // Reemplazar accesos a estas variables
  variablesQuery.forEach(variable => {
    // variable.length -> variable.rows.length
    const regex3 = new RegExp(`\\b${variable}\\.length\\b`, 'g');
    if (regex3.test(contenido)) {
      contenido = contenido.replace(regex3, `${variable}.rows.length`);
      cambios++;
    }

    // variable[0] -> variable.rows[0]
    const regex4 = new RegExp(`\\b${variable}\\[0\\]`, 'g');
    if (regex4.test(contenido)) {
      contenido = contenido.replace(regex4, `${variable}.rows[0]`);
      cambios++;
    }

    // Simplemente variable (cuando se usa como array) -> variable.rows
    // Esto es más complicado, lo haremos manualmente si es necesario
  });

  // 4. Convertir resultado.insertId a resultado.rows[0].id
  contenido = contenido.replace(/resultado\.insertId/g, (match) => {
    cambios++;
    return 'resultado.rows[0].id';
  });

  // 5. Agregar RETURNING id a los INSERT que no lo tienen
  const regex5 = /(INSERT INTO [^)]+\))\s*VALUES\s*\([^)]+\)(?!\s*RETURNING)/gi;
  contenido = contenido.replace(regex5, (match) => {
    if (!match.includes('RETURNING')) {
      cambios++;
      return match + ' RETURNING id';
    }
    return match;
  });

  if (cambios > 0) {
    fs.writeFileSync(filePath, contenido, 'utf8');
    console.log(`✅ ${cambios} cambios realizados`);
  } else {
    console.log(`⏭️  Sin cambios necesarios`);
  }

  return cambios;
}

// Procesar todos los archivos
console.log('🚀 Iniciando conversión de MySQL a PostgreSQL...\n');

const archivos = fs.readdirSync(controllersDir)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(controllersDir, file));

let totalCambios = 0;
archivos.forEach(archivo => {
  totalCambios += convertirArchivo(archivo);
});

console.log(`\n🎉 Conversión completada: ${totalCambios} cambios en total`);
console.log('\n⚠️  IMPORTANTE: Revisa manualmente los archivos para asegurarte de que todo esté correcto');
