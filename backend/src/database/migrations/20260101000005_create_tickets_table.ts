import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tickets', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description').nullable();
    table.decimal('price', 12, 2).notNullable().defaultTo(0);
    table.string('currency', 3).defaultTo('USD');
    table.integer('capacity').nullable();
    table.integer('sold_count').defaultTo(0);
    table.string('status').notNullable().defaultTo('draft'); // draft, on_sale, sold_out, ended
    table.timestamp('sales_start_at').nullable();
    table.timestamp('sales_end_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    table.index('event_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tickets');
}
