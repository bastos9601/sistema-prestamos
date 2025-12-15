-- Schema PostgreSQL para Sistema de Préstamos
-- Compatible con Heroku PostgreSQL

-- Eliminar tablas si existen
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS cuotas CASCADE;
DROP TABLE IF EXISTS prestamos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;

-- Tabla de usuarios (administradores y cobradores)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'cobrador')),
  telefono VARCHAR(20),
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  cedula VARCHAR(20) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  email VARCHAR(100),
  foto_url TEXT,
  cobrador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  creado_por INTEGER REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de préstamos
CREATE TABLE prestamos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  monto_prestado DECIMAL(10,2) NOT NULL,
  interes_porcentaje DECIMAL(5,2) NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  numero_cuotas INTEGER NOT NULL,
  monto_cuota DECIMAL(10,2) NOT NULL,
  frecuencia_pago VARCHAR(20) NOT NULL CHECK (frecuencia_pago IN ('diario', 'semanal', 'quincenal', 'mensual')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'vencido', 'cancelado')),
  cobrador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  observaciones TEXT,
  creado_por INTEGER REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuotas
CREATE TABLE cuotas (
  id SERIAL PRIMARY KEY,
  prestamo_id INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  fecha_pago TIMESTAMP,
  monto_pagado DECIMAL(10,2) DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  cuota_id INTEGER NOT NULL REFERENCES cuotas(id) ON DELETE CASCADE,
  prestamo_id INTEGER NOT NULL REFERENCES prestamos(id) ON DELETE CASCADE,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque')),
  referencia VARCHAR(100),
  observaciones TEXT,
  cobrador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  firma_url TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sistema
CREATE TABLE configuracion (
  id SERIAL PRIMARY KEY,
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_clientes_cobrador ON clientes(cobrador_id);
CREATE INDEX idx_clientes_activo ON clientes(activo);
CREATE INDEX idx_prestamos_cliente ON prestamos(cliente_id);
CREATE INDEX idx_prestamos_cobrador ON prestamos(cobrador_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_cuotas_prestamo ON cuotas(prestamo_id);
CREATE INDEX idx_cuotas_estado ON cuotas(estado);
CREATE INDEX idx_cuotas_fecha ON cuotas(fecha_vencimiento);
CREATE INDEX idx_pagos_cuota ON pagos(cuota_id);
CREATE INDEX idx_pagos_prestamo ON pagos(prestamo_id);
CREATE INDEX idx_pagos_cliente ON pagos(cliente_id);
CREATE INDEX idx_pagos_cobrador ON pagos(cobrador_id);
CREATE INDEX idx_pagos_fecha ON pagos(creado_en);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamp automáticamente
CREATE TRIGGER trigger_usuarios_timestamp
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_clientes_timestamp
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_prestamos_timestamp
  BEFORE UPDATE ON prestamos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_cuotas_timestamp
  BEFORE UPDATE ON cuotas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_configuracion_timestamp
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
  ('nombre_empresa', 'Sistema de Préstamos', 'Nombre de la empresa'),
  ('logo_url', '', 'URL del logo de la empresa'),
  ('moneda', 'RD$', 'Símbolo de la moneda'),
  ('tasa_interes_default', '10', 'Tasa de interés por defecto (%)');

-- Comentarios en las tablas
COMMENT ON TABLE usuarios IS 'Usuarios del sistema (administradores y cobradores)';
COMMENT ON TABLE clientes IS 'Clientes que solicitan préstamos';
COMMENT ON TABLE prestamos IS 'Préstamos otorgados a clientes';
COMMENT ON TABLE cuotas IS 'Cuotas de cada préstamo';
COMMENT ON TABLE pagos IS 'Registro de pagos realizados';
COMMENT ON TABLE configuracion IS 'Configuración general del sistema';
