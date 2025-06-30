const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => console.error('❌ Error al conectar a MongoDB:', err));
const Visit = require('./models/visit');


app.use(async (req, res, next) => {
  try {
    const visit = new Visit({
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      path: req.originalUrl,
      userAgent: req.headers['user-agent']
    });
    await visit.save();
  } catch (err) {
    console.error('❌ Error al guardar visita:', err);
  }
  next();
});

app.get('/visits', async (req, res) => {
  try {
    const visitas = await Visit.find().sort({ date: -1 }).limit(50);
    res.json(visitas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitas' });
  }
});


// Middleware para procesar JSON
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Bienvenido a Gilia Games Backend!');
});

// Ruta de contacto (ejemplo)
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Nuevo mensaje de ${name} <${email}>: ${message}`);
  res.json({ success: true, message: 'Mensaje recibido' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
