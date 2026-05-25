const express        = require('express');
const router         = express.Router();
const pool           = require('../config/db');
const verificarToken = require('../middleware/auth');
const QRCode         = require('qrcode');

// GET /api/businesses/panel
router.get('/panel', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({ success: false, message: 'Acceso restringido a negocios.' });
  }

  try {
    const [negocioRows] = await pool.query(
      'SELECT id, nombre_negocio, email, telefono, direccion, descripcion, plan FROM negocios WHERE id = ?',
      [req.usuario.id]
    );

    const [clientesRows] = await pool.query(
      `SELECT c.nombre, c.apellido, c.email, cnp.puntos, cnp.visitas, cnp.ultima_visita
       FROM cliente_negocio_puntos cnp
       JOIN clientes c ON cnp.cliente_id = c.id
       WHERE cnp.negocio_id = ?
       ORDER BY cnp.visitas DESC
       LIMIT 20`,
      [req.usuario.id]
    );

    const [totalRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM cliente_negocio_puntos WHERE negocio_id = ?',
      [req.usuario.id]
    );

    const [recompensasRows] = await pool.query(
      'SELECT * FROM recompensas WHERE negocio_id = ? ORDER BY puntos_requeridos ASC',
      [req.usuario.id]
    );

    res.json({
      success:            true,
      negocio:            negocioRows[0],
      clientes_frecuentes: clientesRows,
      total_clientes:     parseInt(totalRows[0].total),
      recompensas:        recompensasRows
    });
  } catch (error) {
    console.error('Error panel negocio:', error.message);
    res.status(500).json({ success: false, message: 'Error al cargar el panel.' });
  }
});

// POST /api/businesses/recompensa
router.post('/recompensa', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({ success: false, message: 'Solo los negocios pueden crear recompensas.' });
  }

  const { nombre, descripcion, puntos_requeridos } = req.body;

  if (!nombre || !puntos_requeridos) {
    return res.status(400).json({ success: false, message: 'Nombre y puntos requeridos son obligatorios.' });
  }

  try {
    const [resultado] = await pool.query(
      `INSERT INTO recompensas (negocio_id, nombre, descripcion, puntos_requeridos) VALUES (?, ?, ?, ?)`,
      [req.usuario.id, nombre, descripcion || null, puntos_requeridos]
    );

    res.status(201).json({
      success: true,
      message: 'Recompensa creada exitosamente.',
      recompensa: { id: resultado.insertId, nombre, descripcion, puntos_requeridos }
    });
  } catch (error) {
    console.error('Error crear recompensa:', error.message);
    res.status(500).json({ success: false, message: 'Error al crear la recompensa.' });
  }
});

// GET /api/businesses/qr
router.get('/qr', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({ success: false, message: 'Solo los negocios pueden generar su QR.' });
  }

  try {
    const datosQR  = JSON.stringify({ negocio_id: req.usuario.id, accion: 'sumar_puntos', timestamp: Date.now() });
    const qrDataURL = await QRCode.toDataURL(datosQR, { width: 300, margin: 2 });

    res.json({
      success:      true,
      qr_imagen:    qrDataURL,
      instrucciones: 'Muestra este QR a tus clientes para que escaneen y acumulen puntos.'
    });
  } catch (error) {
    console.error('Error QR:', error.message);
    res.status(500).json({ success: false, message: 'Error al generar el codigo QR.' });
  }
});

module.exports = router;