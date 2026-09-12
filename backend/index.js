const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

//impportar ruta
const chatRoutes = require('./src/routes/chat.routes');

// Middlewares
app.use(cors());
app.use(express.json());

//usar rutas
app.use('/api', chatRoutes);

// Ruta de prueba
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.json({ status: 'Conectado a MySQL con éxito', data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
