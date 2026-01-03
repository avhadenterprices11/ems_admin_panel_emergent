import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create event_attendees table (one row per attendee/registration)
  await knex.schema.createTable('event_attendees', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('registration_id').nullable().references('id').inTable('event_registrations').onDelete('SET NULL');
    table.bigInteger('ticket_id').nullable().references('id').inTable('tickets').onDelete('SET NULL');
    table.string('attendee_name').notNullable();
    table.string('attendee_email').nullable();
    table.string('qr_code_value').notNullable().unique(); // Unique QR token (UUID)
    table.string('checkin_status').defaultTo('not_checked_in'); // not_checked_in, checked_in, no_show
    table.timestamp('checkin_time').nullable();
    table.string('checkin_source').nullable(); // scanner, admin
    table.string('checkin_location').nullable();
    table.bigInteger('checkin_device_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Indexes
    table.index('event_id');
    table.index('registration_id');
    table.index('qr_code_value');
    table.index('checkin_status');
  });

  // Create event_checkin_logs table (audit trail)
  await knex.schema.createTable('event_checkin_logs', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('attendee_id').notNullable().references('id').inTable('event_attendees').onDelete('CASCADE');
    table.bigInteger('device_id').nullable();
    table.string('location').nullable();
    table.string('action').notNullable(); // checkin, undo
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.jsonb('metadata').nullable();
    
    // Indexes
    table.index('event_id');
    table.index('attendee_id');
    table.index('timestamp');
  });

  // Create event_checkin_devices table (device tracking)
  await knex.schema.createTable('event_checkin_devices', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('device_name').notNullable();
    table.string('device_type').nullable(); // scanner, tablet, mobile
    table.string('location').nullable();
    table.integer('total_scans').defaultTo(0);
    table.timestamp('last_seen_at').nullable();
    table.integer('battery_level').nullable();
    table.string('status').defaultTo('offline'); // online, offline
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Indexes
    table.index('event_id');
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('event_checkin_logs');
  await knex.schema.dropTableIfExists('event_checkin_devices');
  await knex.schema.dropTableIfExists('event_attendees');
}
