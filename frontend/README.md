# Frontend - Sistema de Préstamos

Aplicación móvil con React Native + Expo para gestión de préstamos.

## 🛠️ Tecnologías

- React Native
- Expo
- React Navigation
- React Native Paper
- Axios
- AsyncStorage

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Editar `src/config/api.js` y cambiar la URL del backend:

```javascript
// Para desarrollo con Expo Go, usar la IP de tu computadora
const API_URL = 'http://TU_IP:3000/api';
// Ejemplo: http://192.168.1.100:3000/api
```

Para encontrar tu IP:
- Windows: `ipconfig` (buscar IPv4)
- Mac/Linux: `ifconfig` o `ip addr`

## 🚀 Ejecución

```bash
# Iniciar Expo
npx expo start

# O con npm
npm start
```

Luego:
1. Instalar Expo Go en tu móvil (Android/iOS)
2. Escanear el código QR que aparece en la terminal
3. La app se cargará en tu dispositivo

## 👥 Usuarios de Prueba

- **Admin**: admin@test.com / admin123
- **Cobrador**: cobrador@test.com / cobrador123

## 📱 Funcionalidades

### Administrador
- Ver dashboard con estadísticas
- Crear/editar/eliminar usuarios
- Crear/editar/eliminar clientes
- Crear/editar/eliminar préstamos
- Ver reportes completos
- Asignar préstamos a cobradores

### Cobrador
- Ver dashboard personal
- Ver lista de clientes asignados
- Ver cuotas pendientes por cliente
- Registrar pagos
- Ver historial de pagos

## 🏗️ Construcción de APK

### Opción 1: Build Local (APK)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Construir APK para Android
eas build --platform android --profile preview
```

El APK se descargará automáticamente cuando esté listo.

### Opción 2: Build de Producción

```bash
# Para Google Play Store
eas build --platform android --profile production

# Para App Store (iOS)
eas build --platform ios --profile production
```

## 📂 Estructura del Proyecto

```
frontend/
├── src/
│   ├── config/          # Configuración (API)
│   ├── context/         # Context API (Auth)
│   ├── navigation/      # Navegación
│   ├── screens/         # Pantallas
│   │   ├── admin/       # Pantallas de admin
│   │   └── cobrador/    # Pantallas de cobrador
│   └── components/      # Componentes reutilizables
├── App.js               # Componente principal
└── package.json
```

## 🔧 Solución de Problemas

### Error de conexión al backend
- Verificar que el backend esté corriendo
- Verificar que la IP en `api.js` sea correcta
- Verificar que el móvil y la PC estén en la misma red WiFi

### Expo Go no carga la app
- Verificar que Expo esté corriendo (`npx expo start`)
- Limpiar caché: `npx expo start -c`
- Reinstalar dependencias: `rm -rf node_modules && npm install`

### Errores de build
- Verificar que tengas cuenta en Expo
- Ejecutar `eas login` antes de construir
- Verificar que `app.json` esté configurado correctamente
