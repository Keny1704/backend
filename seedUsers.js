// seedUsers.js
import db from './db.js'; // ahora sí existe
import bcrypt from 'bcrypt';

async function seedUsers() {
  const users = [
    { username: 'admin', password: 'admin', nombre: 'Admin', rol: 'admin' },
    { username: 'dependiente', password: 'admin', nombre: 'Dependiente' }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await db('usuarios').insert({ ...user, password: hashedPassword });
  }

  console.log('Usuarios insertados con éxito');
  process.exit(0);
}

seedUsers();
// To run this script, use the command: node seedUsers.js