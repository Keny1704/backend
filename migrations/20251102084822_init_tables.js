// migrations/20251102_init_tables.js
export async function up(knex) {
  // Tabla de usuarios
  await knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('nombre', 100).notNullable();
  });

  // Tabla de productos
  await knex.schema.createTable('productos', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.decimal('precio', 10, 2).notNullable();
    table.integer('stock').defaultTo(0);
  });

  // Tabla de ventas
  await knex.schema.createTable('ventas', (table) => {
    table.increments('id').primary();
    table.integer('id_usuario').unsigned().references('id').inTable('usuarios');
    table.timestamp('fecha').defaultTo(knex.fn.now());
    table.decimal('total', 10, 2).notNullable();
  });

  // Tabla de historial
  await knex.schema.createTable('historial', (table) => {
    table.increments('id').primary();
    table.integer('id_usuario').unsigned().references('id').inTable('usuarios');
    table.string('accion', 255);
    table.timestamp('fecha').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('historial');
  await knex.schema.dropTableIfExists('ventas');
  await knex.schema.dropTableIfExists('productos');
  await knex.schema.dropTableIfExists('usuarios');
}
