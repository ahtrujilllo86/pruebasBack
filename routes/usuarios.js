// routes/usuarios.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// 📋 Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');
    res.json({ status: 'ok', data: rows });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

// 🔍 Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
});

// ➕ Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { codigo, alumno, grado, grupo, telefono_contacto } = req.body;
  if (!codigo || !alumno) {
    return res.status(400).json({ error: 'Faltan campos requeridos: codigo y alumno' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios (codigo, alumno, grado, grupo, telefono_contacto, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [codigo, alumno, grado, grupo, telefono_contacto]
    );

    res.json({ status: 'ok', id: result.insertId });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ✏️ Actualizar un usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, alumno, grado, grupo, telefono_contacto } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE usuarios
       SET codigo=?, alumno=?, grado=?, grupo=?, telefono_contacto=?
       WHERE id=?`,
      [codigo, alumno, grado, grupo, telefono_contacto, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ status: 'ok', mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ❌ Eliminar un usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ status: 'ok', mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
