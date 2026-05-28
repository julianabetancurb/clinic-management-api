-- ============================================
-- Script 1: Crear tablas
-- ============================================

CREATE TABLE IF NOT EXISTS "Doctor" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "documento"       VARCHAR(30) UNIQUE NOT NULL,
  "nombres"         VARCHAR(60) NOT NULL,
  "apellidos"       VARCHAR(60) NOT NULL,
  "especialidad"    VARCHAR(80) NOT NULL,
  "duracionCitaMin" INTEGER DEFAULT 30,
  "createdAt"       TIMESTAMP DEFAULT NOW(),
  "updatedAt"       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Paciente" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "documento" VARCHAR(30) UNIQUE NOT NULL,
  "nombres"   VARCHAR(60) NOT NULL,
  "apellidos" VARCHAR(60) NOT NULL,
  "email"     VARCHAR(100),
  "telefono"  VARCHAR(20),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Cita" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "doctorId"     UUID NOT NULL REFERENCES "Doctor"("id"),
  "pacienteId"   UUID NOT NULL REFERENCES "Paciente"("id"),
  "fechaInicio"  TIMESTAMP NOT NULL,
  "fechaFin"     TIMESTAMP NOT NULL,
  "motivo"       TEXT,
  "estado"       VARCHAR(20) DEFAULT 'PROGRAMADA',
  "createdAt"    TIMESTAMP DEFAULT NOW(),
  "updatedAt"    TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Script 2: Insertar datos de prueba
-- ============================================

INSERT INTO "Doctor" ("documento", "nombres", "apellidos", "especialidad", "duracionCitaMin")
VALUES
  ('987654321', 'Ana', 'Gómez', 'Medicina General', 30),
  ('123456789', 'Carlos', 'Ramírez', 'Cardiología', 45),
  ('555888999', 'Laura', 'Martínez', 'Pediatría', 20);

INSERT INTO "Paciente" ("documento", "nombres", "apellidos", "email", "telefono")
VALUES
  ('111222333', 'Juan', 'Pérez', 'juan@email.com', '3001234567'),
  ('444555666', 'María', 'López', 'maria@email.com', '3009876543'),
  ('777888999', 'Pedro', 'Sánchez', 'pedro@email.com', '3005555555');

INSERT INTO "Cita" ("doctorId", "pacienteId", "fechaInicio", "fechaFin", "motivo", "estado")
SELECT
  d."id",
  p."id",
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  'Consulta general',
  'PROGRAMADA'
FROM "Doctor" d, "Paciente" p
WHERE d."documento" = '987654321' AND p."documento" = '111222333';

-- Visualizar datos insertados
SELECT * FROM "Doctor";
SELECT * FROM "Paciente";
SELECT * FROM "Cita";

-- ============================================
-- Script 3: Drop de toda la base de datos
-- ============================================

DROP TABLE IF EXISTS "Cita" CASCADE;
DROP TABLE IF EXISTS "Paciente" CASCADE;
DROP TABLE IF EXISTS "Doctor" CASCADE;
