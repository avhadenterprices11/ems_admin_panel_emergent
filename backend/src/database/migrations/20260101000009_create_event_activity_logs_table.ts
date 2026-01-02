import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_activity_logs', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('actor_type').notNullable(); // system, admin
    table.integer('actor_id').nullable();
    table.string('action_type').notNullable();
    table.text('description').notNullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Append-only table - no updated_at
    table.index('event_id');
    table.index('action_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('event_activity_logs');
}
