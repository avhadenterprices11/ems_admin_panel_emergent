import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('promo_codes', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('code').notNullable();
    table.string('discount_type').notNullable().defaultTo('percentage'); // percentage, fixed
    table.decimal('discount_value', 12, 2).notNullable();
    table.decimal('max_discount_amount', 12, 2).nullable();
    table.decimal('min_order_value', 12, 2).nullable();
    table.string('applicable_to').defaultTo('all'); // all, tickets, addons
    table.jsonb('applicable_items').nullable(); // array of ticket/addon IDs
    table.integer('usage_limit').nullable();
    table.integer('usage_count').defaultTo(0);
    table.timestamp('valid_from').nullable();
    table.timestamp('valid_until').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    table.index('event_id');
    table.index('code');
    table.index('is_active');
    table.unique(['event_id', 'code']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('promo_codes');
}
