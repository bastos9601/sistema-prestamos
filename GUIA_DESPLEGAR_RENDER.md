# Guía para Desplegar Backend en Render

## ¿Por qué Render?
- ✅ Plan gratuito disponible
- ✅ Fácil de configurar
- ✅ Se conecta directamente con GitHub
- ✅ Despliegue automático cuando haces push
- ✅ Compatible con PostgreSQL (Supabase)

## Paso 1: Preparar el Proyecto

### 1.1 Crear archivo render.yaml (Opcional pero recomendado)

Ya está creado en este proyecto. Verifica que exista `backend/render.yaml`.

### 1.2 Verificar que el backend tenga el script "start"

✅ Ya lo tienes en `package.json`: `"start": "node src/index.js"`

## Paso 2: Subir tu Código a GitHub

Si aún no lo has hecho:

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para despliegue en Render"

# Crear repositorio en GitHub y conectarlo
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

## Paso 3: Crear Cuenta en Render

1. Ve a https://render.com
2. Haz clic en "Get Started"
3. Regístrate con GitHub (recomendado)

## Paso 4: Crear Web Service en Render

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio de tu proyecto

## Paso 5: Configurar el Web Service

### Configuración Básica:

- **Name**: `prestamos-backend` (o el nombre que prefieras)
- **Region**: Selecciona la más cercana (ej: Oregon USA)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (para empezar)

### Variables de Entorno:

Haz clic en **"Advanced"** y agrega estas variables de entorno:

```
NODE_ENV=production
PORT=3000

# Base de datos (Supabase)
DATABASE_URL=postgresql://postgres.ifoqjhzjyvmubduelrlp:OKS5oZgp9mhowB5s@aws-1-us-east-1.pooler.supabase.com:6543/postgres
DB_USER=postgres
DB_PASSWORD=9YqxlFJ6ViXXLKg8
DB_NAME=postgres
DB_PORT=6543

# JWT (IMPORTANTE: Cambia este secreto por uno nuevo y seguro)
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dp1dzunfp
CLOUDINARY_API_KEY=258478459326466
CLOUDINARY_API_SECRET=lnHcXW--2xkJDd27CsYpXxlxaDk
```

**⚠️ IMPORTANTE**: Genera un nuevo `JWT_SECRET` para producción. Puedes usar:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Paso 6: Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. Espera 5-10 minutos (la primera vez puede tardar más)
4. Una vez completado, verás el estado "Live" en verde

## Paso 7: Obtener la URL de tu Backend

Una vez desplegado, Render te dará una URL como:
```
https://prestamos-backend.onrender.com
```

Esta es la URL que usarás en tu app móvil.

## Paso 8: Probar el Backend

Prueba que funcione visitando:
```
https://tu-app.onrender.com/api/health
```

O prueba el login:
```bash
curl -X POST https://tu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"admin123"}'
```

## Paso 9: Actualizar la App Móvil

Ahora actualiza `frontend/src/config/api.js`:

```javascript
const API_URL = 'https://tu-app.onrender.com/api';
```

## Notas Importantes sobre el Plan Gratuito de Render

### ⚠️ Limitaciones del Plan Gratuito:

1. **Inactividad**: El servicio se "duerme" después de 15 minutos de inactividad
2. **Primer Request**: Cuando está dormido, el primer request puede tardar 30-60 segundos
3. **Horas mensuales**: 750 horas gratis al mes (suficiente para un servicio)

### Soluciones:

**Opción 1: Aceptar el delay** (Recomendado para empezar)
- Es gratis
- Funciona bien para apps con pocos usuarios
- Solo el primer request es lento

**Opción 2: Mantener el servicio activo** (Gratis)
- Usa un servicio como UptimeRobot (https://uptimerobot.com)
- Configura un ping cada 14 minutos a tu API
- Esto mantiene el servicio despierto

**Opción 3: Plan de pago** ($7/mes)
- Sin límites de inactividad
- Siempre activo
- Más recursos

## Configuración de UptimeRobot (Opcional)

Para mantener tu servicio activo gratis:

1. Ve a https://uptimerobot.com
2. Crea una cuenta gratuita
3. Crea un nuevo monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Prestamos Backend
   - **URL**: `https://tu-app.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutos (mínimo en plan gratuito)
4. Guarda

Esto hará ping a tu API cada 5 minutos, manteniéndola activa.

## Actualizar el Backend

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Render detectará el push y desplegará automáticamente la nueva versión.

## Ver Logs en Render

1. Ve a tu servicio en el dashboard de Render
2. Haz clic en la pestaña **"Logs"**
3. Aquí verás todos los logs de tu aplicación en tiempo real

## Solución de Problemas

### Error: "Build failed"
- Revisa los logs en Render
- Verifica que `backend/package.json` tenga el script "start"
- Asegúrate de que Root Directory sea "backend"

### Error: "Cannot connect to database"
- Verifica que las variables de entorno estén correctas
- Asegúrate de que Supabase permita conexiones desde cualquier IP
- Revisa que DATABASE_URL esté correcta

### Error: "Application failed to respond"
- Verifica que el PORT sea 3000 o use process.env.PORT
- Revisa los logs para ver errores específicos

### El servicio está lento
- Es normal en el plan gratuito después de inactividad
- Considera usar UptimeRobot para mantenerlo activo
- O actualiza al plan de pago

## Comandos Útiles

```bash
# Ver logs en tiempo real (desde tu terminal)
# Necesitas instalar Render CLI
npm install -g @render/cli
render login
render logs -f

# Reiniciar el servicio manualmente
# Desde el dashboard de Render, haz clic en "Manual Deploy" > "Clear build cache & deploy"
```

## Checklist Final

- [ ] Código subido a GitHub
- [ ] Web Service creado en Render
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET cambiado por uno seguro
- [ ] Servicio desplegado y en estado "Live"
- [ ] URL del backend obtenida
- [ ] Backend probado (endpoint /api/health)
- [ ] URL actualizada en frontend/src/config/api.js
- [ ] (Opcional) UptimeRobot configurado

## Próximo Paso

Una vez que tu backend esté funcionando en Render, continúa con la guía `GUIA_GENERAR_APK.md` para generar el APK de tu app móvil.
