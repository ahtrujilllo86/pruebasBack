// routes/consulta.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');
const moment = require('moment-timezone');

router.post('/', async (req, res) => {
  const { codigo, imagen } = req.body;
  let accion = 'ingreso';
  if (!codigo) return res.status(400).json({ error: 'Falta el parámetro "codigo"' });

  try {

    // primero revisamos si existe un registro hoy
    const [accesoPrevio] = await pool.query(
      `SELECT * 
      FROM registros 
      WHERE codigo = ?
        AND DATE(created_at) = CURDATE()
      ORDER BY id DESC
      LIMIT 1`,
      [codigo]
    );

    if (accesoPrevio.length > 0) {
      const estatusAccion = accesoPrevio[0].accion;
      accion = estatusAccion === 'ingreso' ? 'salio' : 'ingreso';
    }


    // 1) Insertar registro (created_at se llena por defecto si tu columna tiene DEFAULT CURRENT_TIMESTAMP)
    const hora_envio = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
    await pool.query(
      'INSERT INTO registros (codigo, created_at, accion) VALUES (?, ?, ?)',
      [codigo, hora_envio, accion]
    );

    // 2) Obtener datos del usuario de acuerdo al codigo recibido
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE codigo = ?', [codigo]);

    if (usuarios.length === 0) {
      return res.status(404).json({ error: `No se encontró un usuario con el código ${codigo}` });
    }

    if (usuarios.telefono_contacto === '' || usuarios.telefono_contacto === null) {
      return res.status(404).json({ error: 'tarjeta sin asociar a usuario' });
    }

    const {
      alumno, 
      telefono_contacto, 
      alertzy_key,
    } = usuarios[0];

    // 3) Petición externa
    const urlExterna = process.env.URL_WASEND;
    // const urlExterna = process.env.URL_ALERTZY;
    let respuestaExterna;
    const number = `521${telefono_contacto}`;
    // const apikey = process.env.WA_APIKEY;
    const textAction = accion === 'ingreso' ? 'ingreso al' : 'salio del';
    const message = `El alumno ${alumno} ${textAction} plantel`;
    const accountKey = alertzy_key ?? '';
    const title = '';
    const image = imagen ?? '';

    try {
      const response = await axios.post(
        urlExterna,
        { number, message},
        // {accountKey, title, message, image},
        { headers: { 'Content-Type': 'application/json' } }
      );
      respuestaExterna = response.data;
      console.log(respuestaExterna);
    } catch (err) {
      console.log('URL externa', urlExterna);
      console.warn('No se pudo hacer la petición externa:', err.message);
      respuestaExterna = { aviso: 'No se pudo obtener respuesta externa' };
    }

    // 4) Respuesta final
    res.json({
      mensaje: 'Consulta procesada y guardada',
      alumno,
      respuesta_externa: respuestaExterna
    });
  } catch (error) {
    console.error('Error en /consulta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
