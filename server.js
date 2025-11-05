import express from 'express';
import cors from 'cors';
import knexConfig from './knexfile.js';
import knex from 'knex';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const db = knex(knexConfig.development);
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.get('/api/usuarios', async (req, res) => {
  const usuarios = await db('usuarios').select('*');
  res.json(usuarios);
});

// Registrar usuario (solo prueba)
app.post('/api/register', async (req, res) => {
  const { username, password, nombre } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    const [user] = await db('usuarios').insert({ username, password: hash, nombre }).returning(['id','username','nombre']);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Usuario ya existe' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await db('usuarios').where({ username }).first();
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Middleware para rutas protegidas
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Ejemplo ruta protegida
app.get('/api/profile', authMiddleware, async (req, res) => {
  const user = await db('usuarios').where({ id: req.user.id }).first();
  res.json({ id: user.id, username: user.username, nombre: user.nombre });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
