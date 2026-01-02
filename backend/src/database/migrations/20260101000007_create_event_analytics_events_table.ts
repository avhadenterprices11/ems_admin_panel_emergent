import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_analytics_events', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('event_type').notNullable(); // page_view, add_to_cart, checkout_started, purchase_completed
    table.string('session_id').nullable();
    table.integer('user_id').nullable();
    table.string('source').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Append-only table - no updated_at
    table.index('event_id');
    table.index('event_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('event_analytics_events');
}
