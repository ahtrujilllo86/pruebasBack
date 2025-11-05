require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const usuariosRoutes = require('./routes/usuarios');
const registrosRoutes = require('./routes/registros');
const consultaRoute = require('./routes/consulta');
const registrosHTML = require('./routes/registrosHTML');

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/registros', registrosHTML);
app.use('/consulta', consultaRoute);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API con MySQL funcionando 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
