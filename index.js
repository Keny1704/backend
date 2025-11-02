// backend/index.js o app.js

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Ejemplo: usuario y contraseña fijos
  if (username === 'admin' && password === '1234') {
    res.json({
      user: { username: 'admin', role: 'admin' },
      token: 'fake-jwt-token'
    });
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});

// Puerto donde corre el backend
app.listen(5000, () => {
  console.log('Backend corriendo en http://localhost:5000');
});