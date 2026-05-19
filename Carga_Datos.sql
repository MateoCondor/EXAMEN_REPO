-- Carga de datos para la federación de fútbol
-- USE DATABASE
USE federacion;

-- PARTIDOS (10)
INSERT INTO partido_futbol (codigo, equipo_local, equipo_visita, fecha, lugar) VALUES
('PF001', 'Tigres FC', 'Leones FC', '2026-06-05 19:00:00', 'Estadio Nacional'),
('PF002', 'Halcones', 'Pumas', '2026-06-07 16:30:00', 'Estadio Central'),
('PF003', 'Dragones', 'Toros', '2026-06-10 20:00:00', 'Complejo Norte'),
('PF004', 'Rayos', 'Lobos', '2026-06-12 18:00:00', 'Estadio Sur'),
('PF005', 'Marinos', 'Guerreros', '2026-06-15 21:00:00', 'Arena Costera'),
('PF006', 'Capitalinos', 'Andinos', '2026-06-18 17:00:00', 'Estadio Metropolitano'),
('PF007', 'Norte FC', 'Sur FC', '2026-06-20 15:00:00', 'Estadio Regional'),
('PF008', 'Real Club', 'Union Club', '2026-06-22 19:30:00', 'Estadio Olimpico'),
('PF009', 'Rivales', 'Cumbres', '2026-06-25 20:30:00', 'Estadio Imperial'),
('PF010', 'Arenas', 'Montanas', '2026-06-28 16:00:00', 'Estadio Sierra');

-- LOCALIDADES (25)
INSERT INTO localidad_partido (codigo_localidad, disponibilidad, precio, partido_codigo) VALUES
('GENERAL', 500, 8.00, 'PF001'),
('PREFERENCIA', 250, 12.00, 'PF001'),
('VIP', 80, 25.00, 'PF001'),

('GENERAL', 450, 7.50, 'PF002'),
('TRIBUNA', 220, 11.00, 'PF002'),
('PALCO', 60, 30.00, 'PF002'),

('GENERAL', 520, 9.00, 'PF003'),
('PREFERENCIA', 200, 13.00, 'PF003'),

('GENERAL', 480, 8.50, 'PF004'),
('TRIBUNA', 210, 11.50, 'PF004'),
('VIP', 70, 26.00, 'PF004'),

('GENERAL', 530, 9.50, 'PF005'),
('PALCO', 55, 32.00, 'PF005'),

('GENERAL', 600, 8.00, 'PF006'),
('PREFERENCIA', 240, 12.50, 'PF006'),
('VIP', 90, 27.00, 'PF006'),

('GENERAL', 410, 7.00, 'PF007'),
('TRIBUNA', 190, 10.50, 'PF007'),

('GENERAL', 560, 9.00, 'PF008'),
('PREFERENCIA', 230, 12.00, 'PF008'),
('PALCO', 50, 31.00, 'PF008'),

('GENERAL', 470, 8.00, 'PF009'),
('TRIBUNA', 205, 11.00, 'PF009'),
('VIP', 75, 28.00, 'PF009'),

('GENERAL', 490, 8.50, 'PF010'),
('PREFERENCIA', 215, 12.80, 'PF010');