const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('../middleware/auth');
const QRCode = require('qrcode');

// GET /api/businesses/panel
// Obtener datos del panel del negocio
router.get('/panel', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido a negocios.'
    });
  }

  try {
    const negocioRes = await pool.query(
      'SELECT id, nombre_negocio, email, telefono, direccion, descripcion, plan FROM negocios WHERE id = $1',
      [req.usuario.id]
    );

    const clientesRes = await pool.query(
      `SELECT c.nombre, c.apellido, c.email, cnp.puntos, cnp.visitas, cnp.ultima_visita
       FROM cliente_negocio_puntos cnp
       JOIN clientes c ON cnp.cliente_id = c.id
       WHERE cnp.negocio_id = $1
       ORDER BY cnp.visitas DESC
       LIMIT 20`,
      [req.usuario.id]
    );

    const totalClientesRes = await pool.query(
      'SELECT COUNT(*) as total FROM cliente_negocio_puntos WHERE negocio_id = $1',
      [req.usuario.id]
    );

    const recompensasRes = await pool.query(
      'SELECT * FROM recompensas WHERE negocio_id = $1 ORDER BY puntos_requeridos ASC',
      [req.usuario.id]
    );

    res.json({
      success: true,
      negocio: negocioRes.rows[0],
      clientes_frecuentes: clientesRes.rows,
      total_clientes: parseInt(totalClientesRes.rows[0].total),
      recompensas: recompensasRes.rows
    });
  } catch (error) {
    console.error('Error al obtener panel de negocio:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al cargar el panel.'
    });
  }
});

// POST /api/businesses/recompensa
// Crear una nueva recompensa
router.post('/recompensa', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({
      success: false,
      message: 'Solo los negocios pueden crear recompensas.'
    });
  }

  const { nombre, descripcion, puntos_requeridos } = req.body;

  if (!nombre || !puntos_requeridos) {
    return res.status(400).json({
      success: false,
      message: 'Nombre y puntos requeridos son obligatorios.'
    });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO recompensas (negocio_id, nombre, descripcion, puntos_requeridos)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.usuario.id, nombre, descripcion || null, puntos_requeridos]
    );

    res.status(201).json({
      success: true,
      message: 'Recompensa creada exitosamente.',
      recompensa: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al crear recompensa:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al crear la recompensa.'
    });
  }
});

// GET /api/businesses/qr
// Generar codigo QR del negocio para que clientes escaneen
router.get('/qr', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({
      success: false,
      message: 'Solo los negocios pueden generar su QR.'
    });
  }

  try {
    const datosQR = JSON.stringify({
      negocio_id: req.usuario.id,
      accion: 'sumar_puntos',
      timestamp: Date.now()
    });

    const qrDataURL = await QRCode.toDataURL(datosQR, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2C1810',
        light: '#FAFAF7'
      }
    });

    res.json({
      success: true,
      qr_imagen: qrDataURL,
      instrucciones: 'Muestra este QR a tus clientes para que escaneen y acumulen puntos.'
    });
  } catch (error) {
    console.error('Error al generar QR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al generar el codigo QR.'
    });
  }
});

module.exports = router;
