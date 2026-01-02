import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('refunds', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('registration_id').nullable().references('id').inTable('event_registrations').onDelete('SET NULL');
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('status').notNullable().defaultTo('pending'); // pending, approved, rejected, processed
    table.text('reason').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('event_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('refunds');
}
