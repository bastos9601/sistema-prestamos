-- Migración para agregar campo de firma digital a préstamos (PostgreSQL)

-- Agregar columna firma_cliente si no existe
ALTER TABLE prestamos 
ADD COLUMN IF NOT EXISTS firma_cliente TEXT;

-- Comentario en la columna
COMMENT ON COLUMN prestamos.firma_cliente IS 'URL o base64 de la firma digital del cliente en el pagaré';
