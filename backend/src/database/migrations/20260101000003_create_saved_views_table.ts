import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('saved_views', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('module').notNullable();
    table.jsonb('configuration').notNullable();
    table.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('saved_views');
}
