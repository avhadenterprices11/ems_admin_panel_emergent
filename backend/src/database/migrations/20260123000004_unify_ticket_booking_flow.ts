import { Knex } from 'knex';

/**
 * MIGRATION: Unify Ticket Booking Flow
 * 
 * This migration consolidates all ticket issuance data into the `issued_tickets` table
 * as the SINGLE SOURCE OF TRUTH for ticket booking/issuance.
 * 
 * Changes:
 * 1. Add missing columns to issued_tickets (from tickets table context)
 * 2. Add proper indexes for performance
 * 3. Add unique constraint on (event_id, unique_code)
 * 4. Migrate existing data from ticket_sales to issued_tickets
 * 5. Mark ticket_sales as deprecated (keep for data retention, but stop using)
 */

export async function up(knex: Knex): Promise<void> {
  // 1. Add missing columns to issued_tickets table
  await knex.schema.alterTable('issued_tickets', (table) => {
    // Registration reference (for integration with event_registrations)
    table.bigInteger('registration_id').nullable().references('id').inTable('event_registrations').onDelete('SET NULL');
    
    // Pricing information (captured at time of issuance)
    table.decimal('unit_price', 12, 2).nullable();
    table.decimal('total_price', 12, 2).nullable();
    table.string('currency', 3).defaultTo('USD');
    
    // Quantity (for bundles - normally 1 issued_ticket = 1 ticket)
    table.integer('quantity').defaultTo(1);
    
    // Payment info (captured at time of issuance)
    table.string('payment_status', 50).defaultTo('pending');
    table.string('payment_method', 100).nullable();
    table.string('payment_reference', 255).nullable();
    
    // Order/booking reference (can link to external order systems)
    table.string('order_reference', 255).nullable();
    
    // Additional holder info
    table.text('notes').nullable();
    
    // Expiry tracking
    table.timestamp('expires_at').nullable();
    
    // Transfer tracking
    table.boolean('is_transferable').defaultTo(false);
    table.bigInteger('transferred_from_id').nullable();
    table.timestamp('transferred_at').nullable();
  });

  // 2. Add indexes for performance
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_issued_tickets_registration_id ON issued_tickets(registration_id) WHERE is_deleted = false;
    CREATE INDEX IF NOT EXISTS idx_issued_tickets_payment_status ON issued_tickets(payment_status) WHERE is_deleted = false;
    CREATE INDEX IF NOT EXISTS idx_issued_tickets_order_reference ON issued_tickets(order_reference) WHERE is_deleted = false;
    CREATE INDEX IF NOT EXISTS idx_issued_tickets_expires_at ON issued_tickets(expires_at) WHERE is_deleted = false AND expires_at IS NOT NULL;
  `);

  // 3. Add unique constraint on (event_id, unique_code) if not exists
  // First check if constraint exists
  const constraintExists = await knex.raw(`
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'issued_tickets_event_unique_code_unique' 
    AND conrelid = 'issued_tickets'::regclass
  `);

  if (constraintExists.rows.length === 0) {
    await knex.schema.raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_issued_tickets_unique_code_unique 
      ON issued_tickets(unique_code) 
      WHERE is_deleted = false
    `);
  }

  // 4. Migrate existing data from ticket_sales to issued_tickets
  // Only migrate records that don't already exist in issued_tickets
  const ticketSalesExist = await knex.schema.hasTable('ticket_sales');
  if (ticketSalesExist) {
    // Get ticket_sales records that need migration
    const salesRecords = await knex('ticket_sales as ts')
      .leftJoin('tickets as t', 'ts.ticket_id', 't.id')
      .leftJoin('event_registrations as er', 'ts.registration_id', 'er.id')
      .leftJoin('events as e', 'ts.event_id', 'e.id')
      .where('ts.is_deleted', false)
      .select(
        'ts.id as sale_id',
        'ts.event_id',
        'ts.ticket_id',
        'ts.registration_id',
        'ts.quantity',
        'ts.unit_price',
        'ts.total_amount',
        'ts.currency',
        'ts.payment_provider',
        'ts.payment_reference',
        'ts.status',
        'ts.created_at',
        'er.registrant_name',
        'er.registrant_email',
        'er.registrant_phone',
        't.name as ticket_name'
      );

    // For each sale, create issued tickets if not already created
    for (const sale of salesRecords) {
      // Check if issued tickets already exist for this registration
      if (sale.registration_id) {
        const existingTicket = await knex('issued_tickets')
          .where('registration_id', sale.registration_id)
          .where('is_deleted', false)
          .first();

        if (existingTicket) {
          // Already migrated, update with pricing info
          await knex('issued_tickets')
            .where('id', existingTicket.id)
            .update({
              unit_price: sale.unit_price,
              total_price: sale.total_amount,
              currency: sale.currency,
              payment_status: sale.status,
              payment_method: sale.payment_provider,
              payment_reference: sale.payment_reference
            });
          continue;
        }
      }

      // Create issued tickets for each quantity
      for (let i = 0; i < (sale.quantity || 1); i++) {
        const uniqueCode = generateUniqueCode();
        const ticketNumber = generateTicketNumber();

        await knex('issued_tickets').insert({
          ticket_number: ticketNumber,
          unique_code: uniqueCode,
          event_id: sale.event_id,
          booking_id: null, // Legacy migration - no booking
          registration_id: sale.registration_id,
          ticket_type_id: sale.ticket_id,
          holder_name: sale.registrant_name || 'Unknown',
          holder_email: sale.registrant_email,
          holder_phone: sale.registrant_phone,
          qr_payload: `${sale.event_id}-0-${uniqueCode}-MIGR`,
          status: sale.status === 'completed' ? 'valid' : 'pending',
          is_checked_in: false,
          unit_price: sale.unit_price,
          total_price: sale.total_amount / (sale.quantity || 1),
          currency: sale.currency,
          payment_status: sale.status,
          payment_method: sale.payment_provider,
          payment_reference: sale.payment_reference,
          metadata: JSON.stringify({ 
            migrated_from: 'ticket_sales',
            original_sale_id: sale.sale_id 
          }),
          created_at: sale.created_at
        });
      }
    }
  }

  // 5. Mark ticket_sales as deprecated by adding a comment
  await knex.schema.raw(`
    COMMENT ON TABLE ticket_sales IS 'DEPRECATED: Use issued_tickets table instead. This table is kept for historical data only.';
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove comment
  await knex.schema.raw(`
    COMMENT ON TABLE ticket_sales IS NULL;
  `);

  // Remove indexes
  await knex.schema.raw(`
    DROP INDEX IF EXISTS idx_issued_tickets_registration_id;
    DROP INDEX IF EXISTS idx_issued_tickets_payment_status;
    DROP INDEX IF EXISTS idx_issued_tickets_order_reference;
    DROP INDEX IF EXISTS idx_issued_tickets_expires_at;
    DROP INDEX IF EXISTS idx_issued_tickets_unique_code_unique;
  `);

  // Remove added columns from issued_tickets
  await knex.schema.alterTable('issued_tickets', (table) => {
    table.dropColumn('registration_id');
    table.dropColumn('unit_price');
    table.dropColumn('total_price');
    table.dropColumn('currency');
    table.dropColumn('quantity');
    table.dropColumn('payment_status');
    table.dropColumn('payment_method');
    table.dropColumn('payment_reference');
    table.dropColumn('order_reference');
    table.dropColumn('notes');
    table.dropColumn('expires_at');
    table.dropColumn('is_transferable');
    table.dropColumn('transferred_from_id');
    table.dropColumn('transferred_at');
  });
}

// Helper functions for migration
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${timestamp}-${random}`;
}
