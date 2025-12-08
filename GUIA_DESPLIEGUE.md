# 📱 Guía de Despliegue - Sistema de Préstamos

## Paso 1: Desplegar el Backend

### Opción Recomendada: Railway

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Regístrate con GitHub

2. **Desplegar Backend**
   ```bash
   cd backend
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. **Agregar MySQL**
   ```bash
   railway add mysql
   ```

4. **Configurar Variables de Entorno**
   En el dashboard de Railway, agrega:
   ```
   DB_HOST=<host de railway>
   DB_USER=<usuario de railway>
   DB_PASSWORD=<password de railway>
   DB_NAME=<nombre de la base de datos>
   DB_PORT=3306
   JWT_SECRET=tu_secreto_super_seguro_aqui
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   PORT=3000
   ```

5. **Importar Base de Datos**
   ```bash
   # Conectarse a la base de datos de Railway
   railway connect mysql
   
   # Ejecutar scripts SQL
   source database/schema.sql
   source database/seed.sql
   source database/agregar-creado-por.sql
   source database/agregar-firma.sql
   source database/agregar-foto-cliente.sql
   source database/agregar-foto-usuario.sql
   source database/agregar-configuracion.sql
   ```

6. **Obtener URL del Backend**
   - En Railway dashboard, copia la URL pública
   - Ejemplo: `https://tu-app.railway.app`

---

## Paso 2: Configurar Frontend para Producción

1. **Actualizar URL del API**
   
   Edita `frontend/src/config/api.js`:
   ```javascript
   const API_URL = 'https://tu-app.railway.app/api';
   ```

2. **Verificar app.json**
   
   Asegúrate que `frontend/app.json` tenga:
   ```json
   {
     "expo": {
       "name": "Sistema de Préstamos",
       "slug": "sistema-prestamos",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#6200ee"
       },
       "android": {
         "package": "com.tuprestamos.app",
         "versionCode": 1,
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#6200ee"
         },
         "permissions": [
           "CAMERA",
           "READ_EXTERNAL_STORAGE",
           "WRITE_EXTERNAL_STORAGE"
         ]
       }
     }
   }
   ```

---

## Paso 3: Crear el APK

### Método 1: EAS Build (Recomendado)

1. **Instalar EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login en Expo**
   ```bash
   cd frontend
   eas login
   ```

3. **Configurar EAS**
   ```bash
   eas build:configure
   ```

4. **Crear APK**
   ```bash
   # Para APK (instalación directa)
   eas build -p android --profile preview
   
   # Para AAB (Google Play Store)
   eas build -p android --profile production
   ```

5. **Descargar APK**
   - El comando te dará un link
   - Descarga el APK
   - Transfiere a tu celular
   - Instala (habilita "Instalar apps desconocidas")

### Método 2: Build Local (Sin cuenta Expo)

1. **Instalar Android Studio**
   - Descarga de https://developer.android.com/studio

2. **Configurar Variables de Entorno**
   ```bash
   # Windows
   set ANDROID_HOME=C:\Users\TuUsuario\AppData\Local\Android\Sdk
   set PATH=%PATH%;%ANDROID_HOME%\platform-tools
   
   # Linux/Mac
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Generar APK**
   ```bash
   cd frontend
   npx expo prebuild
   cd android
   ./gradlew assembleRelease
   ```

4. **APK estará en:**
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
   ```

---

## Paso 4: Instalar en Celular

1. **Transferir APK**
   - Por cable USB
   - Por WhatsApp
   - Por Google Drive
   - Por correo

2. **Instalar**
   - Abre el APK en el celular
   - Habilita "Instalar apps desconocidas" si es necesario
   - Instala la app

3. **Probar**
   - Abre la app
   - Inicia sesión con:
     - Admin: admin@test.com / admin123
     - Cobrador: cobrador@test.com / cobrador123

---

## Paso 5: Distribución

### Opción A: Compartir APK Directamente
- Sube el APK a Google Drive
- Comparte el link con tus usuarios
- Ellos descargan e instalan

### Opción B: Google Play Store
1. Crear cuenta de desarrollador ($25 único pago)
2. Crear AAB con EAS Build
3. Subir a Play Console
4. Publicar app

### Opción C: Servidor Propio
```bash
# Subir APK a tu servidor
scp app-release.apk usuario@tuservidor.com:/var/www/html/
# Compartir link: https://tuservidor.com/app-release.apk
```

---

## 🔧 Solución de Problemas

### Error: "No se puede conectar al servidor"
- Verifica que el backend esté corriendo
- Verifica la URL en `api.js`
- Verifica que el celular tenga internet

### Error: "Network request failed"
- El backend debe tener HTTPS (Railway lo da automático)
- Verifica CORS en el backend

### APK no instala
- Habilita "Instalar apps desconocidas"
- Verifica que el APK no esté corrupto
- Intenta con otro método de transferencia

---

## 📊 Resumen de Costos

| Servicio | Costo | Límites Gratis |
|----------|-------|----------------|
| Railway | Gratis/$5/mes | 500 horas/mes gratis |
| Render | Gratis/$7/mes | 750 horas/mes gratis |
| PlanetScale | Gratis/$29/mes | 5GB storage gratis |
| Cloudinary | Gratis/$89/mes | 25GB storage gratis |
| EAS Build | Gratis | 30 builds/mes gratis |
| Google Play | $25 único | Ilimitado después |

**Total para empezar: $0 (todo gratis)**

---

## 🎯 Checklist Final

- [ ] Backend desplegado en Railway/Render
- [ ] Base de datos MySQL en la nube
- [ ] Cloudinary configurado
- [ ] URL del backend actualizada en frontend
- [ ] APK generado con EAS Build
- [ ] APK probado en celular
- [ ] Usuarios de prueba funcionando
- [ ] Todas las funciones probadas

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend en Railway
2. Verifica la consola del navegador
3. Prueba las APIs con Postman
4. Verifica las credenciales de la base de datos

¡Tu sistema de préstamos está listo para producción! 🚀
