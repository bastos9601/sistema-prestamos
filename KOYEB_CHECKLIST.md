# ✅ Checklist: Desplegar en Koyeb + Supabase

Usa este checklist para desplegar tu sistema de préstamos en la nube.

---

## 📋 PARTE 1: Configurar Base de Datos (Supabase)

### ☐ 1. Crear cuenta en Supabase
- [ ] Ir a https://supabase.com
- [ ] Crear cuenta (GitHub recomendado)
- [ ] Verificar email

### ☐ 2. Crear proyecto de base de datos
- [ ] Click "New Project"
- [ ] Nombre: `prestamos-db`
- [ ] Password: **[GUARDAR EN LUGAR SEGURO]**
- [ ] Region: South America (São Paulo)
- [ ] Plan: Free
- [ ] Click "Create new project"
- [ ] Esperar 2-3 minutos

### ☐ 3. Ejecutar schema SQL
- [ ] Ir a: SQL Editor (menú izquierdo)
- [ ] Click "New query"
- [ ] Abrir archivo: `backend/database/schema-postgres.sql`
- [ ] Copiar TODO el contenido
- [ ] Pegar en el editor de Supabase
- [ ] Click "Run" (o Ctrl+Enter)
- [ ] Verificar: "Success. No rows returned"

### ☐ 4. Obtener URL de conexión
- [ ] Ir a: Settings > Database
- [ ] Buscar "Connection string"
- [ ] Seleccionar "URI" (no Pooler)
- [ ] Copiar la URL completa
- [ ] Reemplazar `[YOUR-PASSWORD]` con tu password real
- [ ] **Guardar esta URL** (la necesitarás en Koyeb)

**Formato de URL:**
```
postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 📋 PARTE 2: Preparar Código

### ☐ 5. Verificar archivos necesarios
- [ ] Existe: `backend/.koyeb/config.yaml` ✅
- [ ] Existe: `backend/package.json` ✅
- [ ] Existe: `backend/src/index.js` ✅
- [ ] Existe: `backend/src/config/database-postgres.js` ✅

### ☐ 6. Subir código a GitHub
```bash
git add .
git commit -m "Preparar para Koyeb"
git push origin main
```

- [ ] Código subido a GitHub
- [ ] Repositorio es público o tienes acceso

---

## 📋 PARTE 3: Desplegar en Koyeb

### ☐ 7. Crear cuenta en Koyeb
- [ ] Ir a https://app.koyeb.com
- [ ] Crear cuenta con GitHub
- [ ] Autorizar acceso a repositorios

### ☐ 8. Crear nueva aplicación
- [ ] Click "Create App"
- [ ] Seleccionar "GitHub"
- [ ] Elegir tu repositorio
- [ ] Branch: `main` (o `master`)

### ☐ 9. Configurar build
- [ ] Build command: `cd backend && npm install`
- [ ] Run command: `cd backend && npm start`
- [ ] Port: `3000`
- [ ] Instance type: `nano` (gratis)

### ☐ 10. Configurar variables de entorno

Copiar estas variables en Koyeb (reemplazar valores):

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=cambiar_por_clave_segura_unica_y_larga_minimo_32_caracteres
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=dp1dzunfp
CLOUDINARY_API_KEY=258478459326466
CLOUDINARY_API_SECRET=lnHcXW--2xkJDd27CsYpXxlxaDk
```

**Checklist de variables:**
- [ ] `NODE_ENV` = production
- [ ] `PORT` = 3000
- [ ] `DATABASE_URL` = [URL de Supabase con password real]
- [ ] `JWT_SECRET` = [Clave única y segura]
- [ ] `JWT_EXPIRES_IN` = 7d
- [ ] `CLOUDINARY_CLOUD_NAME` = dp1dzunfp
- [ ] `CLOUDINARY_API_KEY` = 258478459326466
- [ ] `CLOUDINARY_API_SECRET` = lnHcXW--2xkJDd27CsYpXxlxaDk

### ☐ 11. Desplegar
- [ ] Click "Deploy"
- [ ] Esperar 3-5 minutos
- [ ] Ver logs en tiempo real
- [ ] Verificar: "✅ Conexión a PostgreSQL exitosa"

