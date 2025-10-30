// routes/registros.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 📋 Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.alumno, u.grado, u.grupo
       FROM registros r
       LEFT JOIN usuarios u ON r.codigo = u.codigo
       ORDER BY r.id DESC`
    );
    res.json({ status: 'ok', data: rows });
  } catch (error) {
    console.error('Error al listar registros:', error);
    res.status(500).json({ error: 'Error al listar registros' });
  }
});

// 🔍 Buscar un registro por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.alumno, u.grado, u.grupo
       FROM registros r
       LEFT JOIN usuarios u ON r.codigo = u.codigo
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ error: 'Error al obtener registro' });
  }
});

// ➕ Crear un nuevo registro manualmente
router.post('/', async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Falta el parámetro "codigo"' });

  try {
    const [result] = await pool.query(
      'INSERT INTO registros (codigo, created_at) VALUES (?, NOW())',
      [codigo]
    );

    res.json({ status: 'ok', id: result.insertId, codigo });
  } catch (error) {
    console.error('Error al crear registro:', error);
    res.status(500).json({ error: 'Error al crear registro' });
  }
});

// ❌ Eliminar un registro
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM registros WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json({ status: 'ok', mensaje: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

module.exports = router;
