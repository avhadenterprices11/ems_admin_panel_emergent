import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_registrations', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.integer('user_id').nullable();
    table.string('status').notNullable().defaultTo('started'); // started, completed, cancelled, refunded, expired
    table.string('registration_source').notNullable().defaultTo('web'); // web, mobile, admin, api
    table.string('payment_status').nullable().defaultTo('pending'); // pending, paid, failed, refunded
    table.decimal('total_amount', 12, 2).defaultTo(0);
    table.string('currency', 3).defaultTo('USD');
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    table.index('event_id');
    table.index('status');
    table.index('payment_status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('event_registrations');
}
