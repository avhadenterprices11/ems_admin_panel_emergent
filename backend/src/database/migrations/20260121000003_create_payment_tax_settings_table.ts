import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payment_tax_settings', (table) => {
    table.increments('id').primary();
    
    // event_id is nullable - NULL means global default, otherwise event-specific
    table.integer('event_id').unsigned().nullable();
    table.foreign('event_id').references('events.id').onDelete('CASCADE');
    
    // Currency
    table.string('currency', 3).defaultTo('USD');
    
    // Payment Methods (enabled flags)
    table.boolean('stripe_enabled').defaultTo(true);
    table.boolean('razorpay_enabled').defaultTo(false);
    table.boolean('offline_enabled').defaultTo(true);
    
    // Tax Configuration
    table.boolean('tax_enabled').defaultTo(false);
    table.string('tax_name', 50).defaultTo('VAT');
    table.decimal('tax_percentage', 5, 2).defaultTo(0);
    
    // Invoice Details
    table.string('legal_entity_name', 255).nullable();
    table.text('billing_address').nullable();
    table.string('tax_id', 100).nullable();
    
    // Audit fields
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Ensure uniqueness - only one record per event (or one global)
    table.unique(['event_id']);
  });

  // Insert global default settings (event_id = null)
  await knex('payment_tax_settings').insert({
    event_id: null,
    currency: 'USD',
    stripe_enabled: true,
    razorpay_enabled: false,
    offline_enabled: true,
    tax_enabled: false,
    tax_name: 'VAT',
    tax_percentage: 0,
    legal_entity_name: null,
    billing_address: null,
    tax_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_tax_settings');
}
