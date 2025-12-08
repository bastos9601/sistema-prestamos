# 🆓 Alternativas Gratuitas a Heroku

Heroku ya no ofrece plan gratuito desde noviembre 2022. Aquí están las mejores alternativas gratuitas para tu base de datos en la nube:

## 🥇 1. Railway (Recomendado)

**✅ Ventajas:**
- $5 de crédito gratis al mes (suficiente para proyectos pequeños)
- Soporta MySQL y PostgreSQL
- Muy fácil de usar
- Deploy automático desde GitHub
- Variables de entorno simples

**📝 Pasos Rápidos:**

```bash
# 1. Crear cuenta en https://railway.app

# 2. Instalar Railway CLI
npm install -g @railway/cli

# 3. Login
railway login

# 4. Inicializar proyecto
cd backend
railway init

# 5. Agregar MySQL
railway add mysql

# 6. Configurar variables
railway variables set JWT_SECRET=tu_clave_secreta

# 7. Desplegar
railway up
```

**📚 Guía completa:** Ya tienes `RAILWAY_PASO_A_PASO.md` en tu proyecto

---

## 🥈 2. Render

**✅ Ventajas:**
- Plan gratuito permanente
- PostgreSQL gratis (90 días, luego expira)
- Deploy automático desde GitHub
- SSL gratis

**⚠️ Limitaciones:**
- La app se duerme después de 15 min de inactividad
- Base de datos gratis solo 90 días

**📝 Pasos Rápidos:**

```bash
# 1. Crear cuenta en https://render.com

# 2. Crear PostgreSQL Database
# - New > PostgreSQL
# - Nombre: prestamos-db
# - Plan: Free

# 3. Crear Web Service
# - New > Web Service
# - Conectar tu repositorio GitHub
# - Build Command: cd backend && npm install
# - Start Command: cd backend && npm start

# 4. Configurar variables de entorno
DATABASE_URL=postgresql://... (copiar de la base de datos)
JWT_SECRET=tu_clave_secreta
NODE_ENV=production
```

**🔗 URL:** https://dashboard.render.com

---

## 🥉 3. Fly.io

**✅ Ventajas:**
- Plan gratuito generoso
- Soporta PostgreSQL
- Muy rápido
- Múltiples regiones

**⚠️ Limitaciones:**
- Requiere tarjeta de crédito (no cobra si no excedes límites)
- Un poco más complejo de configurar

**📝 Pasos Rápidos:**

```bash
# 1. Instalar Fly CLI
# Windows: descargar desde https://fly.io/docs/hands-on/install-flyctl/

# 2. Login
fly auth login

# 3. Crear app
cd backend
fly launch

# 4. Agregar PostgreSQL
fly postgres create

# 5. Conectar base de datos
fly postgres attach nombre-de-tu-postgres

# 6. Desplegar
fly deploy
```

**🔗 URL:** https://fly.io

---

## 🎯 4. Supabase (Solo Base de Datos)

**✅ Ventajas:**
- PostgreSQL gratis permanente
- 500 MB de almacenamiento
- API REST automática
- Dashboard visual

**📝 Pasos Rápidos:**

```bash
# 1. Crear cuenta en https://supabase.com

# 2. Crear proyecto
# - New Project
# - Nombre: prestamos-db
# - Password: (guardar bien)

# 3. Obtener URL de conexión
# Settings > Database > Connection String

# 4. Usar en tu backend
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

**🔗 URL:** https://supabase.com

---

## 🎯 5. PlanetScale (Solo MySQL)

**✅ Ventajas:**
- MySQL gratis permanente
- 5 GB de almacenamiento
- 1 billón de lecturas/mes
- Muy rápido

**📝 Pasos Rápidos:**

```bash
# 1. Crear cuenta en https://planetscale.com

# 2. Crear base de datos
# - New Database
# - Nombre: prestamos-db
# - Region: US East

# 3. Crear contraseña
# - Settings > Passwords > New Password

# 4. Obtener URL de conexión
mysql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?ssl={"rejectUnauthorized":true}
```

**🔗 URL:** https://planetscale.com

---

## 🎯 6. Koyeb + Supabase (Backend + Base de Datos)

**✅ Ventajas:**
- Koyeb: Backend gratis permanente
- Supabase: PostgreSQL gratis permanente
- Deploy automático desde GitHub
- SSL gratis en ambos
- Sin tarjeta de crédito requerida

**⚠️ Limitaciones:**
- App se duerme después de inactividad (cold start)
- 512 MB RAM en Koyeb
- 500 MB base de datos en Supabase

**📝 Pasos Rápidos:**

```bash
# 1. Crear base de datos en Supabase
# - Ir a https://supabase.com
# - New Project > prestamos-db
# - Copiar DATABASE_URL

