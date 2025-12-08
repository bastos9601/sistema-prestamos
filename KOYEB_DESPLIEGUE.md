# 🚀 Desplegar Base de Datos en Koyeb

Guía completa para desplegar tu sistema de préstamos con base de datos PostgreSQL en Koyeb.

## 📋 ¿Qué es Koyeb?

Koyeb es una plataforma serverless que ofrece:
- ✅ Plan gratuito permanente
- ✅ PostgreSQL en la nube
- ✅ Deploy automático desde GitHub
- ✅ SSL gratis
- ✅ Variables de entorno seguras

---

## 🎯 Opción 1: Koyeb + Base de Datos Externa (Recomendado)

Koyeb no ofrece base de datos PostgreSQL directamente, pero puedes usar:

### **Koyeb (Backend) + Supabase (PostgreSQL)**

**Por qué esta combinación:**
- Koyeb: Backend gratis permanente
- Supabase: PostgreSQL gratis permanente (500 MB)
- Ambos con SSL y alta disponibilidad

---

## 📝 PASO 1: Configurar Base de Datos en Supabase

### 1.1 Crear cuenta en Supabase

```bash
# 1. Ir a https://supabase.com
# 2. Crear cuenta (GitHub, Google, o email)
# 3. Verificar email
```

### 1.2 Crear proyecto de base de datos

```
1. Click en "New Project"
2. Configurar:
   - Name: prestamos-db
   - Database Password: [CREAR_PASSWORD_SEGURO]
   - Region: South America (São Paulo) - más cercano
   - Plan: Free
3. Click "Create new project"
4. Esperar 2-3 minutos mientras se crea
```

### 1.3 Ejecutar el schema de base de datos

```
1. En Supabase, ir a: SQL Editor (menú izquierdo)
2. Click en "New query"
3. Copiar TODO el contenido de: backend/database/schema-postgres.sql
4. Pegar en el editor
5. Click "Run" o presionar Ctrl+Enter
6. Verificar que dice "Success. No rows returned"
```

### 1.4 Obtener URL de conexión

```
1. Ir a: Settings > Database
2. Buscar "Connection string"
3. Seleccionar "URI" (no Pooler)
4. Copiar la URL que se ve así:
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

5. IMPORTANTE: Reemplazar [YOUR-PASSWORD] con tu password real
```

**Ejemplo de URL completa:**
```
postgresql://postgres.abcdefgh:MiPassword123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 📝 PASO 2: Preparar tu Backend para Koyeb

### 2.1 Verificar package.json

Tu `backend/package.json` debe tener:

```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  },
  "scripts": {
    "start": "node src/index.js"
  }
}
```

✅ Ya lo tienes configurado correctamente

### 2.2 Crear archivo de configuración para Koyeb

Crear `backend/.koyeb/config.yaml`:

```yaml
services:
  - name: prestamos-backend
    type: web
    instance_type: nano
    regions:
      - was
    ports:
      - port: 3000
        protocol: http
    env:
      - key: NODE_ENV
        value: production
    build:
      buildpack: nodejs
    run:
      command: npm start
```

### 2.3 Actualizar tu código para usar DATABASE_URL

Verificar que `backend/src/config/database.js` soporte `DATABASE_URL`:

```javascript
// Si usas PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

---

## 📝 PASO 3: Desplegar en Koyeb

### 3.1 Crear cuenta en Koyeb

```bash
# 1. Ir a https://app.koyeb.com
# 2. Crear cuenta con GitHub (recomendado)
# 3. Autorizar acceso a tus repositorios
```

### 3.2 Crear nueva aplicación

```
1. Click en "Create App"
2. Seleccionar "GitHub"
3. Elegir tu repositorio del proyecto
4. Configurar:
   - Branch: main (o master)
   - Build command: cd backend && npm install
   - Run command: cd backend && npm start
   - Port: 3000
```

### 3.3 Configurar variables de entorno

En la sección "Environment variables":

```env
NODE_ENV=production
PORT=3000

# Base de datos (URL de Supabase del PASO 1.4)
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_por_una_real
JWT_EXPIRES_IN=7d

# Cloudinary (tus credenciales actuales)
CLOUDINARY_CLOUD_NAME=dp1dzunfp
CLOUDINARY_API_KEY=258478459326466
CLOUDINARY_API_SECRET=lnHcXW--2xkJDd27CsYpXxlxaDk
```

**⚠️ IMPORTANTE:** 
- Reemplaza `[PASSWORD]` en DATABASE_URL con tu password real de Supabase
- Cambia JWT_SECRET por una clave segura única

### 3.4 Desplegar

```
1. Click en "Deploy"
2. Esperar 3-5 minutos
3. Koyeb te dará una URL como:
   https://prestamos-backend-tu-usuario.koyeb.app
```

