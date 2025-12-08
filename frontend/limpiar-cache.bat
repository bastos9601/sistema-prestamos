@echo off
echo Limpiando cache de Expo y Metro...
rmdir /s /q .expo 2>nul
rmdir /s /q node_modules\.cache 2>nul
del /q package-lock.json 2>nul
call npm cache clean --force
call npm install
echo.
echo Cache limpiado. Ahora ejecuta: npm start
pause
