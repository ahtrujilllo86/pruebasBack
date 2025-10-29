// routes/consulta.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Falta el parámetro "codigo"' });

  try {
    // 1) Insertar registro (created_at se llena por defecto si tu columna tiene DEFAULT CURRENT_TIMESTAMP)
    const [insertResult] = await pool.query(
      'INSERT INTO registros (codigo) VALUES (?)',
      [codigo]
    );

    const newId = insertResult.insertId;

    // 2) Obtener la fila insertada (opcional)
    const [rows] = await pool.query('SELECT * FROM registros WHERE id = ?', [newId]);
    const registro = rows[0] || { id: newId, codigo };

    // 3) Petición externa
    const urlExterna = `https://wirepusher.com/send?id=TCF8mpzPW&title=Ingreso&message=Tarjeta:${codigo}&type=YourCustomType`;
    let datosExternos;
    try {
      const respuesta = await axios.get(urlExterna);
      datosExternos = respuesta.data;
    } catch (err) {
      console.warn('No se pudo obtener datos externos:', err.message);
      datosExternos = { aviso: 'No se pudo obtener datos externos' };
    }

    // 4) Respuesta final
    res.json({
      mensaje: 'Consulta procesada y guardada',
      registro,
      datos_externos: datosExternos
    });
  } catch (error) {
    console.error('Error en /consulta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
