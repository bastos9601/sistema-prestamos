# 🚀 Pasos Rápidos para APK

## Opción Más Fácil (30 minutos)

### 1. Desplegar Backend en Railway (10 min)

```bash
# En la carpeta backend
cd backend
npm install -g @railway/cli
railway login
railway init
railway add mysql
railway up
```

Copia la URL que te da Railway (ej: `https://tu-app.railway.app`)

### 2. Importar Base de Datos (5 min)

```bash
# Conectar a MySQL de Railway
railway connect mysql

# Dentro de MySQL, ejecutar:
source database/schema.sql
source database/seed.sql
source database/agregar-creado-por.sql
source database/agregar-firma.sql
source database/agregar-foto-cliente.sql
source database/agregar-foto-usuario.sql
source database/agregar-configuracion.sql
exit
```

### 3. Actualizar Frontend (2 min)

Edita `frontend/src/config/api.js`:

```javascript
// Cambia esta línea:
const API_URL = 'http://localhost:3000/api';

// Por esta (con tu URL de Railway):
const API_URL = 'https://tu-app.railway.app/api';
```

### 4. Crear APK (10 min)

```bash
cd frontend
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

Espera a que termine (5-10 min) y descarga el APK del link que te da.

### 5. Instalar en Celular (3 min)

1. Transfiere el APK a tu celular
2. Abre el archivo
3. Habilita "Instalar apps desconocidas"
4. Instala

¡Listo! 🎉

---

## Usuarios de Prueba

- **Admin**: admin@test.com / admin123
- **Cobrador**: cobrador@test.com / cobrador123

---

## Si algo falla:

1. **Backend no responde**: Verifica que Railway esté corriendo
2. **No se conecta**: Verifica la URL en `api.js`
3. **APK no instala**: Habilita instalación de apps desconocidas
4. **Error de base de datos**: Verifica que importaste todos los SQL

---

## Alternativa Sin Cuenta Expo

Si no quieres crear cuenta en Expo:

```bash
cd frontend
npx expo prebuild
cd android
./gradlew assembleRelease
```

APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

(Requiere Android Studio instalado)
