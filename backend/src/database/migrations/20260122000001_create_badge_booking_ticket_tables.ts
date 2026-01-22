import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Badge Designs table - stores badge/ticket visual configurations
  await knex.schema.createTable('badge_designs', (table) => {
    table.bigIncrements('id').primary();
    table.integer('event_id').nullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('ticket_type_id').nullable().references('id').inTable('tickets').onDelete('CASCADE');
    table.string('name').notNullable();
    table.boolean('is_global_default').defaultTo(false);
    table.boolean('is_event_default').defaultTo(false);
    
    // Badge Size Configuration
    table.string('badge_size').defaultTo('a6'); // a6, credit, custom
    table.integer('custom_width').nullable(); // mm
    table.integer('custom_height').nullable(); // mm
    table.string('orientation').defaultTo('portrait'); // portrait, landscape
    
    // Design Config (JSON)
    // Contains: visible_fields[], field_positions, font_size_scale, colors, logo_url, etc.
    table.jsonb('design_config').defaultTo(JSON.stringify({
      visible_fields: ['full_name', 'ticket_type', 'company', 'job_title', 'qr_code'],
      field_positions: {},
      font_size_scale: 1.0,
      primary_color: '#0f172b',
      secondary_color: '#3b82f6',
      background_color: '#ffffff',
      logo_url: null,
      show_punch_hole: true,
      qr_code_size: 80
    }));
    
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Indexes
    table.index(['event_id', 'is_deleted']);
    table.index(['ticket_type_id', 'is_deleted']);
    table.index(['is_global_default']);
  });

  // Bookings table - stores order/booking records (reusable for public API)
  await knex.schema.createTable('bookings', (table) => {
    table.bigIncrements('id').primary();
    table.string('booking_code').notNullable().unique(); // Public-facing booking reference
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('registration_id').nullable().references('id').inTable('event_registrations').onDelete('SET NULL');
    
    // Customer Information
    table.string('customer_name').notNullable();
    table.string('customer_email').notNullable();
    table.string('customer_phone').nullable();
    
    // Booking Status
    table.string('status').notNullable().defaultTo('pending'); // pending, confirmed, cancelled, refunded
    table.string('payment_status').notNullable().defaultTo('pending'); // pending, paid, failed, refunded
    table.string('payment_method').nullable();
    table.string('payment_reference').nullable();
    
    // Financial
    table.decimal('subtotal', 12, 2).defaultTo(0);
    table.decimal('tax_amount', 12, 2).defaultTo(0);
    table.decimal('discount_amount', 12, 2).defaultTo(0);
    table.decimal('total_amount', 12, 2).defaultTo(0);
    table.string('currency', 3).defaultTo('USD');
    table.string('promo_code').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    table.string('source').defaultTo('admin'); // admin, website, api
    
    table.timestamp('booked_at').defaultTo(knex.fn.now());
    table.timestamp('confirmed_at').nullable();
    table.timestamp('cancelled_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Indexes
    table.index(['event_id', 'is_deleted']);
    table.index(['booking_code']);
    table.index(['customer_email']);
    table.index(['status']);
  });

  // Booking Items table - line items in a booking
  await knex.schema.createTable('booking_items', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('booking_id').notNullable().references('id').inTable('bookings').onDelete('CASCADE');
    table.bigInteger('ticket_id').nullable().references('id').inTable('tickets').onDelete('SET NULL');
    table.bigInteger('addon_id').nullable().references('id').inTable('event_addons').onDelete('SET NULL');
    
    table.string('item_type').notNullable(); // ticket, addon
    table.string('item_name').notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('total_price', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['booking_id']);
  });

  // Issued Tickets table - actual tickets issued after booking confirmation
  await knex.schema.createTable('issued_tickets', (table) => {
    table.bigIncrements('id').primary();
    table.string('ticket_number').notNullable().unique(); // Public-facing ticket number
    table.string('unique_code', 6).notNullable().unique(); // 6-char alphanumeric fallback code
    
    table.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.bigInteger('booking_id').notNullable().references('id').inTable('bookings').onDelete('CASCADE');
    table.bigInteger('booking_item_id').nullable().references('id').inTable('booking_items').onDelete('SET NULL');
    table.bigInteger('ticket_type_id').nullable().references('id').inTable('tickets').onDelete('SET NULL');
    table.bigInteger('attendee_id').nullable().references('id').inTable('event_attendees').onDelete('SET NULL');
    
    // Ticket Holder
    table.string('holder_name').notNullable();
    table.string('holder_email').nullable();
    table.string('holder_phone').nullable();
    table.string('holder_company').nullable();
    table.string('holder_job_title').nullable();
    
    // QR Code Data
    table.string('qr_payload').notNullable(); // Encoded/signed payload for QR
    table.string('qr_image_url').nullable(); // Pre-generated QR image URL
    
    // Badge Design Reference
    table.bigInteger('badge_design_id').nullable().references('id').inTable('badge_designs').onDelete('SET NULL');
    
    // Status
    table.string('status').notNullable().defaultTo('valid'); // valid, used, cancelled, expired
    table.boolean('is_checked_in').defaultTo(false);
    table.timestamp('checked_in_at').nullable();
    table.string('checkin_method').nullable(); // qr, code, manual
    table.string('checkin_location').nullable();
    table.bigInteger('checkin_device_id').nullable();
    
    // Metadata
    table.jsonb('metadata').nullable();
    
    table.timestamp('issued_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_deleted').defaultTo(false);
    
    // Indexes
    table.index(['event_id', 'is_deleted']);
    table.index(['booking_id']);
    table.index(['unique_code']);
    table.index(['qr_payload']);
    table.index(['holder_email']);
    table.index(['status']);
    table.index(['is_checked_in']);
  });

  // Add unique_code column to event_attendees for backward compatibility
  await knex.schema.alterTable('event_attendees', (table) => {
    table.string('unique_code', 6).nullable().unique();
    table.bigInteger('issued_ticket_id').nullable().references('id').inTable('issued_tickets').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove columns from event_attendees
  await knex.schema.alterTable('event_attendees', (table) => {
    table.dropColumn('unique_code');
    table.dropColumn('issued_ticket_id');
  });
  
  await knex.schema.dropTableIfExists('issued_tickets');
  await knex.schema.dropTableIfExists('booking_items');
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('badge_designs');
}