# 2. Crear app en Koyeb
# - Ir a https://app.koyeb.com
# - Create App > Conectar GitHub
# - Configurar variables de entorno
# - Deploy

# 3. Listo!
```

**🔗 URLs:** 
- Koyeb: https://app.koyeb.com
- Supabase: https://supabase.com

**📚 Guía completa:** Ver `KOYEB_DESPLIEGUE.md` en tu proyecto

---

## 📊 Comparación Rápida

| Servicio | Base de Datos | Plan Gratis | Limitaciones | Dificultad |
|----------|---------------|-------------|--------------|------------|
| **Railway** | MySQL/PostgreSQL | $5/mes crédito | Crédito limitado | ⭐ Fácil |
| **Render** | PostgreSQL | Sí (90 días DB) | App se duerme | ⭐⭐ Fácil |
| **Fly.io** | PostgreSQL | Sí | Requiere tarjeta | ⭐⭐⭐ Media |
| **Koyeb + Supabase** | PostgreSQL | Sí permanente | App se duerme | ⭐ Fácil |
| **Supabase** | PostgreSQL | Sí permanente | Solo DB | ⭐ Fácil |
| **PlanetScale** | MySQL | Sí permanente | Solo DB | ⭐⭐ Fácil |

---

## 🎯 Recomendación por Caso de Uso

### 🏆 Para tu proyecto (Backend + Base de Datos):

**Opción 1: Koyeb + Supabase** (Gratis permanente, más fácil)
- Backend en Koyeb (gratis)
- Base de datos en Supabase (PostgreSQL gratis)
- Deploy automático desde GitHub
- Sin tarjeta de crédito
- Ver: `KOYEB_DESPLIEGUE.md`

**Opción 2: Railway** (Más fácil, ya tienes guía)
- Backend en Railway
- MySQL en Railway
- $5 gratis al mes
- Ver: `RAILWAY_PASO_A_PASO.md`

**Opción 3: Render + Supabase** (Gratis permanente)
- Backend en Render (gratis)
- Base de datos en Supabase (PostgreSQL gratis)
- Requiere adaptar a PostgreSQL

**Opción 4: Render + PlanetScale** (Mantener MySQL)
- Backend en Render (gratis)
- MySQL en PlanetScale (gratis)
- Mantiene tu código MySQL actual
- Ver: `RAILWAY_CON_PLANETSCALE.md` (adaptar para Render)

---

## 🚀 Mi Recomendación Personal

Para tu proyecto de préstamos, te recomiendo:

### 🥇 **Koyeb + Supabase** (Gratis permanente y fácil)
- Backend gratis en Koyeb
- PostgreSQL gratis en Supabase
- Ambos gratis permanentemente
- Deploy automático desde GitHub
- Ya tienes schema PostgreSQL listo
- Deploy en 20 minutos
- Ver: `KOYEB_DESPLIEGUE.md`

### 🥈 **Railway** (Opción más simple)
- Ya tienes la guía completa
- Soporta MySQL directamente
- No necesitas cambiar código
- $5/mes gratis es suficiente para empezar
- Deploy en 10 minutos

### 🥉 **Render + PlanetScale** (Gratis permanente con MySQL)
- Backend gratis en Render
- MySQL gratis en PlanetScale
- No necesitas cambiar a PostgreSQL
- Un poco más de configuración

---

## 📝 Próximos Pasos

1. **Si quieres gratis permanente y fácil:** Usa Koyeb + Supabase
   - Sigue la guía `KOYEB_DESPLIEGUE.md`
   - Ya tienes PostgreSQL configurado
   - Deploy en 20 minutos

2. **Si quieres lo más rápido:** Usa Railway con la guía `RAILWAY_PASO_A_PASO.md`

3. **Si quieres mantener MySQL gratis:** Usa Render + PlanetScale
   - Sigue los pasos de Render arriba
   - Conecta con PlanetScale
   - Mantén tu código MySQL

4. **Si prefieres Heroku:** Usa Heroku + PostgreSQL
   - Sigue la guía `HEROKU_DESPLIEGUE.md`
   - Ya tienes PostgreSQL configurado

---

## 🆘 ¿Necesitas Ayuda?

- **Koyeb + Supabase:** Ver `KOYEB_DESPLIEGUE.md` ⭐ Recomendado
- **Railway:** Ver `RAILWAY_PASO_A_PASO.md`
- **Heroku:** Ver `HEROKU_DESPLIEGUE.md`
- **PlanetScale:** Ver `RAILWAY_CON_PLANETSCALE.md`

---

**💡 Consejo:** Empieza con Koyeb + Supabase. Es gratis permanentemente, fácil de configurar, y ya tienes PostgreSQL listo para usar.
