const express = require('express');
const mongoose = require('mongoose');
const Visit = require('./models/visit');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'https://giliagames.com', // Cambia esto por tu dominio real en Porkbun
}));

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(express.json());

app.post('/visits', async (req, res) => {
  try {
    const visit = new Visit({
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      path: req.body.path || req.originalUrl,
      userAgent: req.headers['user-agent']
    });

    await visit.save();
    res.json({ success: true, message: 'Visita registrada' });
  } catch (err) {
    console.error('❌ Error al guardar visita:', err);
    res.status(500).json({ success: false, error: 'Error al registrar visita' });
  }
});


// Rutas
app.get('/', (req, res) => {
  res.send('¡Bienvenido a Gilia Games Backend!');
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Nuevo mensaje de ${name} <${email}>: ${message}`);
  res.json({ success: true, message: 'Mensaje recibido' });
});

app.get('/visits', async (req, res) => {
  try {
    const visitas = await Visit.find().sort({ date: -1 }).limit(50);
    res.json(visitas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitas' });
  }
});

// 🔥 ARRANQUE SEGURO DEL SERVIDOR
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1); // opcional, evita dejar un servidor colgado
  });
