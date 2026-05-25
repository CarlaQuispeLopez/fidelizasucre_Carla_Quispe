const express        = require('express');
const router         = express.Router();
const pool           = require('../config/db');
const verificarToken = require('../middleware/auth');

// POST /api/points/sumar
router.post('/sumar', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({ success: false, message: 'Solo los negocios pueden agregar puntos.' });
  }

  const { codigo_cliente, puntos, descripcion } = req.body;

  if (!codigo_cliente || !puntos || puntos <= 0) {
    return res.status(400).json({ success: false, message: 'Codigo de cliente y puntos positivos son obligatorios.' });
  }

  try {
    const [clienteRows] = await pool.query(
      'SELECT id, nombre, apellido, puntos_totales FROM clientes WHERE codigo_cliente = ? AND activo = 1',
      [codigo_cliente]
    );

    if (!clienteRows.length) {
      return res.status(404).json({ success: false, message: 'Codigo de cliente no encontrado.' });
    }

    const cliente = clienteRows[0];

    await pool.query('UPDATE clientes SET puntos_totales = puntos_totales + ? WHERE id = ?', [puntos, cliente.id]);

    await pool.query(
      `INSERT INTO transacciones (cliente_id, negocio_id, tipo, puntos, descripcion) VALUES (?, ?, 'suma', ?, ?)`,
      [cliente.id, req.usuario.id, puntos, descripcion || 'Puntos por compra']
    );

    await pool.query(
      `INSERT INTO cliente_negocio_puntos (cliente_id, negocio_id, puntos, visitas, ultima_visita)
       VALUES (?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE
         puntos       = puntos + VALUES(puntos),
         visitas      = visitas + 1,
         ultima_visita = NOW()`,
      [cliente.id, req.usuario.id, puntos]
    );

    res.json({
      success: true,
      message: puntos + ' puntos agregados a ' + cliente.nombre + ' ' + cliente.apellido,
      nuevos_puntos_totales: cliente.puntos_totales + puntos
    });
  } catch (error) {
    console.error('Error sumar puntos:', error.message);
    res.status(500).json({ success: false, message: 'Error al agregar los puntos.' });
  }
});

// POST /api/points/canjear
router.post('/canjear', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({ success: false, message: 'Solo los clientes pueden canjear puntos.' });
  }

  const { recompensa_id } = req.body;
  if (!recompensa_id) {
    return res.status(400).json({ success: false, message: 'ID de recompensa es obligatorio.' });
  }

  try {
    const [recompensaRows] = await pool.query('SELECT * FROM recompensas WHERE id = ? AND activa = 1', [recompensa_id]);
    if (!recompensaRows.length) {
      return res.status(404).json({ success: false, message: 'Recompensa no encontrada o no disponible.' });
    }

    const recompensa = recompensaRows[0];
    const [clienteRows] = await pool.query('SELECT id, nombre, puntos_totales FROM clientes WHERE id = ?', [req.usuario.id]);
    const cliente = clienteRows[0];

    if (cliente.puntos_totales < recompensa.puntos_requeridos) {
      return res.status(400).json({
        success: false,
        message: 'No tienes suficientes puntos. Necesitas ' + recompensa.puntos_requeridos + ' puntos.',
        puntos_actuales:   cliente.puntos_totales,
        puntos_requeridos: recompensa.puntos_requeridos
      });
    }

    await pool.query('UPDATE clientes SET puntos_totales = puntos_totales - ? WHERE id = ?', [recompensa.puntos_requeridos, req.usuario.id]);

    await pool.query(
      `INSERT INTO transacciones (cliente_id, negocio_id, tipo, puntos, descripcion) VALUES (?, ?, 'canje', ?, ?)`,
      [req.usuario.id, recompensa.negocio_id, recompensa.puntos_requeridos, 'Canje: ' + recompensa.nombre]
    );

    res.json({
      success: true,
      message: 'Recompensa canjeada: ' + recompensa.nombre,
      puntos_usados:     recompensa.puntos_requeridos,
      puntos_restantes:  cliente.puntos_totales - recompensa.puntos_requeridos
    });
  } catch (error) {
    console.error('Error canjear:', error.message);
    res.status(500).json({ success: false, message: 'Error al canjear la recompensa.' });
  }
});

// GET /api/points/historial
router.get('/historial', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({ success: false, message: 'Solo los clientes pueden ver su historial.' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT t.*, n.nombre_negocio
       FROM transacciones t
       LEFT JOIN negocios n ON t.negocio_id = n.id
       WHERE t.cliente_id = ?
       ORDER BY t.fecha DESC
       LIMIT 50`,
      [req.usuario.id]
    );
    res.json({ success: true, historial: rows });
  } catch (error) {
    console.error('Error historial:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener el historial.' });
  }
});

module.exports = router;