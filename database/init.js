require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function initDatabase() {
  try {
    console.log('Iniciando creacion de tablas en PostgreSQL...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Tablas creadas exitosamente.');
    console.log('Base de datos lista para usar.');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

initDatabase();
