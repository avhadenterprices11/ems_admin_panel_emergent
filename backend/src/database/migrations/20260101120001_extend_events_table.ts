import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    // Basic Event Info
    table.text('description');
    table.string('category', 50);
    table.string('event_type', 20);
    table.boolean('all_day').defaultTo(false);
    table.string('timezone', 100);
    table.string('url_slug', 255).unique();
    
    // Registration
    table.timestamp('reg_start_at');
    table.timestamp('reg_end_at');
    table.boolean('waitlist_enabled').defaultTo(false);
    
    // Venue/Location
    table.string('mode', 20);
    table.string('venue_id', 100);
    table.string('venue_name', 255);
    table.string('address_line1', 255);
    table.string('address_line2', 255);
    table.string('city', 100);
    table.string('state', 100);
    table.string('zip_code', 20);
    table.string('country', 100);
    table.text('meeting_url');
    table.text('accessibility_notes');
    table.string('emergency_contact', 255);
    
    // Media (S3 URLs)
    table.text('banner_image_url');
    table.jsonb('gallery_images');
    
    // SEO
    table.string('meta_title', 255);
    table.text('meta_description');
    
    // Settings
    table.string('visibility', 20);
    table.string('check_in_mode', 20);
    table.bigInteger('data_collection_form_id');
    
    // People
    table.jsonb('co_hosts');
    table.jsonb('tags');
    
    // JSON Structures
    table.jsonb('partners');
    table.jsonb('sponsors');
    table.jsonb('agenda');
    
    // Email Configuration
    table.jsonb('email_config');
    
    // Internal
    table.text('internal_notes');
    table.string('lifecycle_status', 20).defaultTo('draft');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.dropColumn('description');
    table.dropColumn('category');
    table.dropColumn('event_type');
    table.dropColumn('all_day');
    table.dropColumn('timezone');
    table.dropColumn('url_slug');
    table.dropColumn('reg_start_at');
    table.dropColumn('reg_end_at');
    table.dropColumn('waitlist_enabled');
    table.dropColumn('mode');
    table.dropColumn('venue_id');
    table.dropColumn('venue_name');
    table.dropColumn('address_line1');
    table.dropColumn('address_line2');
    table.dropColumn('city');
    table.dropColumn('state');
    table.dropColumn('zip_code');
    table.dropColumn('country');
    table.dropColumn('meeting_url');
    table.dropColumn('accessibility_notes');
    table.dropColumn('emergency_contact');
    table.dropColumn('banner_image_url');
    table.dropColumn('gallery_images');
    table.dropColumn('meta_title');
    table.dropColumn('meta_description');
    table.dropColumn('visibility');
    table.dropColumn('check_in_mode');
    table.dropColumn('data_collection_form_id');
    table.dropColumn('co_hosts');
    table.dropColumn('tags');
    table.dropColumn('partners');
    table.dropColumn('sponsors');
    table.dropColumn('agenda');
    table.dropColumn('email_config');
    table.dropColumn('internal_notes');
    table.dropColumn('lifecycle_status');
  });
}
