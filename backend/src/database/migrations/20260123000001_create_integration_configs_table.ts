import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Integration configs table - stores configuration for all integrations
  // Supports both global defaults (event_id = null) and event-specific overrides
  await knex.schema.createTable('integration_configs', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').nullable().references('id').inTable('events').onDelete('CASCADE');
    
    // Integration type: email, sms, maps, webhook, etc.
    table.string('integration_type').notNullable();
    
    // Provider: sendgrid, smtp, twilio, messagebird, google_maps, etc.
    table.string('provider').notNullable();
    
    // Is this integration enabled?
    table.boolean('is_enabled').defaultTo(false);
    
    // Provider-specific configuration (encrypted sensitive data)
    // For Email (SendGrid): { api_key, from_email, from_name }
    // For Email (SMTP): { host, port, username, password, encryption, from_email }
    // For SMS (Twilio): { account_sid, auth_token, from_number }
    // For SMS (MessageBird): { api_key, originator }
    // For Maps (Google): { api_key }
    table.jsonb('config').defaultTo('{}');
    
    // Connection status
    table.string('status').defaultTo('not_configured'); // not_configured, connected, error
    table.string('status_message').nullable();
    table.timestamp('last_tested_at').nullable();
    
    // Metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Unique constraint: one config per integration type per event (or global)
    table.unique(['event_id', 'integration_type']);
  });

  // Index for faster lookups
  await knex.schema.raw(`
    CREATE INDEX idx_integration_configs_lookup 
    ON integration_configs (integration_type, event_id) 
    WHERE is_deleted = false
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('integration_configs');
}
