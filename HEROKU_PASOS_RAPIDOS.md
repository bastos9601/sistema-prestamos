# 🚀 Despliegue Rápido en Heroku - 10 Pasos

## ⚡ Guía Express (15 minutos)

### 1️⃣ Instalar Heroku CLI

**Windows:**
```bash
# Descargar e instalar desde:
https://devcenter.heroku.com/articles/heroku-cli

# Verificar instalación
heroku --version
```

### 2️⃣ Login en Heroku

```bash
heroku login
```

### 3️⃣ Instalar PostgreSQL en el Backend

```bash
cd backend
npm install pg
```

### 4️⃣ Crear App en Heroku

```bash
# Crear la aplicación (cambia el nombre)
heroku create mi-app-prestamos

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:essential-0
```

### 5️⃣ Configurar Variables de Entorno

```bash
# JWT
heroku config:set JWT_SECRET=mi_clave_super_secreta_12345

# Cloudinary (usa tus credenciales)
heroku config:set CLOUDINARY_CLOUD_NAME=dp1dzunfp
heroku config:set CLOUDINARY_API_KEY=258478459326466
heroku config:set CLOUDINARY_API_SECRET=lnHcXW--2xkJDd27CsYpXxlxaDk

# Node
heroku config:set NODE_ENV=production
heroku config:set JWT_EXPIRES_IN=7d
```

### 6️⃣ Preparar Git

```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Preparar para Heroku"

# Conectar con Heroku
heroku git:remote -a mi-app-prestamos
```

### 7️⃣ Desplegar

```bash
git push heroku main
```

### 8️⃣ Inicializar Base de Datos

```bash
# Conectar a PostgreSQL
heroku pg:psql

# Copiar y pegar TODO el contenido de: backend/database/schema-postgres.sql
# Presionar Enter para ejecutar

# Salir
\q
```

### 9️⃣ Crear Usuario Admin

```bash
heroku run npm run crear-usuarios-postgres
```

### 🔟 Actualizar Frontend

En `frontend/src/config/api.js`:

```javascript
// Cambiar de:
const API_URL = 'http://192.168.1.100:3000/api';

// A:
const API_URL = 'https://mi-app-prestamos.herokuapp.com/api';
```

## ✅ Verificar que Funciona

```bash
# Ver logs
heroku logs --tail

# Abrir app en navegador
heroku open

# Probar endpoint
curl https://mi-app-prestamos.herokuapp.com/api/auth/login
```

## 🎯 Credenciales de Prueba

- **Admin:** admin@test.com / admin123
- **Cobrador:** cobrador@test.com / cobrador123

## 🔧 Comandos Útiles

```bash
# Ver todas las variables
heroku config

# Ver info de la app
heroku info

# Reiniciar app
heroku restart

# Ver base de datos
heroku pg:info

# Conectar a base de datos
heroku pg:psql

# Ejecutar script
heroku run node scripts/tu-script.js
```

## ⚠️ Importante

1. **Heroku ya no es gratis** - Cuesta ~$10/mes
2. **Alternativas gratuitas:**
   - Railway: https://railway.app
   - Render: https://render.com
   - Fly.io: https://fly.io

## 🆘 Problemas Comunes

### App no inicia
```bash
heroku logs --tail
# Buscar errores en los logs
```

### Error de base de datos
```bash
# Verificar que DATABASE_URL existe
heroku config:get DATABASE_URL

# Reconectar PostgreSQL
heroku pg:info
```

### Error de build
```bash
# Verificar que package.json tiene engines
# Verificar que Procfile existe
```

## 📱 Reconstruir App Móvil

```bash
cd frontend
eas build --platform android --profile production
```

## 🎉 ¡Listo!

Tu app ahora está en la nube:
- Backend: https://mi-app-prestamos.herokuapp.com
- Base de datos: PostgreSQL en Heroku
- Accesible desde cualquier lugar

---

**¿Necesitas la guía completa?** Ver `HEROKU_DESPLIEGUE.md`
