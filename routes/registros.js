// routes/registros.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registros ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar un registro (ej. desde /consulta)
router.post('/', async (req, res) => {
  const { codigo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO registros (codigo, created_at)
       VALUES ($1, NOW()) RETURNING *`,
      [codigo]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
