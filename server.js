const express = require('express');
const cors = require('cors');
const app = express();

const usuariosRoutes = require('./routes/usuarios');
const registrosRoutes = require('./routes/registros');
const consultaRoute = require('./routes/consulta'); // 👈 nueva ruta

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/consulta', consultaRoute); // 👈 aquí la añadimos

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando correctamente 🚀' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
