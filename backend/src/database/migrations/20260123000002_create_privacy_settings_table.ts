import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Privacy settings table - stores privacy/data configuration
  // Supports both global defaults (event_id = null) and event-specific overrides
  await knex.schema.createTable('privacy_settings', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').nullable().references('id').inTable('events').onDelete('CASCADE');
    
    // GDPR Compliance
    table.boolean('gdpr_consent_enabled').defaultTo(false);
    table.string('privacy_policy_url', 500).nullable();
    table.text('custom_consent_text').nullable(); // Optional custom GDPR consent text
    
    // Data Retention
    // Values: '90', '180', '365', 'forever'
    table.string('data_retention_days').defaultTo('365');
    
    // Data Processing Agreement
    table.boolean('dpa_signed').defaultTo(false);
    table.timestamp('dpa_signed_at').nullable();
    
    // Cookie consent
    table.boolean('cookie_consent_enabled').defaultTo(false);
    
    // Metadata
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Unique constraint: one config per event (or one global)
    table.unique(['event_id']);
  });

  // Create index for faster lookups
  await knex.schema.raw(`
    CREATE INDEX idx_privacy_settings_event 
    ON privacy_settings (event_id) 
    WHERE is_deleted = false
  `);

  // Insert global default
  await knex('privacy_settings').insert({
    event_id: null,
    gdpr_consent_enabled: false,
    privacy_policy_url: null,
    data_retention_days: '365',
    dpa_signed: false,
    cookie_consent_enabled: false
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('privacy_settings');
}
