-- Migración para agregar campo de firma digital a préstamos
USE prestamos_db;

-- Agregar columna firma_cliente si no existe
ALTER TABLE prestamos 
ADD COLUMN IF NOT EXISTS firma_cliente LONGTEXT AFTER estado;
