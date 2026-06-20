-- Carga de datos para la federación de fútbol

USE ticketera;

-- CLIENTES
INSERT INTO cliente (cedula, nombre, apellido, telefono, correo) VALUES
('0102030405', 'Maria', 'Lopez', '0991112233', 'maria.lopez@mail.com'),
('0203040506', 'Juan', 'Perez', '0992223344', 'juan.perez@mail.com'),
('0304050607', 'Ana', 'Gomez', '0993334455', 'ana.gomez@mail.com'),
('0405060708', 'Pedro', 'Martinez', '0994445566', 'pedro.martinez@mail.com'),
('0506070809', 'Luis', 'Ramirez', '0995556677', 'luis.ramirez@mail.com'),
('0607080910', 'Carlos', 'Torres', '0996667788', 'carlos.torres@mail.com');

-- USUARIOS
INSERT INTO usuario (username, password, rol, cedula) VALUES
('0102030405', '0102030405', 'cliente', '0102030405'),
('0203040506', '0203040506', 'cliente', '0203040506'),
('0304050607', '0304050607', 'cliente', '0304050607'),
('0405060708', '0405060708', 'cliente', '0405060708'),
('0506070809', '0506070809', 'cliente', '0506070809'),
('0607080910', '0607080910', 'cliente', '0607080910');

USE federacion;

-- ESTADIOS (Mundial 2026)
INSERT INTO estadio (codigo, nombre, ciudad, capacidad) VALUES
('ES001', 'Estadio Azteca', 'Ciudad de Mexico', 83264),
('ES002', 'MetLife Stadium', 'Nueva York/Nueva Jersey', 82500),
('ES003', 'AT&T Stadium', 'Dallas', 80000),
('ES004', 'Arrowhead Stadium', 'Kansas City', 76416),
('ES005', 'Mercedes-Benz Stadium', 'Atlanta', 71000),
('ES006', 'SoFi Stadium', 'Los Angeles', 70240),
('ES007', 'Hard Rock Stadium', 'Miami', 64767),
('ES008', 'BMO Field', 'Toronto', 30000),
('ES009', 'Estadio BBVA', 'Monterrey', 53500),
('ES010', 'BC Place', 'Vancouver', 54500);

-- PARTIDOS (Simulación Mundial 2026)
INSERT INTO partido_futbol (codigo, equipo_local, equipo_visita, fecha, lugar, estadio_codigo) VALUES
('PF001', 'Mexico', 'Alemania', '2026-06-11 15:00:00', 'Estadio Azteca', 'ES001'),
('PF002', 'Final (Ganador 1)', 'Final (Ganador 2)', '2026-07-19 15:00:00', 'MetLife Stadium', 'ES002'),
('PF003', 'Brasil', 'Suiza', '2026-06-15 19:00:00', 'AT&T Stadium', 'ES003'),
('PF004', 'Francia', 'Colombia', '2026-06-21 17:00:00', 'Arrowhead Stadium', 'ES004'),
('PF005', 'Inglaterra', 'Uruguay', '2026-06-24 16:30:00', 'Mercedes-Benz Stadium', 'ES005'),
('PF006', 'Estados Unidos', 'Gales', '2026-06-12 18:00:00', 'SoFi Stadium', 'ES006'),
('PF007', 'Argentina', 'Ecuador', '2026-06-14 16:00:00', 'Hard Rock Stadium', 'ES007'),
('PF008', 'Canada', 'Croacia', '2026-06-12 21:00:00', 'BMO Field', 'ES008'),
('PF009', 'Espana', 'Italia', '2026-06-18 20:00:00', 'Estadio BBVA', 'ES009'),
('PF010', 'Portugal', 'Corea del Sur', '2026-06-26 18:00:00', 'BC Place', 'ES010');

-- LOCALIDADES POR ESTADIO (Mundial 2026 - Secciones Reales)
INSERT INTO localidad_partido (codigo_localidad, capacidad, disponibilidad, precio, estadio_codigo) VALUES
-- ES001: Estadio Azteca
('ASIENTO CLUB', 5000, 5000, 450.00, 'ES001'),
('PREFERENTE', 8000, 8000, 300.00, 'ES001'),
('GENERAL ALTA', 15000, 15000, 150.00, 'ES001'),

-- ES002: MetLife Stadium
('COACHES CLUB', 3000, 3000, 1500.00, 'ES002'),
('LOWER BOWL', 6000, 6000, 1000.00, 'ES002'),
('UPPER TIER', 12000, 12000, 600.00, 'ES002'),

