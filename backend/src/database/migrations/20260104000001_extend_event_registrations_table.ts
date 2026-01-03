import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('event_registrations', (table) => {
    // Registrant details
    table.string('registrant_name').nullable();
    table.string('registrant_email').nullable();
    table.string('registrant_phone').nullable();
    
    // Ticket association
    table.bigInteger('ticket_id').nullable().references('id').inTable('tickets').onDelete('SET NULL');
    table.integer('quantity').defaultTo(1);
    
    // Payment details
    table.string('payment_method').nullable(); // manual, cash, bank_transfer, other, online
    
    // Registration ID for display
    table.string('registration_code').nullable();
    
    // Index for search
    table.index('registrant_name');
    table.index('registrant_email');
    table.index('registration_code');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('event_registrations', (table) => {
    table.dropColumn('registrant_name');
    table.dropColumn('registrant_email');
    table.dropColumn('registrant_phone');
    table.dropColumn('ticket_id');
    table.dropColumn('quantity');
    table.dropColumn('payment_method');
    table.dropColumn('registration_code');
  });
}
