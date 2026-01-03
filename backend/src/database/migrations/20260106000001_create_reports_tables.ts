import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create reports table
  await knex.schema.createTable('reports', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().nullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('category', 100).nullable(); // Registrations, Ticket Sales, Revenue & Finance, Attendance
    table.string('data_scope', 50).notNullable().defaultTo('this_event'); // this_event, series, multi
    table.string('visualization_type', 50).notNullable().defaultTo('table'); // table, bar, line, pie, map, kpi
    table.jsonb('config_json').nullable(); // Store full report configuration
    table.string('visibility', 50).notNullable().defaultTo('private'); // private, team, org
    table.boolean('schedule_enabled').defaultTo(false);
    table.string('schedule_frequency', 50).nullable(); // daily, weekly, monthly
    table.text('schedule_recipients').nullable(); // comma-separated emails
    table.integer('created_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);

    table.index('event_id');
    table.index('category');
    table.index('visibility');
    table.index('created_by');
  });

  // Create report_fields table
  await knex.schema.createTable('report_fields', (table) => {
    table.increments('id').primary();
    table.integer('report_id').unsigned().notNullable().references('id').inTable('reports').onDelete('CASCADE');
    table.string('source_type', 50).notNullable(); // event, ticket, registration, checkin
    table.string('field_name', 100).notNullable();
    table.string('field_alias', 100).nullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('report_id');
    table.index('source_type');
  });

  // Create report_filters table
  await knex.schema.createTable('report_filters', (table) => {
    table.increments('id').primary();
    table.integer('report_id').unsigned().notNullable().references('id').inTable('reports').onDelete('CASCADE');
    table.string('field', 100).notNullable();
    table.string('operator', 50).notNullable(); // equals, not_equals, contains, greater_than, less_than, between
    table.text('value').nullable();
    table.string('logic_operator', 10).defaultTo('AND'); // AND, OR
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('report_id');
  });

  // Create report_runs table
  await knex.schema.createTable('report_runs', (table) => {
    table.increments('id').primary();
    table.integer('report_id').unsigned().notNullable().references('id').inTable('reports').onDelete('CASCADE');
    table.timestamp('executed_at').defaultTo(knex.fn.now());
    table.string('status', 50).notNullable().defaultTo('pending'); // pending, running, completed, failed
    table.jsonb('result_snapshot_json').nullable();
    table.integer('row_count').defaultTo(0);
    table.integer('execution_time_ms').nullable();
    table.text('error_message').nullable();
    table.integer('executed_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('report_id');
    table.index('status');
    table.index('executed_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('report_runs');
  await knex.schema.dropTableIfExists('report_filters');
  await knex.schema.dropTableIfExists('report_fields');
  await knex.schema.dropTableIfExists('reports');
}
