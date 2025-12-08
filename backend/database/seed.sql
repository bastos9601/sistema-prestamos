-- Datos de prueba para el sistema de préstamos
USE prestamos_db;

-- Usuarios de prueba (password: admin123 y cobrador123)
-- Los hashes se generarán al ejecutar el script de inicialización
-- Por ahora, usar contraseñas simples que se deben cambiar en producción
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador Principal', 'admin@test.com', '$2a$10$rOZxHQHQHQHQHQHQHQHQHuJ3qZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'admin'),
('Juan Cobrador', 'cobrador@test.com', '$2a$10$rOZxHQHQHQHQHQHQHQHQHuJ3qZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'cobrador'),
('María Cobrador', 'maria@test.com', '$2a$10$rOZxHQHQHQHQHQHQHQHQHuJ3qZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'cobrador');

-- Clientes de prueba
INSERT INTO clientes (nombre, apellido, cedula, telefono, direccion, email) VALUES
('Carlos', 'Pérez', '001-1234567-8', '809-555-0001', 'Calle Principal #123, Santo Domingo', 'carlos.perez@email.com'),
('Ana', 'García', '001-2345678-9', '809-555-0002', 'Av. Independencia #456, Santiago', 'ana.garcia@email.com'),
('Luis', 'Martínez', '001-3456789-0', '809-555-0003', 'Calle Duarte #789, La Vega', 'luis.martinez@email.com'),
('María', 'Rodríguez', '001-4567890-1', '809-555-0004', 'Av. 27 de Febrero #321, Santo Domingo', 'maria.rodriguez@email.com'),
('Pedro', 'Sánchez', '001-5678901-2', '809-555-0005', 'Calle El Conde #654, Santo Domingo', 'pedro.sanchez@email.com');

-- Préstamos de prueba
INSERT INTO prestamos (cliente_id, cobrador_id, monto_prestado, tasa_interes, monto_total, numero_cuotas, monto_cuota, frecuencia_pago, fecha_inicio, fecha_fin, estado) VALUES
(1, 2, 50000.00, 10.00, 55000.00, 12, 4583.33, 'mensual', '2024-01-01', '2024-12-31', 'activo'),
(2, 2, 30000.00, 8.00, 32400.00, 6, 5400.00, 'mensual', '2024-02-01', '2024-07-31', 'activo'),
(3, 3, 20000.00, 12.00, 22400.00, 8, 2800.00, 'quincenal', '2024-03-01', '2024-06-30', 'activo'),
(4, 2, 100000.00, 15.00, 115000.00, 24, 4791.67, 'mensual', '2023-06-01', '2025-05-31', 'activo'),
(5, 3, 15000.00, 10.00, 16500.00, 10, 1650.00, 'semanal', '2024-04-01', '2024-06-10', 'activo');

-- Cuotas para el primer préstamo (12 cuotas mensuales)
INSERT INTO cuotas (prestamo_id, numero_cuota, monto_cuota, fecha_vencimiento, monto_pagado, estado) VALUES
(1, 1, 4583.33, '2024-02-01', 4583.33, 'pagada'),
(1, 2, 4583.33, '2024-03-01', 4583.33, 'pagada'),
(1, 3, 4583.33, '2024-04-01', 4583.33, 'pagada'),
(1, 4, 4583.33, '2024-05-01', 2000.00, 'parcial'),
(1, 5, 4583.33, '2024-06-01', 0, 'pendiente'),
(1, 6, 4583.33, '2024-07-01', 0, 'pendiente'),
(1, 7, 4583.33, '2024-08-01', 0, 'pendiente'),
(1, 8, 4583.33, '2024-09-01', 0, 'pendiente'),
(1, 9, 4583.33, '2024-10-01', 0, 'pendiente'),
(1, 10, 4583.33, '2024-11-01', 0, 'pendiente'),
(1, 11, 4583.33, '2024-12-01', 0, 'pendiente'),
(1, 12, 4583.33, '2024-12-31', 0, 'pendiente');

-- Pagos registrados
INSERT INTO pagos (cuota_id, prestamo_id, cobrador_id, monto, fecha_pago, tipo_pago, referencia) VALUES
(1, 1, 2, 4583.33, '2024-02-01', 'efectivo', NULL),
(2, 1, 2, 4583.33, '2024-03-01', 'transferencia', 'TRANS-001'),
(3, 1, 2, 4583.33, '2024-04-01', 'efectivo', NULL),
(4, 1, 2, 2000.00, '2024-05-15', 'efectivo', NULL);
