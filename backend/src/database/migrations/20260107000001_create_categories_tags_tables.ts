import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create categories master table
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });

  // Create tags master table
  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.string('color').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });

  // Create event_tags junction table for many-to-many relationship
  await knex.schema.createTable('event_tags', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.integer('tag_id').unsigned().notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['event_id', 'tag_id']);
  });

  // Create event_cohosts table for co-host relationships
  await knex.schema.createTable('event_cohosts', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('role').defaultTo('cohost');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.unique(['event_id', 'user_id']);
  });

  // Create event_media table for gallery images
  await knex.schema.createTable('event_media', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('file_key').notNullable();
    table.string('url').notNullable();
    table.string('file_type').notNullable(); // image, video
    table.string('media_type').notNullable(); // banner, gallery, promo_video
    table.integer('size').nullable();
    table.string('original_name').nullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Add category_id column to events table (foreign key to categories)
  await knex.schema.alterTable('events', (table) => {
    table.integer('category_id').unsigned().nullable().references('id').inTable('categories');
  });

  // Seed default categories
  await knex('categories').insert([
    { name: 'Conference', slug: 'conference', is_active: true },
    { name: 'Workshop', slug: 'workshop', is_active: true },
    { name: 'Meetup', slug: 'meetup', is_active: true },
    { name: 'Awards', slug: 'awards', is_active: true },
    { name: 'Webinar', slug: 'webinar', is_active: true },
    { name: 'Networking', slug: 'networking', is_active: true },
    { name: 'Training', slug: 'training', is_active: true },
    { name: 'Seminar', slug: 'seminar', is_active: true },
  ]);

  // Seed default tags
  await knex('tags').insert([
    { name: 'Technology', slug: 'technology', color: '#3B82F6', is_active: true },
    { name: 'Business', slug: 'business', color: '#10B981', is_active: true },
    { name: 'Innovation', slug: 'innovation', color: '#8B5CF6', is_active: true },
    { name: 'Networking', slug: 'networking', color: '#F59E0B', is_active: true },
    { name: 'Startup', slug: 'startup', color: '#EC4899', is_active: true },
    { name: 'AI', slug: 'ai', color: '#6366F1', is_active: true },
    { name: 'Design', slug: 'design', color: '#14B8A6', is_active: true },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.dropColumn('category_id');
  });
  await knex.schema.dropTableIfExists('event_media');
  await knex.schema.dropTableIfExists('event_cohosts');
  await knex.schema.dropTableIfExists('event_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('categories');
}
