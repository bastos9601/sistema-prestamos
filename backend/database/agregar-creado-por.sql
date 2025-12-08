-- Agregar campo creado_por a la tabla clientes
ALTER TABLE clientes 
ADD COLUMN creado_por INT NULL,
ADD CONSTRAINT fk_clientes_creado_por 
FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Actualizar clientes existentes para que sean del admin principal
UPDATE clientes SET creado_por = 1 WHERE creado_por IS NULL;
