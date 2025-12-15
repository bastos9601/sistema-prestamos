# Guía para Generar APK de la App de Préstamos

## Requisitos Previos

1. **Backend desplegado en internet** (Heroku, Koyeb, Railway, etc.)
2. **Cuenta de Expo** (gratuita): https://expo.dev/signup
3. **Node.js instalado**

## Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

## Paso 2: Iniciar Sesión en Expo

```bash
cd frontend
eas login
```

## Paso 3: Configurar el Proyecto

1. Crear/actualizar el archivo `frontend/src/config/api.js`:

```javascript
// Cambiar la URL local por tu URL de producción
const API_URL = 'https://tu-backend-en-produccion.com/api';
```

2. Actualizar `frontend/app.json` con información correcta:
   - Nombre de la app
   - Versión
   - Package name único

## Paso 4: Configurar EAS Build

Si no tienes configurado EAS, ejecuta:

```bash
eas build:configure
```

Esto creará/actualizará el archivo `eas.json`.

## Paso 5: Generar el APK

Para generar un APK que puedas compartir directamente:

```bash
eas build -p android --profile preview
```

Este comando:
- Genera un APK (no AAB)
- No requiere Google Play Store
- Puedes compartirlo directamente

## Paso 6: Descargar el APK

Una vez que termine el build (puede tardar 10-20 minutos):
1. EAS te dará un link para descargar el APK
2. También puedes verlo en: https://expo.dev/accounts/[tu-usuario]/projects/prestamos-app/builds

## Paso 7: Compartir el APK

1. Descarga el APK desde el link de EAS
2. Compártelo por WhatsApp, Drive, Dropbox, etc.
3. Los usuarios deben:
   - Habilitar "Instalar apps de fuentes desconocidas" en Android
   - Instalar el APK

## Configuración Recomendada para Producción

### frontend/src/config/api.js

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de producción de tu backend
const API_URL = 'https://tu-backend.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentar timeout para conexiones lentas
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores (mantener los que ya tienes)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
    }
    return Promise.reject(error);
  }
);

export default api;
```

### frontend/app.json (actualizar)

```json
{
  "expo": {
    "name": "Sistema de Préstamos",
    "slug": "prestamos-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tuprestamos.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.tuprestamos.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Comandos Útiles

```bash
# Ver el estado de tus builds
eas build:list

# Generar APK de desarrollo (más rápido)
eas build -p android --profile preview

# Generar AAB para Google Play Store
eas build -p android --profile production

# Ver logs del build
eas build:view [BUILD_ID]
```

## Solución de Problemas Comunes

### Error: "No se puede conectar al servidor"
- Verifica que la URL del backend esté correcta
- Asegúrate de que el backend esté funcionando
- Verifica que el backend acepte conexiones HTTPS

### Error: "App no se instala"
- Habilita "Fuentes desconocidas" en Android
- Verifica que el package name sea único

### Error: "Build falla"
- Revisa los logs con `eas build:view [BUILD_ID]`
- Asegúrate de que todas las dependencias estén correctas
- Verifica que app.json esté bien configurado

## Notas Importantes

1. **Backend en Producción**: El APK DEBE apuntar a un backend en internet, no a localhost
2. **HTTPS Recomendado**: Usa HTTPS para tu backend en producción
3. **Versiones**: Incrementa el `versionCode` y `version` cada vez que generes un nuevo APK
4. **Permisos**: El APK incluirá los permisos de cámara y almacenamiento que necesita tu app
5. **Tamaño**: El APK pesará aproximadamente 40-60 MB

## Alternativa: Expo Go (Solo para Desarrollo)

Si solo quieres probar rápidamente sin generar APK:

```bash
cd frontend
npm start
```

Escanea el QR con la app Expo Go, pero esto requiere que el backend esté accesible desde el celular.
