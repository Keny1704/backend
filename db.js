// db.js
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config(); // Para leer las variables de tu .env

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'tigre+1704',
    database: process.env.DB_NAME || 'keny_joyeria',
    port: process.env.DB_PORT || 5432,
  }
});

export default db;
