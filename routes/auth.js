const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/registro-cliente
// Registrar un nuevo cliente
router.post('/registro-cliente', async (req, res) => {
  const { nombre, apellido, email, telefono, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, apellido, email y password son obligatorios.'
    });
  }

  try {
    const existe = await pool.query('SELECT id FROM clientes WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con ese email.'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const codigoCliente = 'CLI' + Date.now().toString().slice(-6);

    const resultado = await pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, password_hash, codigo_cliente)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, apellido, email, codigo_cliente`,
      [nombre, apellido, email, telefono || null, passwordHash, codigoCliente]
    );

    const cliente = resultado.rows[0];

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email, tipo: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      token,
      usuario: cliente
    });
  } catch (error) {
    console.error('Error en registro-cliente:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Intenta de nuevo.'
    });
  }
});

// POST /api/auth/registro-negocio
// Registrar un nuevo negocio
router.post('/registro-negocio', async (req, res) => {
  const { nombre_negocio, tipo_negocio, email, telefono, direccion, descripcion, password } = req.body;

  if (!nombre_negocio || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nombre del negocio, email y password son obligatorios.'
    });
  }

  try {
    const existe = await pool.query('SELECT id FROM negocios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta de negocio con ese email.'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const resultado = await pool.query(
      `INSERT INTO negocios (nombre_negocio, tipo_negocio, email, telefono, direccion, descripcion, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre_negocio, email, plan`,
      [nombre_negocio, tipo_negocio || null, email, telefono || null, direccion || null, descripcion || null, passwordHash]
    );

    const negocio = resultado.rows[0];

    const token = jwt.sign(
      { id: negocio.id, email: negocio.email, tipo: 'negocio' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Negocio registrado exitosamente.',
      token,
      usuario: negocio
    });
  } catch (error) {
    console.error('Error en registro-negocio:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Intenta de nuevo.'
    });
  }
});

// POST /api/auth/login
// Iniciar sesion (clientes y negocios)
router.post('/login', async (req, res) => {
  const { email, password, tipo } = req.body;

  if (!email || !password || !tipo) {
    return res.status(400).json({
      success: false,
      message: 'Email, password y tipo de cuenta son obligatorios.'
    });
  }

  try {
    let usuario = null;

    if (tipo === 'cliente') {
      const resultado = await pool.query(
        'SELECT * FROM clientes WHERE email = $1 AND activo = TRUE',
        [email]
      );
      usuario = resultado.rows[0];
    } else if (tipo === 'negocio') {
      const resultado = await pool.query(
        'SELECT * FROM negocios WHERE email = $1 AND activo = TRUE',
        [email]
      );
      usuario = resultado.rows[0];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de cuenta invalido. Usa "cliente" o "negocio".'
      });
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email o password incorrectos.'
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Email o password incorrectos.'
      });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete usuario.password_hash;

    res.json({
      success: true,
      message: 'Sesion iniciada correctamente.',
      token,
      usuario,
      tipo
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Intenta de nuevo.'
    });
  }
});

module.exports = router;
