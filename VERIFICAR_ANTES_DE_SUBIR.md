# ✅ Verificación Pre-Despliegue

Antes de subir a Railway, verifica estos puntos:

## 🔍 Checklist Backend

### 1. Archivos Necesarios
- [x] `backend/package.json` existe
- [x] `backend/src/index.js` existe
- [x] `backend/.env` existe (NO se subirá a GitHub)
- [x] `backend/railway.json` creado
- [x] `backend/.railwayignore` creado

### 2. Scripts SQL
- [x] `backend/database/schema.sql`
- [x] `backend/database/seed.sql`
- [x] `backend/database/agregar-creado-por.sql`
- [x] `backend/database/agregar-firma.sql`
- [x] `backend/database/agregar-foto-cliente.sql`
- [x] `backend/database/agregar-foto-usuario.sql`
- [x] `backend/database/agregar-configuracion.sql`

### 3. Dependencias
```bash
cd backend
npm install
```

### 4. Probar Localmente
```bash
cd backend
npm start
```

Debería mostrar:
```
🚀 Servidor corriendo en http://localhost:3000
✅ Conexión a MySQL exitosa
```

---

## 🔍 Checklist Frontend

### 1. Archivos Necesarios
- [x] `frontend/package.json` existe
- [x] `frontend/app.json` existe
- [x] `frontend/src/config/api.js` existe

### 2. Dependencias
```bash
cd frontend
npm install
```

### 3. Probar Localmente
```bash
cd frontend
npm start
```

Debería abrir Expo y poder hacer login.

---

## 🔍 Checklist Cloudinary

### 1. Credenciales
Verifica que tengas:
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET

### 2. Probar Upload
En tu app local, intenta:
- Subir foto de cliente
- Subir foto de usuario
- Subir logo del sistema

---

## 🔍 Checklist Git

### 1. Git Instalado
```bash
git --version
```

Debería mostrar la versión de Git.

### 2. Configurar Git (si es primera vez)
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 3. Verificar .gitignore
```bash
cat .gitignore
```

Debe incluir:
- `node_modules/`
- `.env`
- `*.log`

---

## 🔍 Checklist GitHub

### 1. Cuenta Creada
- [ ] Tienes cuenta en https://github.com
- [ ] Puedes crear repositorios

### 2. SSH o HTTPS
Elige uno:

**Opción A: HTTPS (más fácil)**
```bash
# No requiere configuración adicional
# Pedirá usuario y contraseña al hacer push
```

**Opción B: SSH (más seguro)**
```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu@email.com"

# Copiar clave pública
cat ~/.ssh/id_ed25519.pub

# Agregar en GitHub → Settings → SSH Keys
```

---

## 🔍 Checklist Railway

### 1. Cuenta Creada
- [ ] Tienes cuenta en https://railway.app
- [ ] Conectada con GitHub

### 2. Railway CLI (Opcional pero recomendado)
```bash
npm install -g @railway/cli
railway --version
```

---

## 🚀 Comandos Rápidos de Verificación

Ejecuta estos comandos para verificar todo:

```bash
# Verificar Node.js
node --version
# Debe ser v14 o superior

# Verificar npm
npm --version

# Verificar Git
git --version

# Verificar dependencias backend
cd backend && npm list --depth=0

# Verificar dependencias frontend
cd ../frontend && npm list --depth=0

# Volver a raíz
cd ..
```

---

## ⚠️ Problemas Comunes

### "npm: command not found"
Instala Node.js desde https://nodejs.org

### "git: command not found"
Instala Git desde https://git-scm.com

### "Cannot find module"
```bash
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### ".env not found"
Crea el archivo `.env` en la carpeta backend con:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=prestamos_db
DB_PORT=3306
JWT_SECRET=tu_secreto_local
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
PORT=3000
```

---

## ✅ Todo Listo

Si todos los checks están marcados, estás listo para:

1. Subir a GitHub
2. Desplegar en Railway
3. Crear el APK

Sigue la guía: `RAILWAY_PASO_A_PASO.md`
