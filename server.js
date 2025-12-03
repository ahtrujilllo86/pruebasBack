require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const consultaRoute = require('./routes/consulta');

app.use(cors());
app.use(express.json());
app.use('/consulta', consultaRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
