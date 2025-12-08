# ✅ Checklist de Despliegue en Heroku

## 📋 Antes de Empezar

- [ ] Cuenta en Heroku creada (https://signup.heroku.com/)
- [ ] Heroku CLI instalado y funcionando (`heroku --version`)
- [ ] Git instalado (`git --version`)
- [ ] Node.js instalado (`node --version`)
- [ ] Tarjeta de crédito lista (para plan de pago ~$10/mes)

---

## 🔧 Preparación del Backend

### Archivos Necesarios
- [ ] `backend/Procfile` existe
- [ ] `backend/package.json` tiene `engines` configurado
- [ ] `backend/src/config/database-postgres.js` creado
- [ ] `backend/database/schema-postgres.sql` creado
- [ ] `backend/scripts/crear-admin-postgres.js` creado
- [ ] `backend/.env.heroku` revisado

### Dependencias
- [ ] `pg` instalado: `npm install pg`
- [ ] `package.json` actualizado con PostgreSQL

---

## 🚀 Despliegue

### 1. Heroku CLI
- [ ] Login exitoso: `heroku login`
- [ ] CLI funcionando correctamente

### 2. Crear Aplicación
- [ ] App creada: `heroku create nombre-app`
- [ ] PostgreSQL agregado: `heroku addons:create heroku-postgresql:essential-0`
- [ ] DATABASE_URL verificado: `heroku config:get DATABASE_URL`

### 3. Variables de Entorno
- [ ] `JWT_SECRET` configurado
- [ ] `JWT_EXPIRES_IN` configurado
- [ ] `NODE_ENV=production` configurado
- [ ] `CLOUDINARY_CLOUD_NAME` configurado
- [ ] `CLOUDINARY_API_KEY` configurado
- [ ] `CLOUDINARY_API_SECRET` configurado

Verificar todas:
```bash
heroku config
```

### 4. Git y Deploy
- [ ] Git inicializado: `git init`
- [ ] Archivos agregados: `git add .`
- [ ] Commit creado: `git commit -m "Deploy a Heroku"`
- [ ] Remote agregado: `heroku git:remote -a nombre-app`
- [ ] Deploy exitoso: `git push heroku main`

### 5. Base de Datos
- [ ] Conectado a PostgreSQL: `heroku pg:psql`
- [ ] Schema ejecutado (copiar contenido de `schema-postgres.sql`)
- [ ] Tablas creadas correctamente
- [ ] Desconectado: `\q`

### 6. Usuarios Iniciales
- [ ] Script ejecutado: `heroku run npm run crear-usuarios-postgres`
- [ ] Admin creado: `admin@test.com / admin123`
- [ ] Cobrador creado: `cobrador@test.com / cobrador123`

---

## 🧪 Verificación

### Backend
- [ ] App abierta: `heroku open`
- [ ] Logs sin errores: `heroku logs --tail`
- [ ] Endpoint de salud funciona: `https://tu-app.herokuapp.com/`
- [ ] Login funciona: `POST /api/auth/login`

### Base de Datos
- [ ] Conexión exitosa
- [ ] Tablas creadas
- [ ] Usuarios existen
- [ ] Índices creados
- [ ] Triggers funcionando

### Pruebas de API
```bash
# Probar login
curl -X POST https://tu-app.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

- [ ] Login devuelve token
- [ ] Token es válido
- [ ] Endpoints protegidos funcionan

---

## 📱 Actualizar Frontend

### Configuración
- [ ] `frontend/src/config/api.js` actualizado con URL de Heroku
- [ ] URL correcta: `https://tu-app.herokuapp.com/api`
- [ ] Sin barra final en la URL

### Pruebas
- [ ] App móvil conecta con backend
- [ ] Login funciona desde la app
- [ ] Datos se cargan correctamente
- [ ] Imágenes se suben a Cloudinary

### Build
- [ ] APK generado con nueva URL
- [ ] APK probado en dispositivo real
- [ ] Todas las funciones operativas

---

## 🔍 Comandos de Verificación

```bash
# Ver información de la app
heroku info

# Ver logs en tiempo real
heroku logs --tail

# Ver variables de entorno
heroku config

# Ver info de PostgreSQL
heroku pg:info

# Conectar a base de datos
heroku pg:psql

# Ejecutar comando en Heroku
heroku run node --version

# Reiniciar app
heroku restart

# Ver procesos activos
heroku ps

# Abrir app en navegador
heroku open
```

---

## 🆘 Solución de Problemas

### App no inicia
- [ ] Verificar logs: `heroku logs --tail`
- [ ] Verificar Procfile existe
- [ ] Verificar `package.json` tiene `engines`
- [ ] Verificar `start` script en `package.json`

### Error de base de datos
- [ ] Verificar DATABASE_URL: `heroku config:get DATABASE_URL`
- [ ] Verificar conexión: `heroku pg:info`
- [ ] Verificar schema ejecutado
- [ ] Verificar SSL configurado en código

### Error de variables
- [ ] Listar todas: `heroku config`
- [ ] Verificar JWT_SECRET existe
- [ ] Verificar Cloudinary configurado
- [ ] Verificar NODE_ENV=production

### Error 503 / App no responde
- [ ] Verificar dynos activos: `heroku ps`
- [ ] Reiniciar app: `heroku restart`
- [ ] Verificar plan de pago activo
- [ ] Verificar logs de error

---

## 💰 Costos

- [ ] Plan Eco Dynos: $5/mes
- [ ] Essential PostgreSQL: $5/mes
- [ ] **Total estimado: ~$10/mes**
- [ ] Tarjeta de crédito configurada
- [ ] Billing verificado en dashboard

---

## 📊 Monitoreo

### Dashboard Heroku
- [ ] Acceder a: https://dashboard.heroku.com
- [ ] Ver métricas de la app
- [ ] Ver uso de base de datos
- [ ] Ver logs históricos

### Métricas Importantes
- [ ] Response time < 500ms
- [ ] Error rate < 1%
- [ ] Database connections < 10
- [ ] Memory usage < 512MB

---

## 🎯 Post-Despliegue

### Seguridad
- [ ] Cambiar JWT_SECRET por uno seguro
- [ ] Cambiar contraseñas de usuarios de prueba
- [ ] Configurar CORS correctamente
- [ ] Habilitar SSL (automático en Heroku)

### Backup
- [ ] Configurar backups automáticos de DB
- [ ] Probar restauración de backup
- [ ] Documentar proceso de backup

### Documentación
- [ ] URL de producción documentada
- [ ] Credenciales guardadas en lugar seguro
- [ ] Proceso de deploy documentado
- [ ] Contactos de soporte anotados

---

## ✅ Checklist Final

- [ ] ✅ Backend desplegado y funcionando
- [ ] ✅ Base de datos PostgreSQL operativa
- [ ] ✅ Usuarios iniciales creados
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Frontend actualizado con URL de producción
- [ ] ✅ APK generado y probado
- [ ] ✅ Todas las funciones operativas
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Monitoreo configurado
- [ ] ✅ Backup configurado

---

## 🎉 ¡Felicitaciones!

Tu aplicación está en producción en Heroku. 

**URLs Importantes:**
- Dashboard: https://dashboard.heroku.com
- Tu App: https://tu-app.herokuapp.com
- Logs: `heroku logs --tail`
- Database: `heroku pg:psql`

**Próximos Pasos:**
1. Monitorear logs regularmente
2. Configurar alertas
3. Hacer backups periódicos
4. Actualizar dependencias
5. Escalar según necesidad

---

**📚 Documentación:**
- Heroku Docs: https://devcenter.heroku.com/
- PostgreSQL: https://devcenter.heroku.com/articles/heroku-postgresql
- CLI: https://devcenter.heroku.com/articles/heroku-cli

**🆘 Soporte:**
- Heroku Support: https://help.heroku.com/
- Community: https://stackoverflow.com/questions/tagged/heroku