### ☐ 12. Obtener URL de la app
- [ ] Copiar URL de Koyeb (ejemplo: `https://prestamos-backend-tu-usuario.koyeb.app`)
- [ ] **Guardar esta URL** (la necesitarás en el frontend)

---

## 📋 PARTE 4: Crear Usuario Administrador

### ☐ 13. Ejecutar SQL en Supabase
- [ ] Ir a Supabase > SQL Editor
- [ ] Ejecutar este SQL:

```sql
-- Crear usuario administrador
-- Email: admin@prestamos.com
-- Password: admin123
INSERT INTO usuarios (nombre, email, password, rol, activo) 
VALUES (
  'Administrador',
  'admin@prestamos.com',
  '$2a$10$rqQHqxKJ5vXe8N5xKJ5vXe8N5xKJ5vXe8N5xKJ5vXe8N5xKJ5vXe',
  'admin',
  true
);
```

- [ ] Verificar que se creó: `SELECT * FROM usuarios;`

---

## 📋 PARTE 5: Probar la API

### ☐ 14. Probar endpoint de salud
```bash
curl https://TU-URL.koyeb.app/
```
- [ ] Responde con JSON de bienvenida

### ☐ 15. Probar login
```bash
curl -X POST https://TU-URL.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prestamos.com","password":"admin123"}'
```
- [ ] Responde con token JWT

### ☐ 16. Ver logs
- [ ] Ir a Koyeb Dashboard > Tu App > Logs
- [ ] Verificar: No hay errores
- [ ] Verificar: "✅ Conexión a PostgreSQL exitosa"

---

## 📋 PARTE 6: Conectar Frontend

### ☐ 17. Actualizar URL en frontend
Editar `frontend/src/config/api.js`:

```javascript
const API_URL = 'https://TU-URL.koyeb.app';
export default API_URL;
```

- [ ] URL actualizada
- [ ] Código guardado

### ☐ 18. Probar app completa
```bash
cd frontend
npm start
# o
npx expo start
```

- [ ] App inicia correctamente
- [ ] Login funciona
- [ ] Puede ver dashboard

---

## 🎉 ¡LISTO!

### ✅ Verificación Final

- [ ] ✅ Base de datos en Supabase funcionando
- [ ] ✅ Backend en Koyeb desplegado
- [ ] ✅ Usuario admin creado
- [ ] ✅ Frontend conectado
- [ ] ✅ Login funciona
- [ ] ✅ Puede crear clientes/préstamos

---

## 📝 Información Importante

### URLs a guardar:
- **Supabase Dashboard:** https://app.supabase.com
- **Koyeb Dashboard:** https://app.koyeb.com
- **Tu API:** `https://TU-URL.koyeb.app`

### Credenciales por defecto:
- **Email:** admin@prestamos.com
- **Password:** admin123
- **⚠️ CAMBIAR después del primer login**

### Comandos útiles:

```bash
# Verificar conexión a Supabase (local)
cd backend
npm run verificar-supabase

# Ver logs de Koyeb
# Ir a: https://app.koyeb.com > Tu App > Logs

# Redesplegar después de cambios
git add .
git commit -m "Actualización"
git push origin main
# Koyeb redesplegará automáticamente
```

---

## 🆘 Problemas Comunes

### ❌ Error: "Cannot connect to database"
- [ ] Verificar DATABASE_URL en Koyeb
- [ ] Verificar password en la URL
- [ ] Verificar que Supabase está activo

### ❌ Error: "Port already in use"
- [ ] Verificar que PORT=3000 en variables
- [ ] Verificar que el código usa `process.env.PORT`

### ❌ Error: "JWT secret not defined"
- [ ] Verificar JWT_SECRET en Koyeb
- [ ] Debe ser una clave larga y segura

### ❌ App se duerme (cold start)
- [ ] Normal en plan gratuito
- [ ] Primera petición tarda 10-20 segundos
- [ ] Siguientes peticiones son rápidas

---

## 📚 Recursos

- **Guía completa:** `KOYEB_DESPLIEGUE.md`
- **Koyeb Docs:** https://www.koyeb.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

**💡 Consejo:** Guarda este checklist y las URLs importantes en un lugar seguro. Las necesitarás para mantenimiento futuro.
