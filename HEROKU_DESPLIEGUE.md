# 🚀 Despliegue en Heroku - Guía Completa

## 📋 Requisitos Previos

- Cuenta en Heroku (gratis): https://signup.heroku.com/
- Heroku CLI instalado: https://devcenter.heroku.com/articles/heroku-cli
- Git instalado

## ⚠️ Importante: MySQL vs PostgreSQL

Heroku usa **PostgreSQL** como base de datos (no MySQL). Necesitarás:
1. Migrar tu esquema de MySQL a PostgreSQL
2. Actualizar las dependencias del backend
3. Ajustar algunas consultas SQL si es necesario

## 🎯 Opción 1: Usar PostgreSQL en Heroku (Recomendado)

### Paso 1: Instalar Heroku CLI

```bash
# Windows (descargar instalador)
https://devcenter.heroku.com/articles/heroku-cli

# Verificar instalación
heroku --version
```

### Paso 2: Login en Heroku

```bash
heroku login
```

### Paso 3: Preparar el Backend para PostgreSQL

#### 3.1 Actualizar package.json

```bash
cd backend
npm install pg
npm uninstall mysql2
```

#### 3.2 Crear nuevo archivo de configuración de base de datos

Crear `backend/src/config/database-postgres.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

// Configuración para PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const verificarConexion = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, verificarConexion };
```

### Paso 4: Convertir Schema SQL a PostgreSQL

Crear `backend/database/schema-postgres.sql`:

```sql
-- Eliminar tablas si existen
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS cuotas CASCADE;
DROP TABLE IF EXISTS prestamos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'cobrador')),
  telefono VARCHAR(20),
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  foto_url TEXT,
  cobrador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  creado_por INTEGER REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de préstamos
CREATE TABLE prestamos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  monto_prestado DECIMAL(10,2) NOT NULL,
  interes_porcentaje DECIMAL(5,2) NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  numero_cuotas INTEGER NOT NULL,
  monto_cuota DECIMAL(10,2) NOT NULL,
  frecuencia_pago VARCHAR(20) NOT NULL CHECK (frecuencia_pago IN ('diario', 'semanal', 'quincenal', 'mensual')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'vencido', 'cancelado')),
  cobrador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  observaciones TEXT,
  creado_por INTEGER REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuotas
CREATE TABLE cuotas (
  id SERIAL PRIMARY KEY,
  prestamo_id INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  fecha_pago TIMESTAMP,
  monto_pagado DECIMAL(10,2) DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  cuota_id INTEGER NOT NULL REFERENCES cuotas(id) ON DELETE CASCADE,
  prestamo_id INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque')),
  referencia VARCHAR(100),
  observaciones TEXT,
  cobrador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  firma_url TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración
CREATE TABLE configuracion (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_clientes_cobrador ON clientes(cobrador_id);
CREATE INDEX idx_prestamos_cliente ON prestamos(cliente_id);
CREATE INDEX idx_prestamos_cobrador ON prestamos(cobrador_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_cuotas_prestamo ON cuotas(prestamo_id);
CREATE INDEX idx_cuotas_estado ON cuotas(estado);
CREATE INDEX idx_pagos_cuota ON pagos(cuota_id);
CREATE INDEX idx_pagos_prestamo ON pagos(prestamo_id);
CREATE INDEX idx_pagos_cliente ON pagos(cliente_id);
CREATE INDEX idx_pagos_cobrador ON pagos(cobrador_id);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamp automáticamente
CREATE TRIGGER trigger_usuarios_timestamp
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_clientes_timestamp
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_prestamos_timestamp
  BEFORE UPDATE ON prestamos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_cuotas_timestamp
  BEFORE UPDATE ON cuotas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_configuracion_timestamp
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();
```

### Paso 5: Crear Procfile para Heroku

Crear `backend/Procfile`:

```
web: node src/index.js
```

### Paso 6: Crear la aplicación en Heroku

```bash
cd backend

# Crear app en Heroku
heroku create tu-app-prestamos

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Ver la URL de la base de datos
heroku config:get DATABASE_URL
```

### Paso 7: Configurar Variables de Entorno

