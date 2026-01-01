import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('saved_views', (table) => {
    table.bigIncrements('id').primary();
    table.string('user_id', 255).nullable();
    table.string('module', 50).notNullable();
    table.string('name', 255).notNullable();
    table.jsonb('configuration').notNullable();
    table.boolean('is_default').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    table.index(['module']);
    table.index(['user_id']);
    table.index(['deleted_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('saved_views');
}
