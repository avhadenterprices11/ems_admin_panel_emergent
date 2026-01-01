import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('events', (table) => {
    table.bigIncrements('id').primary();
    table.string('event_code', 50).notNullable().unique();
    table.string('name', 255).notNullable();
    table.string('type', 50).notNullable();
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
    table.string('owner', 255).notNullable();
    table.string('location', 255).notNullable();
    table.integer('total_registrations').notNullable().defaultTo(0);
    table.integer('checked_in_count').notNullable().defaultTo(0);
    table.integer('capacity').nullable();
    table.string('status', 50).notNullable().defaultTo('Draft');
    table.boolean('is_registration_open').notNullable().defaultTo(false);
    table.boolean('is_checkin_active').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
    
    table.index(['event_code']);
    table.index(['status']);
    table.index(['type']);
    table.index(['start_date']);
    table.index(['deleted_at']);
    table.index(['owner']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('events');
}
