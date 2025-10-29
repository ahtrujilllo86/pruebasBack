// routes/usuarios.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { codigo, alumno, grado, grupo, telefono_contacto } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO usuarios (codigo, alumno, grado, grupo, telefono_contacto, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [codigo, alumno, grado, grupo, telefono_contacto]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { codigo, alumno, grado, grupo, telefono_contacto } = req.body;
  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET codigo = $1, alumno = $2, grado = $3, grupo = $4, telefono_contacto = $5
       WHERE id = $6 RETURNING *`,
      [codigo, alumno, grado, grupo, telefono_contacto, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