-- ES003: AT&T Stadium
('HALL OF FAME', 4000, 4000, 300.00, 'ES003'),
('MAIN CONCOURSE', 10000, 10000, 200.00, 'ES003'),
('UPPER CONCOURSE', 20000, 20000, 100.00, 'ES003'),

-- ES004: Arrowhead Stadium
('CLUB LEVEL', 3500, 3500, 250.00, 'ES004'),
('LOWER LEVEL', 8000, 8000, 180.00, 'ES004'),
('UPPER DECK', 14000, 14000, 120.00, 'ES004'),

-- ES005: Mercedes-Benz Stadium
('MERCEDES CLUB', 4000, 4000, 280.00, 'ES005'),
('LOWER BOWL', 9000, 9000, 190.00, 'ES005'),
('300 LEVEL', 15000, 15000, 110.00, 'ES005'),

-- ES006: SoFi Stadium
('VIP CLUB', 4500, 4500, 350.00, 'ES006'),
('PREMIER SEATING', 8000, 8000, 250.00, 'ES006'),
('500 LEVEL', 12000, 12000, 130.00, 'ES006'),

-- ES007: Hard Rock Stadium
('THE 72 CLUB', 3500, 3500, 320.00, 'ES007'),
('LOWER BOWL', 8000, 8000, 220.00, 'ES007'),
('UPPER DECK', 10000, 10000, 120.00, 'ES007'),

-- ES008: BMO Field
('CLUB SEATS', 2000, 2000, 200.00, 'ES008'),
('LOWER BOWL', 5000, 5000, 150.00, 'ES008'),
('SOUTH STAND', 4000, 4000, 95.00, 'ES008'),

-- ES009: Estadio BBVA
('CLUB SEATS', 3000, 3000, 220.00, 'ES009'),
('PLANTA BAJA', 7000, 7000, 160.00, 'ES009'),
('PLANTA ALTA', 12000, 12000, 90.00, 'ES009'),

-- ES010: BC Place
('CLUB SEATS', 3000, 3000, 240.00, 'ES010'),
('LOWER BOWL', 8000, 8000, 170.00, 'ES010'),
('UPPER BOWL', 10000, 10000, 110.00, 'ES010');

USE corebancario;

-- CLIENTES BANCARIOS (Datos para pruebas del módulo de crédito)
INSERT INTO cliente_bancario (cedula, nombre, genero, fecha_nacimiento, num_cuenta, saldo) VALUES
('0102030405', 'Maria Lopez', 'F', '1996-05-10', 'CTA-001', 1500.00), -- Falla por genero
('0203040506', 'Juan Perez', 'M', '1994-08-20', 'CTA-002', 3200.00), -- Cumple todas las reglas (Edad 30, M, depositos)
('0304050607', 'Ana Gomez', 'F', '2004-12-05', 'CTA-003', 800.00),  -- Falla genero y edad
('0405060708', 'Pedro Martinez', 'M', '2005-02-15', 'CTA-004', 500.00), -- Falla por edad (< 25)
('0506070809', 'Luis Ramirez', 'M', '1985-11-22', 'CTA-005', 400.00), -- Falla por no tener depósitos recientes
('0607080910', 'Carlos Torres', 'M', '1980-03-30', 'CTA-006', 1000.00); -- Falla por tener crédito activo

-- MOVIMIENTOS BANCARIOS (Últimos 3 meses, asumiendo fecha actual Jun 2026)
-- Juan Perez (CTA-002): Depósitos = 3000, Retiros = 1000 => (3000 - 1000) * 0.35 * 6 = 4200 (Monto Max)
INSERT INTO movimiento (num_cuenta, tipo, valor, fecha) VALUES
('CTA-002', 'DEPOSITO', 1000.00, '2026-04-15 10:00:00'),
('CTA-002', 'DEPOSITO', 1000.00, '2026-05-15 10:00:00'),
('CTA-002', 'DEPOSITO', 1000.00, '2026-06-01 10:00:00'),
('CTA-002', 'RETIRO', 500.00, '2026-04-20 14:00:00'),
('CTA-002', 'RETIRO', 500.00, '2026-05-20 14:00:00'),
-- Maria (CTA-001): Solo para tener datos
('CTA-001', 'DEPOSITO', 500.00, '2026-06-01 10:00:00'),
-- Carlos Torres (CTA-006): Para pasar regla de deposito
('CTA-006', 'DEPOSITO', 500.00, '2026-06-01 10:00:00');

-- CREDITOS ACTIVOS
INSERT INTO credito (cedula, monto, plazo, tasa, estado, fecha_creacion) VALUES
('0607080910', 500.00, 6, 0.165, 'ACTIVO', '2026-01-10 10:00:00');