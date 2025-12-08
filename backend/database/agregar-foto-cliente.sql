-- Migración para agregar campo de foto a clientes
USE prestamos_db;

-- Agregar columna foto_url si no existe
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500) AFTER email;
