import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create audience_segments table
  await knex.schema.createTable('audience_segments', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('description', 500).nullable();
    table.enum('match_type', ['ALL', 'ANY']).notNullable().defaultTo('ALL');
    table.jsonb('rules_json').notNullable().defaultTo('[]');
    table.integer('estimated_count').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_evaluated_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);

    table.index('event_id');
    table.index('is_active');
  });

  // Create audience_segment_members table (cache for performance)
  await knex.schema.createTable('audience_segment_members', (table) => {
    table.increments('id').primary();
    table.integer('segment_id').unsigned().notNullable().references('id').inTable('audience_segments').onDelete('CASCADE');
    table.integer('attendee_id').unsigned().notNullable().references('id').inTable('event_attendees').onDelete('CASCADE');
    table.timestamp('last_evaluated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['segment_id', 'attendee_id']);
    table.index('segment_id');
    table.index('attendee_id');
  });

  // Create communication_settings table
  await knex.schema.createTable('communication_settings', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('default_sender_name', 255).nullable();
    table.string('reply_to_email', 255).nullable();
    table.string('sms_sender_id', 50).nullable();
    table.boolean('email_enabled').defaultTo(true);
    table.boolean('sms_enabled').defaultTo(false);
    table.time('quiet_hours_start').nullable();
    table.time('quiet_hours_end').nullable();
    table.boolean('opt_out_enabled').defaultTo(true);
    table.boolean('track_opens').defaultTo(true);
    table.boolean('track_clicks').defaultTo(true);
    table.string('unsubscribe_page_url', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique('event_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audience_segment_members');
  await knex.schema.dropTableIfExists('audience_segments');
  await knex.schema.dropTableIfExists('communication_settings');
}
