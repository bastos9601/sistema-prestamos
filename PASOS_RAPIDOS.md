# Pasos Rápidos: De Código a APK

## 🎯 Objetivo
Tener tu app de préstamos funcionando en celulares Android con la base de datos completa.

## 📋 Resumen de Pasos

### PARTE 1: Desplegar Backend en Render (30 minutos)

1. **Subir código a GitHub**
   ```bash
   git add .
   git commit -m "Preparar para producción"
   git push
   ```

2. **Crear cuenta en Render**
   - Ve a https://render.com
   - Regístrate con GitHub

3. **Crear Web Service**
   - New + → Web Service
   - Conecta tu repositorio
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Agregar Variables de Entorno** (en Render)
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres.ifoqjhzjyvmubduelrlp:OKS5oZgp9mhowB5s@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   DB_USER=postgres
   DB_PASSWORD=9YqxlFJ6ViXXLKg8
   DB_NAME=postgres
   DB_PORT=6543
   JWT_SECRET=tu_clave_secreta_muy_segura_cambiala
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=dp1dzunfp
   CLOUDINARY_API_KEY=258478459326466
   CLOUDINARY_API_SECRET=lnHcXW--2xkJDd27CsYpXxlxaDk
   ```

5. **Esperar despliegue** (5-10 minutos)

6. **Copiar URL** (ejemplo: `https://prestamos-backend.onrender.com`)

### PARTE 2: Actualizar Frontend (5 minutos)

1. **Editar `frontend/src/config/api.js`**
   ```javascript
   const API_URL = 'https://TU-URL-DE-RENDER.onrender.com/api';
   ```

2. **Guardar cambios**
   ```bash
   git add .
   git commit -m "Actualizar URL de producción"
   git push
   ```

### PARTE 3: Generar APK con EAS (40 minutos)

1. **Instalar EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Iniciar sesión**
   ```bash
   cd frontend
   eas login
   ```

3. **Configurar proyecto** (si es primera vez)
   ```bash
   eas build:configure
   ```

4. **Generar APK**
   ```bash
   eas build -p android --profile preview
   ```

5. **Esperar build** (10-20 minutos)
   - EAS te dará un link para seguir el progreso
   - También puedes ver en: https://expo.dev

6. **Descargar APK**
   - Cuando termine, descarga el APK desde el link

### PARTE 4: Compartir APK (5 minutos)

1. **Compartir archivo**
   - Sube el APK a Google Drive, Dropbox, o envía por WhatsApp

2. **Instrucciones para usuarios**
   - Descargar el APK
   - Habilitar "Instalar apps de fuentes desconocidas"
   - Instalar el APK
   - ¡Listo!

## ⏱️ Tiempo Total Estimado
- Primera vez: ~1.5 horas
- Actualizaciones futuras: ~30 minutos

## 📱 Resultado Final
- ✅ App instalable en cualquier Android
- ✅ Conectada a tu base de datos en Supabase
- ✅ Backend funcionando 24/7 en Render
- ✅ Puedes compartir con quien quieras

## 🔄 Para Actualizar la App Después

1. Hacer cambios en el código
2. Subir a GitHub: `git push`
3. Si cambios en backend: Render despliega automáticamente
4. Si cambios en frontend: Generar nuevo APK con `eas build`
5. Compartir nuevo APK

## 💡 Consejos

- **Plan gratuito de Render**: El servicio se duerme después de 15 min de inactividad. El primer request será lento.
- **Solución**: Usa UptimeRobot (gratis) para mantenerlo activo
- **Versiones**: Incrementa la versión en `app.json` cada vez que generes un nuevo APK
- **Testing**: Prueba el backend antes de generar el APK visitando `https://tu-url.onrender.com/api/health`

## 📚 Guías Detalladas

- `GUIA_DESPLEGAR_RENDER.md` - Todos los detalles de Render
- `GUIA_GENERAR_APK.md` - Todos los detalles de EAS Build

## ❓ ¿Problemas?

1. **Backend no responde**: Revisa logs en Render
2. **Build falla**: Revisa logs en expo.dev
3. **App no conecta**: Verifica la URL en `api.js`
4. **APK no instala**: Habilita "Fuentes desconocidas" en Android
