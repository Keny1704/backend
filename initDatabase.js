// initDatabase.js
import { Client } from 'pg';
import db from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  await client.connect();

  // Crea la base de datos si no existe
  await client.query(`CREATE DATABASE ${process.env.DB_NAME}`)
    .catch(err => {
      if (err.code === '42P04') { // error: database already exists
        console.log('La base de datos ya existe');
      } else {
        console.error(err);
        process.exit(1);
      }
    });

  await client.end();
}

// Función para crear tablas
async function createTables() {
  // Tabla usuarios
  const exists = await db.schema.hasTable('usuarios');
  if (!exists) {
    await db.schema.createTable('usuarios', table => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.string('nombre');
      table.timestamps(true, true);
    });
    console.log('Tabla usuarios creada');
  } else {
    console.log('Tabla usuarios ya existe');
  }

  // Puedes agregar más tablas aquí
  // Ejemplo: tabla productos
  const prodExists = await db.schema.hasTable('productos');
  if (!prodExists) {
    await db.schema.createTable('productos', table => {
      table.increments('id').primary();
      table.string('nombre').notNullable();
      table.decimal('precio', 10, 2).notNullable();
      table.integer('stock').defaultTo(0);
      table.timestamps(true, true);
    });
    console.log('Tabla productos creada');
  } else {
    console.log('Tabla productos ya existe');
  }
}

async function init() {
  await createDatabase();   // Crea la base de datos si no existe
  await createTables();     // Crea las tablas necesarias
  process.exit(0);
}

init();