```bash
# JWT Secret
heroku config:set JWT_SECRET=tu_clave_secreta_muy_segura_cambiala

# JWT Expiration
heroku config:set JWT_EXPIRES_IN=7d

# Node Environment
heroku config:set NODE_ENV=production

# Cloudinary
heroku config:set CLOUDINARY_CLOUD_NAME=dp1dzunfp
heroku config:set CLOUDINARY_API_KEY=258478459326466
heroku config:set CLOUDINARY_API_SECRET=lnHcXW--2xkJDd27CsYpXxlxaDk
```

### Paso 8: Inicializar Git y Desplegar

```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Preparar para Heroku"

# Conectar con Heroku
heroku git:remote -a tu-app-prestamos

# Desplegar
git push heroku main
```

### Paso 9: Inicializar la Base de Datos

```bash
# Conectar a PostgreSQL
heroku pg:psql

# Copiar y pegar el contenido de schema-postgres.sql
# Luego ejecutar el seed si lo tienes adaptado

# O ejecutar desde archivo
heroku pg:psql < database/schema-postgres.sql
```

### Paso 10: Crear Usuario Admin

Crear script `backend/scripts/crear-admin-postgres.js`:

```javascript
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function crearAdmin() {
  try {
    const password = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrador', 'admin@test.com', password, 'admin']);
    
    console.log('✅ Usuario admin creado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearAdmin();
```

Ejecutar:
```bash
heroku run node scripts/crear-admin-postgres.js
```

### Paso 11: Actualizar Frontend

En `frontend/src/config/api.js`:

```javascript
const API_URL = 'https://tu-app-prestamos.herokuapp.com/api';
```

## 🎯 Opción 2: Usar MySQL Externo (ClearDB o JawsDB)

Si prefieres mantener MySQL:

### Opción 2A: ClearDB (MySQL en Heroku)

```bash
# Agregar ClearDB
heroku addons:create cleardb:ignite

# Obtener URL
heroku config:get CLEARDB_DATABASE_URL

# Configurar como DATABASE_URL
heroku config:set DATABASE_URL=$(heroku config:get CLEARDB_DATABASE_URL)
```

### Opción 2B: MySQL Externo (PlanetScale, Railway, etc.)

1. Crear base de datos en PlanetScale o Railway
2. Obtener la URL de conexión
3. Configurar en Heroku:

```bash
heroku config:set DATABASE_URL=mysql://usuario:password@host:3306/database
```

## 📱 Actualizar la App Móvil

1. Actualizar `frontend/src/config/api.js` con la URL de Heroku
2. Reconstruir la app:

```bash
cd frontend
eas build --platform android --profile production
```

## 🔍 Comandos Útiles

```bash
# Ver logs
heroku logs --tail

# Abrir app
heroku open

# Ejecutar comandos
heroku run node scripts/tu-script.js

# Conectar a base de datos
heroku pg:psql

# Ver info de la app
heroku info

# Reiniciar app
heroku restart
```

## ⚠️ Consideraciones Importantes

1. **Plan Gratuito**: Heroku ya no ofrece plan gratuito desde Nov 2022
2. **Alternativas Gratuitas**:
   - Railway (https://railway.app)
   - Render (https://render.com)
   - Fly.io (https://fly.io)

3. **Costos Heroku**:
   - Eco Dynos: $5/mes
   - Essential PostgreSQL: $5/mes
   - Total: ~$10/mes

## 🆘 Solución de Problemas

### Error: "No default language could be detected"
Agregar en `backend/package.json`:
```json
"engines": {
  "node": "18.x",
  "npm": "9.x"
}
```

### Error de conexión a base de datos
```bash
# Verificar DATABASE_URL
heroku config:get DATABASE_URL

# Verificar logs
heroku logs --tail
```

### App no inicia
```bash
# Ver logs detallados
heroku logs --tail

# Verificar Procfile
cat Procfile
```

## 📚 Recursos Adicionales

- Documentación Heroku: https://devcenter.heroku.com/
- PostgreSQL en Heroku: https://devcenter.heroku.com/articles/heroku-postgresql
- Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

## ✅ Checklist de Despliegue

- [ ] Heroku CLI instalado
- [ ] Cuenta Heroku creada
- [ ] Backend adaptado a PostgreSQL
- [ ] Procfile creado
- [ ] Variables de entorno configuradas
- [ ] App desplegada en Heroku
- [ ] Base de datos inicializada
- [ ] Usuario admin creado
- [ ] Frontend actualizado con URL de Heroku
- [ ] App móvil probada con backend en Heroku

---

**¿Necesitas ayuda?** Revisa los logs con `heroku logs --tail`
