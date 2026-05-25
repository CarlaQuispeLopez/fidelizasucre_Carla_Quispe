require('dotenv').config();
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function initDatabase() {
  console.log('================================================');
  console.log('  ClientesFieles - Inicializando base de datos');
  console.log('================================================');

  // Paso 1: crear la BD si no existe
  const connSinDB = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    port:     parseInt(process.env.DB_PORT) || 3306
  });

  await connSinDB.query(
    "CREATE DATABASE IF NOT EXISTS `clientesfieles` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  );
  console.log('Base de datos lista.');
  await connSinDB.end();

  // Paso 2: conectar a la BD y crear tablas una por una
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'clientesfieles',
    port:     parseInt(process.env.DB_PORT) || 3306
  });

  const sql        = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = sql
    .split(';')
    .map(s => s.replace(/--.*$/gm, '').trim())
    .filter(s => s.length > 10);

  let ok = 0;
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      ok++;
    } catch (err) {
      console.error('Error en sentencia:', err.message);
      console.error('SQL:', stmt.substring(0, 80));
    }
  }

  await conn.end();
  console.log(ok + ' sentencias ejecutadas correctamente.');
  console.log('================================================');
  console.log('Ahora ejecuta:  npm run dev');
  console.log('Luego abre:     http://localhost:3000');
  console.log('================================================');
  process.exit(0);
}

initDatabase().catch(err => {
  console.error('Error critico:', err.message);
  process.exit(1);
});