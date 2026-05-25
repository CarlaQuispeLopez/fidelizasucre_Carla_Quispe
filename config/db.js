const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'clientesfieles',
  port:     process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  charset: 'utf8mb4'
});

// Verificar conexion al arrancar
pool.getConnection()
  .then(conn => {
    console.log('Conexion a MySQL (XAMPP) establecida correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('Error conectando a MySQL:', err.message);
  });

module.exports = pool;