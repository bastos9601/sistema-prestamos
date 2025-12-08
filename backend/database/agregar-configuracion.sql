-- Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto
INSERT INTO configuracion (clave, valor) 
VALUES ('nombre_sistema', 'Sistema de Préstamos')
ON DUPLICATE KEY UPDATE valor = valor;
