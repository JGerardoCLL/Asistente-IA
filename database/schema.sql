CREATE TABLE articulos (
id INT AUTO_INCREMENT PRIMARY KEY,
numero_articulo VARCHAR(20) NOT NULL,
capitulo VARCHAR(120) NOT NULL,
descripcion TEXT NOT NULL,
multa_min_cuotas INT NULL,
multa_max_cuotas INT NULL,
categoria VARCHAR(60) NOT NULL
);
CREATE TABLE logs_consultas (
-- opcional
id INT AUTO_INCREMENT PRIMARY KEY,
pregunta_usuario TEXT NOT NULL,
respuesta_ia TEXT NOT NULL,
creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO articulos
(numero_articulo, capitulo, descripcion, multa_min_cuotas, multa_max_cuotas, categoria)
VALUES
('Art. 3', 'Cap. I - Disposiciones generales',
'Para circular en el Municipio de Monterrey se debera portar en original: placas vigentes, tarjeta de
circulacion vigente, calcomania de placas y refrendo, licencia vigente del conductor y seguro de
responsabilidad civil vigente.', NULL, NULL, 'documentacion'),
('Art. 9 fraccion 2', 'Cap. III - Infracciones y multas',
'Circular a exceso de velocidad.', 10, 15, 'velocidad'),
('Art. 9 fraccion 12', 'Cap. III - Infracciones y multas',
'Conducir sin el cinturon de seguridad abrochado.', 5, 7, 'seguridad'),
('Art. 9 fraccion 23', 'Cap. III - Infracciones y multas',
'Conducir en estado de ebriedad incompleto o completo, o bajo el influjo de drogas que afecten la
capacidad motora.', 50, 200, 'ebriedad'),
('Art. 11', 'Cap. III - Infracciones y multas',
'Si la infraccion es pagada antes de quince dias se descontara el cincuenta por ciento de su valor,
con excepcion de: manejar en estado de ebriedad, huir del lugar del accidente, estacionarse en lugares
reservados para discapacitados, exceso de velocidad en zona escolar y circular sin placas.',
NULL, NULL, 'descuentos');
