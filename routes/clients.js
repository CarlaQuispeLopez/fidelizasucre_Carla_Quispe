const express        = require('express');
const router         = express.Router();
const pool           = require('../config/db');
const verificarToken = require('../middleware/auth');

// GET /api/clients/perfil
router.get('/perfil', verificarToken, async (req, res) => {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({ success: false, message: 'Acceso restringido a clientes.' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, codigo_cliente, puntos_totales, fecha_registro FROM clientes WHERE id = ?',
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Cliente no encontrado.' });
    res.json({ success: true, cliente: rows[0] });
  } catch (error) {
    console.error('Error perfil:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener el perfil.' });
  }
});

// GET /api/clients/recompensas-disponibles
router.get('/recompensas-disponibles', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, n.nombre_negocio, n.tipo_negocio
       FROM recompensas r
       JOIN negocios n ON r.negocio_id = n.id
       WHERE r.activa = 1 AND n.activo = 1
       ORDER BY r.puntos_requeridos ASC`
    );
    res.json({ success: true, recompensas: rows });
  } catch (error) {
    console.error('Error recompensas:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener las recompensas.' });
  }
});

module.exports = router;