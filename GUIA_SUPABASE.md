# 🚀 Guía para Configurar Supabase

## Paso 1: Crear tu proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: prestamos-app (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana a tu ubicación
5. Haz clic en "Create new project" y espera 1-2 minutos

## Paso 2: Obtener la cadena de conexión

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **Database**
3. Busca la sección **Connection string**
4. Selecciona **URI** (no Pooler)
5. Copia la cadena que se ve así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 1

## Paso 3: Configurar tu archivo .env

1. Abre el archivo `backend/.env`
2. Reemplaza la línea `DATABASE_URL` con tu cadena de conexión:
   ```env
   DATABASE_URL=postgresql://postgres:tu-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
3. También actualiza los otros valores si lo deseas (opcional):
   ```env
   DB_HOST=db.xxxxxxxxxxxxx.supabase.co
   DB_USER=postgres
   DB_PASSWORD=tu-password
   DB_NAME=postgres
   DB_PORT=5432
   ```

## Paso 4: Inicializar la base de datos

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
cd backend
npm run init-supabase
```

Este comando:
- ✅ Creará todas las tablas necesarias
- ✅ Configurará índices y triggers
- ✅ Creará un usuario administrador por defecto
  - Email: `admin@prestamos.com`
  - Password: `admin123`

## Paso 5: Verificar la instalación

1. Ve a tu proyecto en Supabase
2. Haz clic en **Table Editor** en el menú lateral
3. Deberías ver todas estas tablas:
   - usuarios
   - clientes
   - prestamos
   - cuotas
   - pagos
   - configuracion

## Paso 6: Iniciar tu aplicación

```bash
# En la carpeta backend
npm start
```

Deberías ver el mensaje:
```
✅ Conexión a PostgreSQL (Supabase) exitosa
🚀 Servidor corriendo en puerto 3000
```

## 🎉 ¡Listo!

Tu aplicación ahora está conectada a Supabase. Tu base de datos está en la nube y es accesible desde cualquier lugar.

## 📱 Actualizar el Frontend

Si tu backend está desplegado en la nube, actualiza `frontend/src/config/api.js`:

```javascript
const API_URL = 'https://tu-backend-url.com/api';
```

## 🔒 Seguridad

**IMPORTANTE**: Nunca subas tu archivo `.env` a GitHub. Ya está en `.gitignore`, pero verifica que contenga:

```
.env
.env.local
.env.*.local
```

## 💡 Consejos

1. **Backups automáticos**: Supabase hace backups diarios automáticamente
2. **Monitoreo**: Puedes ver las consultas en tiempo real en el Dashboard de Supabase
3. **Límites gratuitos**: 
   - 500 MB de base de datos
   - 1 GB de transferencia
   - 2 GB de almacenamiento de archivos
4. **Escalabilidad**: Puedes actualizar a un plan de pago cuando lo necesites

## 🆘 Solución de problemas

### Error: "Connection refused"
- Verifica que tu `DATABASE_URL` sea correcta
- Asegúrate de que tu proyecto Supabase esté activo

### Error: "Password authentication failed"
- Verifica que la contraseña en `DATABASE_URL` sea correcta
- No uses caracteres especiales sin codificar en la URL

### Error: "SSL required"
- Ya está configurado en `database.js` con `ssl: { rejectUnauthorized: false }`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Supabase en el Dashboard
2. Verifica la documentación: https://supabase.com/docs
3. Revisa que todas las dependencias estén instaladas: `npm install`
