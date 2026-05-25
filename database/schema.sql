-- ClientesFieles - Schema MySQL (XAMPP)

CREATE TABLE IF NOT EXISTS clientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  apellido        VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  telefono        VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  codigo_cliente  VARCHAR(20) UNIQUE,
  puntos_totales  INT DEFAULT 0,
  fecha_registro  DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo          TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS negocios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre_negocio  VARCHAR(150) NOT NULL,
  tipo_negocio    VARCHAR(100),
  email           VARCHAR(150) NOT NULL UNIQUE,
  telefono        VARCHAR(20),
  direccion       TEXT,
  password_hash   VARCHAR(255) NOT NULL,
  descripcion     TEXT,
  plan            VARCHAR(20) DEFAULT 'gratuito',
  fecha_registro  DATETIME DEFAULT CURRENT_TIMESTAMP,
  activo          TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS recompensas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  negocio_id        INT NOT NULL,
  nombre            VARCHAR(200) NOT NULL,
  descripcion       TEXT,
  puntos_requeridos INT NOT NULL,
  activa            TINYINT(1) DEFAULT 1,
  fecha_creacion    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (negocio_id) REFERENCES negocios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transacciones (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id  INT,
  negocio_id  INT,
  tipo        ENUM('suma','canje') NOT NULL,
  puntos      INT NOT NULL,
  descripcion TEXT,
  fecha       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);

CREATE TABLE IF NOT EXISTS cliente_negocio_puntos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id    INT NOT NULL,
  negocio_id    INT NOT NULL,
  puntos        INT DEFAULT 0,
  visitas       INT DEFAULT 0,
  ultima_visita DATETIME,
  UNIQUE KEY uq_cliente_negocio (cliente_id, negocio_id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (negocio_id) REFERENCES negocios(id)
);