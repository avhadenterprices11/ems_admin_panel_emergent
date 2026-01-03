import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create event_message_templates table
  await knex.schema.createTable('event_message_templates', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.enum('channel', ['email', 'sms']).notNullable().defaultTo('email');
    table.string('subject', 500).nullable(); // Nullable for SMS
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);

    table.index('event_id');
    table.index('channel');
  });

  // Create event_campaigns table
  await knex.schema.createTable('event_campaigns', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.enum('channel', ['email', 'sms']).notNullable().defaultTo('email');
    table.enum('campaign_type', ['one-time', 'trigger-based']).notNullable().defaultTo('one-time');
    table.enum('status', ['draft', 'scheduled', 'sending', 'sent', 'paused', 'failed']).notNullable().defaultTo('draft');
    table.integer('template_id').unsigned().nullable().references('id').inTable('event_message_templates').onDelete('SET NULL');
    table.string('subject', 500).nullable(); // For email campaigns
    table.text('content').nullable();
    table.jsonb('audience_rule').nullable(); // Saved filter/segment reference
    table.timestamp('scheduled_at').nullable();
    table.timestamp('sent_at').nullable();
    table.integer('total_recipients').defaultTo(0);
    table.integer('sent_count').defaultTo(0);
    table.integer('delivered_count').defaultTo(0);
    table.integer('open_count').defaultTo(0);
    table.integer('click_count').defaultTo(0);
    table.integer('bounce_count').defaultTo(0);
    table.integer('unsubscribe_count').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);

    table.index('event_id');
    table.index('status');
    table.index('channel');
    table.index('scheduled_at');
  });

  // Create campaign_recipients table for tracking individual sends
  await knex.schema.createTable('campaign_recipients', (table) => {
    table.increments('id').primary();
    table.integer('campaign_id').unsigned().notNullable().references('id').inTable('event_campaigns').onDelete('CASCADE');
    table.integer('attendee_id').unsigned().nullable().references('id').inTable('event_attendees').onDelete('SET NULL');
    table.string('recipient_email', 255).nullable();
    table.string('recipient_phone', 50).nullable();
    table.string('recipient_name', 255).nullable();
    table.enum('status', ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed']).defaultTo('pending');
    table.timestamp('sent_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamp('opened_at').nullable();
    table.timestamp('clicked_at').nullable();
    table.text('error_message').nullable();
    table.jsonb('metadata').nullable(); // For storing rendered content, tracking IDs, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('campaign_id');
    table.index('attendee_id');
    table.index('status');
    table.index('recipient_email');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('campaign_recipients');
  await knex.schema.dropTableIfExists('event_campaigns');
  await knex.schema.dropTableIfExists('event_message_templates');
}
