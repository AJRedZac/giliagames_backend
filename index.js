const nodemailer = require('nodemailer');
const express = require('express');
const mongoose = require('mongoose');
const Visit = require('./models/visit');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'https://giliagames.com' // Cambia esto por tu dominio real en Porkbun
  
}));

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(express.json());

app.post('/visits', async (req, res) => {
  try {
    const visit = new Visit({
      visitorId: String,
      ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim(),
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

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.porkbun.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"${name} via Gilia Games" <contact@giliagames.com>',
    to: 'contact@giliagames.com', // o también puedes usar process.env.EMAIL_USER
    replyTo: email, // este es el correo del visitante
    subject: `Nuevo mensaje de ${name}`,
    html: `
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br>${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Mensaje enviado por ${name} <${email}>`);
    res.json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (err) {
    console.error('Error al enviar correo:', err);
    res.status(500).json({ success: false, message: 'Error al enviar el correo.' });
  }
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
