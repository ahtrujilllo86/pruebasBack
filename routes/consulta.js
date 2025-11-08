// routes/consulta.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');
const moment = require('moment-timezone');
const fs = require("fs");
const path = require("path");
const multer = require("multer");

router.post('/', async (req, res) => {
  const { codigo, imagen } = req.body;
  if (!codigo) return res.status(400).json({ error: 'Falta el parámetro "codigo"' });

  try {
    // 1) Insertar registro (created_at se llena por defecto si tu columna tiene DEFAULT CURRENT_TIMESTAMP)
    // const hora_envio = new Date().toLocaleString("es-MX").format('YYYY-MM-DD HH:mm:ss');
    const hora_envio = moment().tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
    const [insertResult] = await pool.query(
      'INSERT INTO registros (codigo, created_at) VALUES (?, ?)',
      [codigo, hora_envio]
    );

    const newId = insertResult.insertId;

    // 2) Obtener datos del usuario de acuerdo al codigo recibido
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE codigo = ?', [codigo]);

    if (usuarios.length === 0) {
      return res.status(404).json({ error: `No se encontró un usuario con el código ${codigo}` });
    }

    const {
      alumno, 
      telefono_contacto, 
      alertzy_key,
    } = usuarios[0];

    // 3) Petición externa
    // const urlExterna = process.env.URL_WASEND;
    const urlExterna = process.env.URL_ALERTZY;
    let respuestaExterna;
    const number = `521${telefono_contacto}`;
    // const apikey = process.env.WA_APIKEY;
    const message = `El alumno ${alumno} ha ingresado al plantel`;
    const accountKey = alertzy_key
    const title = '';
    const image = imagen ?? 'https://i.postimg.cc/137GJxF8/logocare.jpg';

    try {
      const response = await axios.post(
        urlExterna,
        // { number, message},
        {accountKey, title, message, image},
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

// Carpeta donde se guardarán las imágenes
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurar Multer para guardar las imágenes en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `foto_${timestamp}.jpg`);
  }
});

const upload = multer({ storage });

router.post('/photo', upload.single("file"), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
  }

// Generar URL pública de la imagen
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  console.log("📸 Imagen recibida:", imageUrl);

  res.json({
    ok: true,
    mensaje: "Imagen recibida correctamente",
    archivo: req.file.filename,
    url: imageUrl,
  });
});

module.exports = router;
