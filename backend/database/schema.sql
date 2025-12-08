-- Base de datos para sistema de préstamos
CREATE DATABASE IF NOT EXISTS prestamos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE prestamos_db;

-- Tabla de usuarios (admin y cobradores)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cobrador') NOT NULL DEFAULT 'cobrador',
  foto_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  email VARCHAR(100),
  foto_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de préstamos
CREATE TABLE prestamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  cobrador_id INT,
  monto_prestado DECIMAL(10, 2) NOT NULL,
  tasa_interes DECIMAL(5, 2) NOT NULL DEFAULT 0,
  monto_total DECIMAL(10, 2) NOT NULL,
  numero_cuotas INT NOT NULL,
  monto_cuota DECIMAL(10, 2) NOT NULL,
  frecuencia_pago ENUM('diario', 'semanal', 'quincenal', 'mensual') NOT NULL DEFAULT 'mensual',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('activo', 'pagado', 'vencido', 'cancelado') NOT NULL DEFAULT 'activo',
  firma_cliente LONGTEXT,
  notas TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (cobrador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de cuotas
CREATE TABLE cuotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prestamo_id INT NOT NULL,
  numero_cuota INT NOT NULL,
  monto_cuota DECIMAL(10, 2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto_pagado DECIMAL(10, 2) DEFAULT 0,
  estado ENUM('pendiente', 'pagada', 'vencida', 'parcial') NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE CASCADE
);

-- Tabla de pagos
CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuota_id INT NOT NULL,
  prestamo_id INT NOT NULL,
  cobrador_id INT,
  monto DECIMAL(10, 2) NOT NULL,
  fecha_pago DATE NOT NULL,
  tipo_pago ENUM('efectivo', 'transferencia', 'cheque', 'otro') NOT NULL DEFAULT 'efectivo',
  referencia VARCHAR(100),
  notas TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuota_id) REFERENCES cuotas(id) ON DELETE CASCADE,
  FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE CASCADE,
  FOREIGN KEY (cobrador_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_prestamos_cliente ON prestamos(cliente_id);
CREATE INDEX idx_prestamos_cobrador ON prestamos(cobrador_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_cuotas_prestamo ON cuotas(prestamo_id);
CREATE INDEX idx_cuotas_estado ON cuotas(estado);
CREATE INDEX idx_pagos_cuota ON pagos(cuota_id);
CREATE INDEX idx_pagos_prestamo ON pagos(prestamo_id);
