import express from 'express'; // Usamos import en lugar de require
import bcrypt from 'bcryptjs';  // Usamos import en lugar de require
import jwt from 'jsonwebtoken'; // Usamos import en lugar de require

const app = express();
const port = 5000;

app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como JSON

// Base de datos simulada (normalmente aquí iría tu base de datos real)
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin', // Contraseña "contraseñaSegura123" encriptada
    role: 'admin',
  },
];

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Por favor ingrese un usuario y una contraseña.' });
  }

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Credenciales incorrectas.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Credenciales incorrectas.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    'secretoSuperSeguro', // Tu clave secreta
    { expiresIn: '1h' } // El token caduca en 1 hora
  );

  return res.status(200).json({
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
