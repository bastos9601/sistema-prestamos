# 🚂 Guía Paso a Paso - Railway

## ✅ Requisitos Previos
- Cuenta de GitHub (gratis)
- Git instalado en tu computadora

---

## 📝 Paso 1: Crear Repositorio en GitHub (5 minutos)

### 1.1 Inicializar Git en tu proyecto

```bash
# En la raíz del proyecto (donde está la carpeta backend y frontend)
git init
git add .
git commit -m "Initial commit - Sistema de Préstamos"
```

### 1.2 Crear repositorio en GitHub

1. Ve a https://github.com
2. Click en "New repository"
3. Nombre: `sistema-prestamos`
4. Descripción: "Sistema de gestión de préstamos"
5. Público o Privado (tu elección)
6. NO marques "Initialize with README"
7. Click "Create repository"

### 1.3 Subir código a GitHub

```bash
# Copia los comandos que GitHub te muestra, algo como:
git remote add origin https://github.com/TU_USUARIO/sistema-prestamos.git
git branch -M main
git push -u origin main
```

---

## 🚂 Paso 2: Crear Cuenta en Railway (2 minutos)

1. Ve a https://railway.app
2. Click en "Login"
3. Selecciona "Login with GitHub"
4. Autoriza Railway

---

## 🗄️ Paso 3: Crear Base de Datos MySQL (3 minutos)

1. En Railway dashboard, click "New Project"
2. Selecciona "Provision MySQL"
3. Espera a que se cree (30 segundos)
4. Click en el servicio MySQL
5. Ve a la pestaña "Variables"
6. Copia estas variables (las necesitarás):
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
   - `MYSQLPORT`

---

## 🚀 Paso 4: Desplegar Backend (5 minutos)

### 4.1 Agregar Backend al Proyecto

1. En el mismo proyecto de Railway, click "+ New"
2. Selecciona "GitHub Repo"
3. Busca y selecciona tu repositorio `sistema-prestamos`
4. Railway detectará automáticamente el backend

### 4.2 Configurar Variables de Entorno

1. Click en el servicio del backend
2. Ve a "Variables"
3. Click "+ New Variable"
4. Agrega estas variables una por una:

```
DB_HOST = [valor de MYSQLHOST]
DB_USER = [valor de MYSQLUSER]
DB_PASSWORD = [valor de MYSQLPASSWORD]
DB_NAME = [valor de MYSQLDATABASE]
DB_PORT = [valor de MYSQLPORT]
JWT_SECRET = tu_secreto_super_seguro_12345
CLOUDINARY_CLOUD_NAME = [tu cloud name de Cloudinary]
CLOUDINARY_API_KEY = [tu api key de Cloudinary]
CLOUDINARY_API_SECRET = [tu api secret de Cloudinary]
PORT = 3000
NODE_ENV = production
```

### 4.3 Configurar Root Directory

1. En "Settings" del servicio backend
2. Busca "Root Directory"
3. Cambia a: `backend`
4. Click "Update"

### 4.4 Generar Dominio Público

1. En "Settings" del servicio backend
2. Busca "Networking"
3. Click "Generate Domain"
4. Copia la URL (ejemplo: `https://sistema-prestamos-production.up.railway.app`)

---

## 📊 Paso 5: Importar Base de Datos (10 minutos)

### 5.1 Conectarse a MySQL

Opción A: Usando Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Conectar a MySQL
railway connect mysql
```

Opción B: Usando MySQL Workbench o DBeaver

1. Abre MySQL Workbench
2. Nueva conexión con los datos de Railway:
   - Host: [MYSQLHOST]
   - Port: [MYSQLPORT]
   - User: [MYSQLUSER]
   - Password: [MYSQLPASSWORD]
   - Database: [MYSQLDATABASE]

### 5.2 Ejecutar Scripts SQL

Una vez conectado, ejecuta en orden:

```sql
-- 1. Schema principal
source C:/ruta/a/tu/proyecto/backend/database/schema.sql

