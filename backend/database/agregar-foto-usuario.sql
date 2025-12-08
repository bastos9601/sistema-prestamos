-- Migración para agregar campo de foto a usuarios
USE prestamos_db;

-- Agregar columna foto_url si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500) AFTER rol;
