const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Conexion a PostgreSQL establecida correctamente');
});

pool.on('error', (err) => {
  console.error('Error en la conexion a PostgreSQL:', err.message);
});

module.exports = pool;
