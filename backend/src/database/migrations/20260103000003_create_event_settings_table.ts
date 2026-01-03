import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_settings', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE').unique();
    
    // Tax & Fees
    table.boolean('pass_fees_to_attendees').defaultTo(false);
    table.boolean('charge_tax').defaultTo(false);
    table.string('tax_type').nullable(); // vat, gst, sales_tax
    table.decimal('tax_rate', 5, 2).nullable();
    
    // Refund Policy
    table.string('refund_policy').defaultTo('no_refunds'); // no_refunds, full_refund, partial_refund, custom
    table.integer('refund_deadline_days').nullable();
    table.decimal('refund_percentage', 5, 2).nullable();
    
    // Ticket Sales Rules
    table.boolean('allow_transfers').defaultTo(false);
    table.boolean('allow_cancellations').defaultTo(false);
    table.boolean('lock_changes_after_event_start').defaultTo(true);
    
    // Ticket Visibility Rules
    table.boolean('hide_sold_out_tickets').defaultTo(false);
    table.boolean('auto_hide_past_tickets').defaultTo(true);
    
    // Registration Approval
    table.string('approval_mode').defaultTo('auto'); // auto, manual
    table.integer('pending_approval_expiry_hours').nullable();
    
    // Confirmation & Invoices
    table.boolean('auto_send_confirmation').defaultTo(true);
    table.boolean('attach_invoice').defaultTo(false);
    table.boolean('show_tax_breakdown').defaultTo(false);
    
    // Capacity Rules
    table.boolean('stop_sales_when_full').defaultTo(true);
    table.boolean('allow_admin_overselling').defaultTo(false);
    table.boolean('auto_enable_waitlist').defaultTo(false);
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('event_settings');
}
