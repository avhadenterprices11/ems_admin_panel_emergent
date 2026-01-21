import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('event_branding', (table) => {
    table.increments('id').primary();
    table.integer('event_id').unsigned().notNullable().unique();
    table.foreign('event_id').references('events.id').onDelete('CASCADE');
    
    // Logo URLs
    table.string('light_logo_url', 500).nullable();
    table.string('dark_logo_url', 500).nullable();
    table.string('cover_image_url', 500).nullable();
    
    // Colors (stored as hex)
    table.string('primary_color', 7).defaultTo('#0f172b');
    table.string('secondary_color', 7).defaultTo('#3b82f6');
    
    // Font
    table.string('font_family', 50).defaultTo('inter');
    
    // Audit fields
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by').nullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('event_branding');
}
