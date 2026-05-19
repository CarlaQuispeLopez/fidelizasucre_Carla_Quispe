-- Schema de base de datos para FidelizaSucre
-- Ejecutar este archivo para crear todas las tablas

-- Tabla de clientes (usuarios que acumulan puntos)
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  codigo_cliente VARCHAR(20) UNIQUE,
  puntos_totales INTEGER DEFAULT 0,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla de negocios
CREATE TABLE IF NOT EXISTS negocios (
  id SERIAL PRIMARY KEY,
  nombre_negocio VARCHAR(150) NOT NULL,
  tipo_negocio VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  password_hash VARCHAR(255) NOT NULL,
  descripcion TEXT,
  plan VARCHAR(20) DEFAULT 'gratuito',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla de recompensas que ofrece cada negocio
CREATE TABLE IF NOT EXISTS recompensas (
  id SERIAL PRIMARY KEY,
  negocio_id INTEGER REFERENCES negocios(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  puntos_requeridos INTEGER NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de transacciones (cuando se suman o restan puntos)
CREATE TABLE IF NOT EXISTS transacciones (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  negocio_id INTEGER REFERENCES negocios(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('suma', 'canje')),
  puntos INTEGER NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relacion cliente-negocio (puntos por negocio)
CREATE TABLE IF NOT EXISTS cliente_negocio_puntos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  negocio_id INTEGER REFERENCES negocios(id),
  puntos INTEGER DEFAULT 0,
  visitas INTEGER DEFAULT 0,
  ultima_visita TIMESTAMP,
  UNIQUE(cliente_id, negocio_id)
);

-- Indices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_negocios_email ON negocios(email);
CREATE INDEX IF NOT EXISTS idx_transacciones_cliente ON transacciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_negocio ON transacciones(negocio_id);

-- Datos de ejemplo para desarrollo
INSERT INTO negocios (nombre_negocio, tipo_negocio, email, telefono, direccion, password_hash, descripcion, plan)
VALUES (
  'Cafe Colonial Sucre',
  'Cafeteria',
  'cafe@ejemplo.com',
  '62000001',
  'Plaza 25 de Mayo, Sucre',
  '$2b$10$ejemplo_hash_aqui',
  'El mejor cafe del centro historico de Sucre',
  'premium'
) ON CONFLICT (email) DO NOTHING;
