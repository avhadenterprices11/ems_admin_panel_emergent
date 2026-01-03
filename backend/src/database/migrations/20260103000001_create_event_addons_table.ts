import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_addons', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('addon_type').notNullable().defaultTo('general'); // merchandise, food, access, general
    table.decimal('price', 12, 2).notNullable().defaultTo(0);
    table.string('currency', 3).defaultTo('USD');
    table.boolean('unlimited_quantity').defaultTo(false);
    table.integer('quantity_limit').nullable();
    table.integer('quantity_sold').defaultTo(0);
    table.integer('per_order_limit').nullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_visible').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    table.index('event_id');
    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('event_addons');
}