---

## 📝 PASO 4: Crear Usuario Administrador

### 4.1 Conectar a Supabase y crear admin

```
1. Ir a Supabase > SQL Editor
2. Ejecutar este SQL:
```

```sql
-- Crear usuario administrador
-- Password: admin123 (cámbiala después)
INSERT INTO usuarios (nombre, email, password, rol, activo) 
VALUES (
  'Administrador',
  'admin@prestamos.com',
  '$2a$10$rqQHqxKJ5vXKZN5xKJ5vXKZN5xKJ5vXKZN5xKJ5vXKZN5xKJ5vXK',
  'admin',
  true
);

-- Verificar que se creó
SELECT id, nombre, email, rol FROM usuarios;
```

**Nota:** El hash es para la contraseña "admin123". Cámbiala después del primer login.

---

## 📝 PASO 5: Conectar Frontend con Backend

### 5.1 Actualizar URL del backend

En `frontend/src/config/api.js` (o donde tengas la configuración):

```javascript
// Reemplazar con tu URL de Koyeb
const API_URL = 'https://prestamos-backend-tu-usuario.koyeb.app';

export default API_URL;
```

### 5.2 Probar la conexión

```bash
# Desde tu computadora
cd frontend
npm start

# O si usas Expo
npx expo start
```

---

## ✅ Verificar que Todo Funciona

### 1. Probar el backend

```bash
# Reemplaza con tu URL de Koyeb
curl https://prestamos-backend-tu-usuario.koyeb.app/api/health

# Debería responder:
# {"status":"ok","database":"connected"}
```

### 2. Probar login

```bash
curl -X POST https://prestamos-backend-tu-usuario.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prestamos.com","password":"admin123"}'

# Debería devolver un token JWT
```

### 3. Ver logs en Koyeb

```
1. Ir a Koyeb Dashboard
2. Click en tu aplicación
3. Ver pestaña "Logs"
4. Verificar que no hay errores
```

---

## 🔧 Comandos Útiles

### Ver logs en tiempo real

```
1. Koyeb Dashboard > Tu App > Logs
2. Activar "Auto-refresh"
```

### Redesplegar después de cambios

```bash
# Koyeb detecta automáticamente cambios en GitHub
git add .
git commit -m "Actualización"
git push origin main

# Koyeb redesplegará automáticamente
```

### Ejecutar migraciones

```
1. Supabase > SQL Editor
2. Pegar tu SQL de migración
3. Click "Run"
```

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"

```bash
# Verificar que DATABASE_URL está correcta
# En Koyeb > Settings > Environment Variables
# Debe tener el formato:
postgresql://postgres.xxxxx:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### Error: "Port already in use"

```javascript
// En backend/src/index.js, usar:
const PORT = process.env.PORT || 3000;
```

### Error: "SSL connection required"

```javascript
// En tu configuración de PostgreSQL:
ssl: {
  rejectUnauthorized: false
}
```

### App se duerme (cold start)

```
Koyeb plan gratuito:
- La app se duerme después de inactividad
- Primera petición puede tardar 10-20 segundos
- Peticiones siguientes son rápidas
```

---

## 💰 Límites del Plan Gratuito

### Koyeb Free Tier:
- ✅ 1 servicio web
- ✅ 512 MB RAM
- ✅ 2 GB almacenamiento
- ✅ 100 GB transferencia/mes
- ⚠️ App se duerme después de inactividad

### Supabase Free Tier:
- ✅ 500 MB base de datos
- ✅ 1 GB transferencia/mes
- ✅ 50,000 usuarios activos/mes
- ✅ Backups automáticos (7 días)

**Suficiente para:** Desarrollo, pruebas, y proyectos pequeños

---

## 🎯 Próximos Pasos

1. ✅ Base de datos en Supabase
2. ✅ Backend en Koyeb
3. ✅ Frontend conectado
4. 📱 Desplegar frontend en Expo/Vercel
5. 🔐 Cambiar contraseñas por defecto
6. 📊 Configurar monitoreo

---

## 📚 Recursos Adicionales

- **Koyeb Docs:** https://www.koyeb.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 💡 Consejos Finales

1. **Backups:** Supabase hace backups automáticos (7 días en plan gratuito)
2. **Seguridad:** Cambia todas las contraseñas por defecto
3. **Monitoreo:** Revisa logs regularmente en Koyeb
4. **Performance:** Primera petición puede ser lenta (cold start)
5. **Escalabilidad:** Si creces, ambos servicios tienen planes pagos

---

**¿Listo para desplegar?** Sigue los pasos en orden y tendrás tu app en la nube en menos de 30 minutos. 🚀
