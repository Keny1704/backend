// server.js - Sintaxis ES Modules
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Intento de login:', username);
  
  // Ejemplo de autenticación - cambia esto por tu lógica real
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      token: 'jwt_token_simulado',
      user: {
        id: 1,
        username: username,
        name: 'Usuario Admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas'
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});