-- 2. Datos iniciales
source C:/ruta/a/tu/proyecto/backend/database/seed.sql

-- 3. Migraciones
source C:/ruta/a/tu/proyecto/backend/database/agregar-creado-por.sql
source C:/ruta/a/tu/proyecto/backend/database/agregar-firma.sql
source C:/ruta/a/tu/proyecto/backend/database/agregar-foto-cliente.sql
source C:/ruta/a/tu/proyecto/backend/database/agregar-foto-usuario.sql
source C:/ruta/a/tu/proyecto/backend/database/agregar-configuracion.sql
```

O copia y pega el contenido de cada archivo directamente.

### 5.3 Verificar Datos

```sql
-- Verificar tablas
SHOW TABLES;

-- Verificar usuarios
SELECT * FROM usuarios;

-- Verificar configuración
SELECT * FROM configuracion;
```

---

## 📱 Paso 6: Actualizar Frontend (2 minutos)

### 6.1 Actualizar URL del API

Edita `frontend/src/config/api.js`:

```javascript
// Cambia esta línea:
const API_URL = 'http://localhost:3000/api';

// Por tu URL de Railway (la que copiaste en el paso 4.4):
const API_URL = 'https://sistema-prestamos-production.up.railway.app/api';
```

### 6.2 Probar Conexión

```bash
cd frontend
npm start
```

Intenta hacer login con:
- Email: `admin@test.com`
- Password: `admin123`

Si funciona, ¡tu backend está listo! 🎉

---

## 🔧 Paso 7: Solución de Problemas

### Backend no inicia

1. Ve a Railway → Tu servicio backend → "Deployments"
2. Click en el último deployment
3. Ve a "View Logs"
4. Busca errores

**Errores comunes:**

- **"Cannot connect to database"**: Verifica las variables de entorno
- **"Port already in use"**: Railway asigna el puerto automáticamente, está bien
- **"Module not found"**: Verifica que `backend` esté en Root Directory

### No puedo conectarme desde el frontend

1. Verifica que la URL en `api.js` sea correcta
2. Verifica que termine en `/api`
3. Prueba la URL en el navegador: `https://tu-url.railway.app/api`
4. Deberías ver un JSON con información de la API

### Base de datos vacía

1. Verifica que ejecutaste todos los scripts SQL
2. Conéctate a MySQL y verifica:
   ```sql
   SELECT COUNT(*) FROM usuarios;
   -- Debería devolver 2 (admin y cobrador)
   ```

---

## ✅ Checklist Final

- [ ] Código subido a GitHub
- [ ] Proyecto creado en Railway
- [ ] MySQL provisionado
- [ ] Backend desplegado
- [ ] Variables de entorno configuradas
- [ ] Root Directory configurado a `backend`
- [ ] Dominio público generado
- [ ] Base de datos importada
- [ ] Usuarios de prueba creados
- [ ] Frontend actualizado con nueva URL
- [ ] Login funciona correctamente

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Crear APK**: Sigue la guía en `PASOS_RAPIDOS.md`
2. **Configurar dominio personalizado** (opcional): En Railway Settings
3. **Configurar backups**: Railway hace backups automáticos
4. **Monitorear uso**: Railway dashboard muestra uso de recursos

---

## 💰 Costos

Railway Plan Gratuito incluye:
- ✅ 500 horas de ejecución/mes
- ✅ 1GB RAM
- ✅ 1GB Disco
- ✅ MySQL incluido
- ✅ Dominio HTTPS gratis

**Suficiente para:**
- 20-30 usuarios activos
- Miles de transacciones/mes
- Uso 24/7 durante ~20 días

Si necesitas más, el plan Hobby es $5/mes.

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa los logs en Railway
2. Verifica las variables de entorno
3. Prueba la conexión a la base de datos
4. Verifica que todos los scripts SQL se ejecutaron

¡Tu sistema está casi listo para producción! 🚀
