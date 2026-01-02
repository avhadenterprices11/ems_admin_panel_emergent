import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('event_code').unique().notNullable();
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('category').nullable();
    table.string('type').notNullable();
    table.string('event_type').nullable();
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
    table.boolean('all_day').defaultTo(false);
    table.string('timezone').nullable();
    table.string('url_slug').nullable();
    
    // Registration
    table.timestamp('reg_start_at').nullable();
    table.timestamp('reg_end_at').nullable();
    table.integer('capacity').nullable();
    table.boolean('waitlist_enabled').defaultTo(false);
    
    // Venue
    table.string('mode').nullable();
    table.string('venue_id').nullable();
    table.string('venue_name').nullable();
    table.string('location').nullable();
    table.string('address_line1').nullable();
    table.string('address_line2').nullable();
    table.string('city').nullable();
    table.string('state').nullable();
    table.string('zip_code').nullable();
    table.string('country').nullable();
    table.string('meeting_url').nullable();
    table.text('accessibility_notes').nullable();
    table.string('emergency_contact').nullable();
    
    // Owner
    table.string('owner').notNullable();
    
    // Media
    table.string('banner_image_url').nullable();
    table.string('promo_video_url').nullable();
    table.jsonb('gallery_images').nullable();
    
    // SEO
    table.string('meta_title').nullable();
    table.text('meta_description').nullable();
    
    // Settings
    table.string('status').notNullable().defaultTo('Draft');
    table.string('visibility').defaultTo('public');
    table.boolean('is_registration_open').defaultTo(false);
    table.boolean('is_checkin_active').defaultTo(false);
    table.string('check_in_mode').nullable();
    table.integer('data_collection_form_id').nullable();
    
    // People
    table.jsonb('co_hosts').nullable();
    table.jsonb('tags').nullable();
    
    // JSON Structures
    table.jsonb('partners').nullable();
    table.jsonb('sponsors').nullable();
    table.jsonb('agenda').nullable();
    
    // Email
    table.jsonb('email_config').nullable();
    
    // Internal
    table.text('internal_notes').nullable();
    table.string('lifecycle_status').defaultTo('draft');
    
    // Stats
    table.integer('total_registrations').defaultTo(0);
    table.integer('checked_in_count').defaultTo(0);
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('events');
}
