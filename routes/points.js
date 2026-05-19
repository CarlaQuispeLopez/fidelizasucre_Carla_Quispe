const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('../middleware/auth');

// POST /api/points/sumar
// Agregar puntos a un cliente (solo negocios autenticados)
router.post('/sumar', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'negocio') {
    return res.status(403).json({
      success: false,
      message: 'Solo los negocios pueden agregar puntos.'
    });
  }

  const { codigo_cliente, puntos, descripcion } = req.body;

  if (!codigo_cliente || !puntos || puntos <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Codigo de cliente y puntos positivos son obligatorios.'
    });
  }

  try {
    const clienteRes = await pool.query(
      'SELECT id, nombre, apellido, puntos_totales FROM clientes WHERE codigo_cliente = $1 AND activo = TRUE',
      [codigo_cliente]
    );

    if (clienteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Codigo de cliente no encontrado.'
      });
    }

    const cliente = clienteRes.rows[0];

    await pool.query(
      'UPDATE clientes SET puntos_totales = puntos_totales + $1 WHERE id = $2',
      [puntos, cliente.id]
    );

    await pool.query(
      `INSERT INTO transacciones (cliente_id, negocio_id, tipo, puntos, descripcion)
       VALUES ($1, $2, 'suma', $3, $4)`,
      [cliente.id, req.usuario.id, puntos, descripcion || 'Puntos por compra']
    );

    await pool.query(
      `INSERT INTO cliente_negocio_puntos (cliente_id, negocio_id, puntos, visitas, ultima_visita)
       VALUES ($1, $2, $3, 1, NOW())
       ON CONFLICT (cliente_id, negocio_id)
       DO UPDATE SET puntos = cliente_negocio_puntos.puntos + $3,
                     visitas = cliente_negocio_puntos.visitas + 1,
                     ultima_visita = NOW()`,
      [cliente.id, req.usuario.id, puntos]
    );

    res.json({
      success: true,
      message: puntos + ' puntos agregados a ' + cliente.nombre + ' ' + cliente.apellido,
      nuevos_puntos_totales: cliente.puntos_totales + puntos
    });
  } catch (error) {
    console.error('Error al sumar puntos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al agregar los puntos. Intenta de nuevo.'
    });
  }
});

// POST /api/points/canjear
// Canjear puntos por una recompensa
router.post('/canjear', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({
      success: false,
      message: 'Solo los clientes pueden canjear puntos.'
    });
  }

  const { recompensa_id } = req.body;

  if (!recompensa_id) {
    return res.status(400).json({
      success: false,
      message: 'ID de recompensa es obligatorio.'
    });
  }

  try {
    const recompensaRes = await pool.query(
      'SELECT * FROM recompensas WHERE id = $1 AND activa = TRUE',
      [recompensa_id]
    );

    if (recompensaRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa no encontrada o no disponible.'
      });
    }

    const recompensa = recompensaRes.rows[0];

    const clienteRes = await pool.query(
      'SELECT id, nombre, puntos_totales FROM clientes WHERE id = $1',
      [req.usuario.id]
    );

    const cliente = clienteRes.rows[0];

    if (cliente.puntos_totales < recompensa.puntos_requeridos) {
      return res.status(400).json({
        success: false,
        message: 'No tienes suficientes puntos. Necesitas ' + recompensa.puntos_requeridos + ' puntos.',
        puntos_actuales: cliente.puntos_totales,
        puntos_requeridos: recompensa.puntos_requeridos
      });
    }

    await pool.query(
      'UPDATE clientes SET puntos_totales = puntos_totales - $1 WHERE id = $2',
      [recompensa.puntos_requeridos, req.usuario.id]
    );

    await pool.query(
      `INSERT INTO transacciones (cliente_id, negocio_id, tipo, puntos, descripcion)
       VALUES ($1, $2, 'canje', $3, $4)`,
      [req.usuario.id, recompensa.negocio_id, recompensa.puntos_requeridos, 'Canje: ' + recompensa.nombre]
    );

    res.json({
      success: true,
      message: 'Recompensa canjeada exitosamente: ' + recompensa.nombre,
      puntos_usados: recompensa.puntos_requeridos,
      puntos_restantes: cliente.puntos_totales - recompensa.puntos_requeridos
    });
  } catch (error) {
    console.error('Error al canjear puntos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al canjear la recompensa. Intenta de nuevo.'
    });
  }
});

// GET /api/points/historial
// Ver historial de puntos del cliente autenticado
router.get('/historial', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({
      success: false,
      message: 'Solo los clientes pueden ver su historial.'
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT t.*, n.nombre_negocio
       FROM transacciones t
       LEFT JOIN negocios n ON t.negocio_id = n.id
       WHERE t.cliente_id = $1
       ORDER BY t.fecha DESC
       LIMIT 50`,
      [req.usuario.id]
    );

    res.json({
      success: true,
      historial: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial.'
    });
  }
});

module.exports = router;
