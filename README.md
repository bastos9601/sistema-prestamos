# 💰 Sistema de Gestión de Préstamos

Sistema completo para gestión de préstamos con roles de administrador y cobrador. Incluye backend API REST y aplicación móvil multiplataforma.

## 🎯 Características

### Administrador
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de usuarios (admin y cobradores)
- ✅ Gestión de clientes
- ✅ Creación y seguimiento de préstamos
- ✅ Asignación de préstamos a cobradores
- ✅ Reportes y análisis

### Cobrador
- ✅ Dashboard personal
- ✅ Lista de clientes asignados
- ✅ Visualización de cuotas pendientes
- ✅ Registro de pagos (efectivo, transferencia, cheque)
- ✅ Historial de cobros

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- MySQL
- JWT para autenticación
- bcryptjs para encriptación

### Frontend
- React Native + Expo
- React Navigation
- React Native Paper (Material Design)
- Axios
- AsyncStorage

## 📋 Estructura del Proyecto

```
├── backend/              # API REST
│   ├── src/
│   │   ├── config/      # Configuración de BD
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── middlewares/ # Auth y validación
│   │   └── routes/      # Rutas de la API
│   ├── database/        # Scripts SQL
│   └── scripts/         # Utilidades
├── frontend/            # App móvil
│   └── src/
│       ├── config/      # Configuración API
│       ├── context/     # Context API (Auth)
│       ├── navigation/  # Navegación
│       └── screens/     # Pantallas
└── INSTRUCCIONES.md     # Guía detallada
```

## 🚀 Inicio Rápido (5 minutos)

**Ver guía express:** [`INICIO-RAPIDO.md`](INICIO-RAPIDO.md)

### Requisitos Previos
- Node.js v14+
- MySQL v5.7+
- Expo Go app en tu móvil

### Pasos Básicos

```bash
# 1. Base de datos
mysql -u root -p
CREATE DATABASE prestamos_db;
exit;

# 2. Backend
cd backend
npm install
copy .env.example .env
# Editar .env con tu password MySQL
npm run init-db
npm run dev

# 3. Frontend (en otra terminal)
cd frontend
npm install
# Editar src/config/api.js con tu IP
npx expo start

# 4. Escanear QR con Expo Go en tu móvil
```

## 👥 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@test.com | admin123 |
| Cobrador | cobrador@test.com | cobrador123 |

## 📱 Generar APK

```bash
cd frontend
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| [`INICIO-RAPIDO.md`](INICIO-RAPIDO.md) | ⚡ Guía express de 5 minutos |
| [`INSTRUCCIONES.md`](INSTRUCCIONES.md) | 📖 Instalación paso a paso |
| [`CARACTERISTICAS.md`](CARACTERISTICAS.md) | ✨ Lista completa de funcionalidades |
| [`ESTRUCTURA-PROYECTO.md`](ESTRUCTURA-PROYECTO.md) | 📁 Arquitectura y organización |
| [`FAQ.md`](FAQ.md) | ❓ Preguntas frecuentes |
| [`CHECKLIST-INSTALACION.md`](CHECKLIST-INSTALACION.md) | ✅ Lista de verificación |
| [`RESUMEN-PROYECTO.md`](RESUMEN-PROYECTO.md) | 📊 Resumen completo |
| [`backend/README.md`](backend/README.md) | 🔧 Documentación del API |
| [`frontend/README.md`](frontend/README.md) | 📱 Documentación de la app |

## 🔐 Seguridad

- Autenticación JWT con tokens de 7 días
- Contraseñas hasheadas con bcrypt
- Middleware de autorización por roles
- Validación de entrada en todas las rutas

## 📊 Base de Datos

El sistema incluye las siguientes tablas:
- `usuarios` - Administradores y cobradores
- `clientes` - Clientes que solicitan préstamos
- `prestamos` - Información de préstamos
- `cuotas` - Cuotas de cada préstamo
- `pagos` - Registro de pagos realizados

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario
- `GET /api/auth/perfil` - Obtener perfil

### Usuarios (Admin)
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Préstamos
- `GET /api/prestamos` - Listar préstamos
- `POST /api/prestamos` - Crear préstamo
- `GET /api/prestamos/:id` - Detalle de préstamo
- `GET /api/prestamos/reportes` - Reportes (Admin)

### Pagos
- `POST /api/pagos` - Registrar pago
- `GET /api/pagos/clientes-pendientes` - Clientes con cuotas pendientes
- `GET /api/pagos/cuotas-pendientes/:cliente_id` - Cuotas de un cliente

## 🔧 Solución de Problemas

### Backend no conecta
- Verificar MySQL corriendo
- Verificar credenciales en `.env`
- Ejecutar `npm run crear-usuarios`

### Frontend no conecta
- Verificar IP en `api.js`
- Móvil y PC en misma WiFi
- Backend debe estar corriendo

### Más ayuda
Ver `INSTRUCCIONES.md` para soluciones detalladas

## 📄 Licencia

MIT

## 👨‍💻 Desarrollo

Este proyecto fue creado como sistema completo de gestión de préstamos con arquitectura cliente-servidor, autenticación segura y roles diferenciados.
