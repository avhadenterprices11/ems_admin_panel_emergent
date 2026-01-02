import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ticket_sales', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('ticket_id').notNullable().references('id').inTable('tickets').onDelete('CASCADE');
    table.bigInteger('registration_id').nullable().references('id').inTable('event_registrations').onDelete('SET NULL');
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('total_amount', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.string('payment_provider').nullable();
    table.string('payment_reference').nullable();
    table.string('status').notNullable().defaultTo('pending'); // pending, paid, refunded, failed
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    table.index('event_id');
    table.index('ticket_id');
    table.index('registration_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('ticket_sales');
}
