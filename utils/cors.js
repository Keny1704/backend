// Permite solicitudes desde cualquier origen. Puedes personalizarlo para mayor seguridad.
import cors from 'cors';

export default cors({
  origin: 'http://localhost:3000' || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});
