import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tickets', (table) => {
    // Ticket type and category
    table.string('ticket_type').defaultTo('paid'); // paid, free
    table.string('category').defaultTo('General'); // General, VIP, Student, Sponsor, Custom
    
    // Purchase limits
    table.integer('min_per_order').defaultTo(1);
    table.integer('max_per_order').defaultTo(10);
    
    // Visibility and availability
    table.boolean('is_visible').defaultTo(true);
    table.boolean('is_on_sale').defaultTo(true);
    
    // Internal notes
    table.text('internal_notes').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('tickets', (table) => {
    table.dropColumn('ticket_type');
    table.dropColumn('category');
    table.dropColumn('min_per_order');
    table.dropColumn('max_per_order');
    table.dropColumn('is_visible');
    table.dropColumn('is_on_sale');
    table.dropColumn('internal_notes');
  });
}
