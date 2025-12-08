# Backend - Sistema de Préstamos

API REST para gestión de préstamos con autenticación JWT.

## 🛠️ Tecnologías

- Node.js + Express
- MySQL
- JWT para autenticación
- bcryptjs para encriptación

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Crear base de datos MySQL:
```sql
CREATE DATABASE prestamos_db;
```

2. Copiar `.env.example` a `.env` y configurar:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=prestamos_db
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=7d
```

3. Ejecutar scripts SQL:
```bash
# Crear tablas
mysql -u root -p prestamos_db < database/schema.sql

# Insertar datos de prueba (opcional)
mysql -u root -p prestamos_db < database/seed.sql
```

## 🚀 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Endpoints

### Autenticación

#### POST /api/auth/registro
Registrar nuevo usuario (requiere token de admin)
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "rol": "cobrador"
}
```

#### POST /api/auth/login
Iniciar sesión
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

#### GET /api/auth/perfil
Obtener perfil del usuario autenticado (requiere token)

### Usuarios (Solo Admin)

#### GET /api/usuarios
Listar todos los usuarios

#### GET /api/usuarios/cobradores
Listar solo cobradores activos

#### GET /api/usuarios/:id
Obtener usuario por ID

#### PUT /api/usuarios/:id
Actualizar usuario

#### DELETE /api/usuarios/:id
Eliminar usuario

### Clientes

#### GET /api/clientes
Listar todos los clientes

#### GET /api/clientes/:id
Obtener cliente por ID

#### POST /api/clientes (Solo Admin)
Crear nuevo cliente
```json
{
  "nombre": "Carlos",
  "apellido": "Pérez",
  "cedula": "001-1234567-8",
  "telefono": "809-555-0001",
  "direccion": "Calle Principal #123",
  "email": "carlos@email.com"
}
```

#### PUT /api/clientes/:id (Solo Admin)
Actualizar cliente

#### DELETE /api/clientes/:id (Solo Admin)
Eliminar cliente

### Préstamos

#### GET /api/prestamos
Listar préstamos (admin: todos, cobrador: asignados)

#### GET /api/prestamos/:id
Obtener préstamo con cuotas

#### GET /api/prestamos/reportes (Solo Admin)
Obtener estadísticas y reportes

#### POST /api/prestamos (Solo Admin)
Crear nuevo préstamo
```json
{
  "cliente_id": 1,
  "cobrador_id": 2,
  "monto_prestado": 50000,
  "tasa_interes": 10,
  "numero_cuotas": 12,
  "frecuencia_pago": "mensual",
  "fecha_inicio": "2024-01-01",
  "notas": "Préstamo para negocio"
}
```

#### PUT /api/prestamos/:id (Solo Admin)
Actualizar préstamo

#### DELETE /api/prestamos/:id (Solo Admin)
Eliminar préstamo

### Pagos

#### POST /api/pagos
Registrar un pago
```json
{
  "cuota_id": 1,
  "prestamo_id": 1,
  "monto": 4583.33,
  "fecha_pago": "2024-02-01",
  "tipo_pago": "efectivo",
  "referencia": "TRANS-001",
  "notas": "Pago completo"
}
```

#### GET /api/pagos/prestamo/:prestamo_id
Obtener pagos de un préstamo

#### GET /api/pagos/cuotas-pendientes/:cliente_id
Obtener cuotas pendientes de un cliente

#### GET /api/pagos/clientes-pendientes
Obtener clientes con cuotas pendientes (para cobradores)

## 🔐 Autenticación

Todas las rutas (excepto login y registro) requieren token JWT en el header:
```
Authorization: Bearer <token>
```

## 👥 Roles

- **admin**: Acceso completo al sistema
- **cobrador**: Ver clientes asignados y registrar pagos
