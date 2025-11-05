// routes/listaRegistros.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta para mostrar registros en HTML
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.alumno, u.grado, u.grupo
       FROM registros r
       LEFT JOIN usuarios u ON r.codigo = u.codigo
       ORDER BY r.id DESC`
    );
    
    // Generar HTML dinámico
    let html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Lista de Registros</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background-color: #f4f4f4; }
          h1 { text-align: center; }
          table { border-collapse: collapse; width: 100%; background: white; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background-color: #007BFF; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Historial de Registros</h1>
        <table>
          <thead>
            <tr>
              ${Object.keys(rows[0] || {}).map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).send('Error al obtener registros');
  }
});

module.exports = router;
