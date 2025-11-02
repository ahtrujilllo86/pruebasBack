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

    // 2) Obtener datos del usuario de acuerdo al codigo recibido
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE codigo = ?', [codigo]);

    if (usuarios.length === 0) {
      return res.status(404).json({ error: `No se encontró un usuario con el código ${codigo}` });
    }

    const usuario = usuarios[0];

    // 3) Petición externa
    const urlExterna = 'https://api.textmebot.com/send.php';
    let respuestaExterna;
    const recipient = `521${usuario.telefono_contacto}`;
    const apikey = process.env.WA_APIKEY;
    const text = `El alumno ${usuario.alumno} ha ingresado al plantel`;

    try {
      const response = await axios.post(
        urlExterna,
        { recipient, apikey, text },
        { headers: { 'Content-Type': 'application/json' } }
      );
      respuestaExterna = response.data;
      console.log(respuestaExterna);
    } catch (err) {
      console.warn('No se pudo hacer la petición externa:', err.message);
      respuestaExterna = { aviso: 'No se pudo obtener respuesta externa' };
    }

    // 4) Respuesta final
    res.json({
      mensaje: 'Consulta procesada y guardada',
      usuario,
      respuesta_externa: respuestaExterna
    });
  } catch (error) {
    console.error('Error en /consulta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
