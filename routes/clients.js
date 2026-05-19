const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('../middleware/auth');

// GET /api/clients/perfil
// Obtener perfil del cliente autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({
      success: false,
      message: 'Acceso restringido a clientes.'
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nombre, apellido, email, telefono, codigo_cliente, puntos_totales, fecha_registro
       FROM clientes WHERE id = $1`,
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.'
      });
    }

    res.json({
      success: true,
      cliente: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil.'
    });
  }
});

// GET /api/clients/recompensas-disponibles
// Obtener todas las recompensas disponibles para canjear
router.get('/recompensas-disponibles', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT r.*, n.nombre_negocio, n.tipo_negocio
       FROM recompensas r
       JOIN negocios n ON r.negocio_id = n.id
       WHERE r.activa = TRUE AND n.activo = TRUE
       ORDER BY r.puntos_requeridos ASC`
    );

    res.json({
      success: true,
      recompensas: resultado.rows
    });
  } catch (error) {
    console.error('Error al obtener recompensas:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las recompensas.'
    });
  }
});

module.exports = router;
