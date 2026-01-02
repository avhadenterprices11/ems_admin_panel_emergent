import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Event Categories
  await knex.schema.createTable('event_categories', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable().unique();
    table.string('slug', 100).notNullable().unique();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Event Tags
  await knex.schema.createTable('event_tags', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100).notNullable().unique();
    table.string('slug', 100).notNullable().unique();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Seed default categories
  await knex('event_categories').insert([
    { name: 'Conference', slug: 'conference' },
    { name: 'Meetup', slug: 'meetup' },
    { name: 'Workshop', slug: 'workshop' },
    { name: 'Awards', slug: 'awards' },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('event_tags');
  await knex.schema.dropTable('event_categories');
}
