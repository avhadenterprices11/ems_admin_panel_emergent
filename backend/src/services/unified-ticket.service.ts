import db from '../database/db';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * UNIFIED TICKET SERVICE
 * 
 * This service is the SINGLE SOURCE OF TRUTH for all ticket operations.
 * All ticket issuance, lookup, check-in, and management goes through this service.
 * 
 * Data is stored in the `issued_tickets` table only.
 * Ticket type definitions remain in the `tickets` table.
 * Ticket booking rules remain in `event_settings`.
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface IssuedTicket {
  id: number;
  ticket_number: string;
  unique_code: string;
  event_id: number;
  booking_id: number | null;
  registration_id: number | null;
  ticket_type_id: number | null;
  holder_name: string;
  holder_email: string | null;
  holder_phone: string | null;
  qr_payload: string;
  qr_image_url: string | null;
  status: 'pending' | 'valid' | 'used' | 'cancelled' | 'expired' | 'revoked';
  is_checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  unit_price: number | null;
  total_price: number | null;
  currency: string;
  quantity: number;
  payment_status: 'pending' | 'completed' | 'refunded' | 'failed';
  payment_method: string | null;
  payment_reference: string | null;
  order_reference: string | null;
  notes: string | null;
  expires_at: string | null;
  is_transferable: boolean;
  transferred_from_id: number | null;
  transferred_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateTicketInput {
  event_id: number;
  booking_id?: number;
  registration_id?: number;
  ticket_type_id?: number;
  holder_name: string;
  holder_email?: string;
  holder_phone?: string;
  unit_price?: number;
  total_price?: number;
  currency?: string;
  quantity?: number;
  payment_status?: 'pending' | 'completed' | 'refunded' | 'failed';
  payment_method?: string;
  payment_reference?: string;
  order_reference?: string;
  notes?: string;
  expires_at?: string;
  is_transferable?: boolean;
  metadata?: any;
}

export interface UpdateTicketInput {
  holder_name?: string;
  holder_email?: string;
  holder_phone?: string;
  status?: 'pending' | 'valid' | 'used' | 'cancelled' | 'expired' | 'revoked';
  payment_status?: 'pending' | 'completed' | 'refunded' | 'failed';
  notes?: string;
  expires_at?: string;
  metadata?: any;
}

export interface CheckInInput {
  qr_payload?: string;
  unique_code?: string;
  checked_in_by?: string;
}

export interface CheckInResult {
  success: boolean;
  ticket?: IssuedTicket;
  message: string;
  already_checked_in?: boolean;
}

export interface TicketWithDetails extends IssuedTicket {
  event_name?: string;
  ticket_type_name?: string;
  booking_code?: string;
}

export interface TicketStats {
  total_issued: number;
  total_checked_in: number;
  total_pending: number;
  total_valid: number;
  total_cancelled: number;
  total_expired: number;
  total_revenue: number;
}

// ============================================================================
// UNIFIED TICKET SERVICE
// ============================================================================

export class UnifiedTicketService {
  private qrCodeDir: string;

  constructor() {
    this.qrCodeDir = path.join(process.cwd(), 'uploads', 'qr-codes');
    if (!fs.existsSync(this.qrCodeDir)) {
      fs.mkdirSync(this.qrCodeDir, { recursive: true });
    }
  }

  // --------------------------------------------------------------------------
  // TICKET ISSUANCE
  // --------------------------------------------------------------------------

  /**
   * Issue a new ticket (SINGLE SOURCE OF TRUTH)
   * Creates a record in issued_tickets table with QR code
   */
  async issueTicket(input: CreateTicketInput): Promise<IssuedTicket> {
    const ticketNumber = this.generateTicketNumber();
    const uniqueCode = this.generateUniqueCode();
    const qrPayload = `${input.event_id}-${input.booking_id || 0}-${uniqueCode}-${Date.now()}`;

    // Generate QR code image
    const qrImageUrl = await this.generateQRCode(qrPayload, ticketNumber);

    // Determine initial status
    let status: 'pending' | 'valid' = 'pending';
    if (input.payment_status === 'completed' || !input.unit_price || input.unit_price === 0) {
      status = 'valid';
    }

    const [ticket] = await db('issued_tickets')
      .insert({
        ticket_number: ticketNumber,
        unique_code: uniqueCode,
        event_id: input.event_id,
        booking_id: input.booking_id || null,
        registration_id: input.registration_id || null,
        ticket_type_id: input.ticket_type_id || null,
        holder_name: input.holder_name,
        holder_email: input.holder_email || null,
        holder_phone: input.holder_phone || null,
        qr_payload: qrPayload,
        qr_image_url: qrImageUrl,
        status,
        is_checked_in: false,
        unit_price: input.unit_price || null,
        total_price: input.total_price || input.unit_price || null,
        currency: input.currency || 'USD',
        quantity: input.quantity || 1,
        payment_status: input.payment_status || 'pending',
        payment_method: input.payment_method || null,
        payment_reference: input.payment_reference || null,
        order_reference: input.order_reference || null,
        notes: input.notes || null,
        expires_at: input.expires_at || null,
        is_transferable: input.is_transferable || false,
        metadata: JSON.stringify(input.metadata || {}),
      })
      .returning('*');

    // Update ticket type sold count if applicable
    if (input.ticket_type_id) {
      await db('tickets')
        .where('id', input.ticket_type_id)
        .increment('sold_count', input.quantity || 1);
    }

    return this.parseTicket(ticket);
  }

  /**
   * Issue multiple tickets for a booking (batch operation)
   */
  async issueTicketsForBooking(
    bookingId: number,
    eventId: number,
    items: Array<{
      ticket_type_id: number;
      quantity: number;
      unit_price: number;
      holder_name: string;
      holder_email?: string;
      holder_phone?: string;
    }>,
    paymentStatus: 'pending' | 'completed' = 'pending'
  ): Promise<IssuedTicket[]> {
    const issuedTickets: IssuedTicket[] = [];

    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticket = await this.issueTicket({
          event_id: eventId,
          booking_id: bookingId,
          ticket_type_id: item.ticket_type_id,
          holder_name: item.holder_name,
          holder_email: item.holder_email,
          holder_phone: item.holder_phone,
          unit_price: item.unit_price,
          payment_status: paymentStatus,
        });
        issuedTickets.push(ticket);
      }
    }

    return issuedTickets;
  }

  /**
   * Issue ticket for a registration
   */
  async issueTicketForRegistration(
    registrationId: number,
    eventId: number,
    ticketTypeId: number | null,
    holderName: string,
    holderEmail: string | null,
    holderPhone: string | null,
    unitPrice: number = 0,
    paymentStatus: 'pending' | 'completed' = 'pending'
  ): Promise<IssuedTicket> {
    return this.issueTicket({
      event_id: eventId,
      registration_id: registrationId,
      ticket_type_id: ticketTypeId || undefined,
      holder_name: holderName,
      holder_email: holderEmail || undefined,
      holder_phone: holderPhone || undefined,
      unit_price: unitPrice,
      payment_status: paymentStatus,
    });
  }

  // --------------------------------------------------------------------------
  // TICKET LOOKUP
  // --------------------------------------------------------------------------

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: number): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .first();

    return ticket ? this.parseTicket(ticket) : null;
  }

  /**
   * Get ticket by unique code
   */
  async getTicketByUniqueCode(uniqueCode: string): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets')
      .where('unique_code', uniqueCode.toUpperCase())
      .where('is_deleted', false)
      .first();

    return ticket ? this.parseTicket(ticket) : null;
  }

  /**
   * Get ticket by QR payload
   */
  async getTicketByQRPayload(qrPayload: string): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets')
      .where('qr_payload', qrPayload)
      .where('is_deleted', false)
      .first();

    return ticket ? this.parseTicket(ticket) : null;
  }

  /**
   * Get ticket by ticket number
   */
  async getTicketByNumber(ticketNumber: string): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets')
      .where('ticket_number', ticketNumber)
      .where('is_deleted', false)
      .first();

    return ticket ? this.parseTicket(ticket) : null;
  }

  /**
   * Get all tickets for an event with pagination
   */
  async getEventTickets(
    eventId: number,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      checked_in?: boolean;
    } = {}
  ): Promise<{ tickets: TicketWithDetails[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50, status, search, checked_in } = options;
    const offset = (page - 1) * limit;

    // Build base where conditions
    let countQuery = db('issued_tickets')
      .where('event_id', eventId)
      .where('is_deleted', false);

    if (status) {
      countQuery = countQuery.where('status', status);
    }
    if (checked_in !== undefined) {
      countQuery = countQuery.where('is_checked_in', checked_in);
    }
    if (search) {
      countQuery = countQuery.where(function () {
        this.where('holder_name', 'ilike', `%${search}%`)
          .orWhere('holder_email', 'ilike', `%${search}%`)
          .orWhere('ticket_number', 'ilike', `%${search}%`)
          .orWhere('unique_code', 'ilike', `%${search}%`);
      });
    }

    // Get total count
    const countResult = await countQuery.clone().count('* as count').first();
    const total = parseInt((countResult as any)?.count || '0', 10);

    // Build data query with joins
    let dataQuery = db('issued_tickets as it')
      .leftJoin('events as e', 'it.event_id', 'e.id')
      .leftJoin('tickets as t', 'it.ticket_type_id', 't.id')
      .leftJoin('bookings as b', 'it.booking_id', 'b.id')
      .where('it.event_id', eventId)
      .where('it.is_deleted', false)
      .select(
        'it.*',
        'e.name as event_name',
        't.name as ticket_type_name',
        'b.booking_code'
      );

    if (status) {
      dataQuery = dataQuery.where('it.status', status);
    }
    if (checked_in !== undefined) {
      dataQuery = dataQuery.where('it.is_checked_in', checked_in);
    }
    if (search) {
      dataQuery = dataQuery.where(function () {
        this.where('it.holder_name', 'ilike', `%${search}%`)
          .orWhere('it.holder_email', 'ilike', `%${search}%`)
          .orWhere('it.ticket_number', 'ilike', `%${search}%`)
          .orWhere('it.unique_code', 'ilike', `%${search}%`);
      });
    }

    const tickets = await dataQuery
      .orderBy('it.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      tickets: tickets.map(t => this.parseTicketWithDetails(t)),
      total,
      page,
      limit,
    };
  }

  /**
   * Get tickets for a booking
   */
  async getBookingTickets(bookingId: number): Promise<IssuedTicket[]> {
    const tickets = await db('issued_tickets')
      .where('booking_id', bookingId)
      .where('is_deleted', false)
      .orderBy('created_at', 'asc');

    return tickets.map(t => this.parseTicket(t));
  }

  /**
   * Get tickets for a registration
   */
  async getRegistrationTickets(registrationId: number): Promise<IssuedTicket[]> {
    const tickets = await db('issued_tickets')
      .where('registration_id', registrationId)
      .where('is_deleted', false)
      .orderBy('created_at', 'asc');

    return tickets.map(t => this.parseTicket(t));
  }

  // --------------------------------------------------------------------------
  // CHECK-IN
  // --------------------------------------------------------------------------

  /**
   * Check in a ticket (SINGLE CHECK-IN POINT)
   * Validates and marks ticket as checked in
   */
  async checkInTicket(eventId: number, input: CheckInInput): Promise<CheckInResult> {
    let ticket: any = null;

    // Find ticket by QR payload or unique code
    if (input.qr_payload) {
      ticket = await db('issued_tickets')
        .where('qr_payload', input.qr_payload)
        .where('event_id', eventId)
        .where('is_deleted', false)
        .first();
    } else if (input.unique_code) {
      ticket = await db('issued_tickets')
        .where('unique_code', input.unique_code.toUpperCase())
        .where('event_id', eventId)
        .where('is_deleted', false)
        .first();
    }

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
      };
    }

    // Check if already checked in
    if (ticket.is_checked_in) {
      return {
        success: false,
        ticket: this.parseTicket(ticket),
        message: `Ticket already checked in at ${ticket.checked_in_at}`,
        already_checked_in: true,
      };
    }

    // Check ticket status
    if (ticket.status !== 'valid') {
      return {
        success: false,
        ticket: this.parseTicket(ticket),
        message: `Ticket status is '${ticket.status}'. Only valid tickets can be checked in.`,
      };
    }

    // Check if expired
    if (ticket.expires_at && new Date(ticket.expires_at) < new Date()) {
      return {
        success: false,
        ticket: this.parseTicket(ticket),
        message: 'Ticket has expired',
      };
    }

    // Perform check-in
    const [updatedTicket] = await db('issued_tickets')
      .where('id', ticket.id)
      .update({
        is_checked_in: true,
        checked_in_at: db.fn.now(),
        checked_in_by: input.checked_in_by || 'system',
        status: 'used',
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Update attendee check-in status if linked
    if (ticket.registration_id) {
      await db('event_attendees')
        .where('registration_id', ticket.registration_id)
        .update({
          checked_in: true,
          checked_in_at: db.fn.now(),
          updated_at: db.fn.now(),
        });
    }

    return {
      success: true,
      ticket: this.parseTicket(updatedTicket),
      message: `Successfully checked in: ${ticket.holder_name}`,
    };
  }

  /**
   * Undo check-in (for corrections)
   */
  async undoCheckIn(ticketId: number): Promise<IssuedTicket> {
    const [ticket] = await db('issued_tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .update({
        is_checked_in: false,
        checked_in_at: null,
        checked_in_by: null,
        status: 'valid',
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Update attendee if linked
    if (ticket.registration_id) {
      await db('event_attendees')
        .where('registration_id', ticket.registration_id)
        .update({
          checked_in: false,
          checked_in_at: null,
          updated_at: db.fn.now(),
        });
    }

    return this.parseTicket(ticket);
  }

  // --------------------------------------------------------------------------
  // TICKET MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Update ticket details
   */
  async updateTicket(ticketId: number, input: UpdateTicketInput): Promise<IssuedTicket> {
    const updateData: any = {
      updated_at: db.fn.now(),
    };

    if (input.holder_name !== undefined) updateData.holder_name = input.holder_name;
    if (input.holder_email !== undefined) updateData.holder_email = input.holder_email;
    if (input.holder_phone !== undefined) updateData.holder_phone = input.holder_phone;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.payment_status !== undefined) updateData.payment_status = input.payment_status;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.expires_at !== undefined) updateData.expires_at = input.expires_at;
    if (input.metadata !== undefined) updateData.metadata = JSON.stringify(input.metadata);

    const [ticket] = await db('issued_tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .update(updateData)
      .returning('*');

    return this.parseTicket(ticket);
  }

  /**
   * Cancel a ticket
   */
  async cancelTicket(ticketId: number, reason?: string): Promise<IssuedTicket> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Update ticket type sold count
    if (ticket.ticket_type_id) {
      await db('tickets')
        .where('id', ticket.ticket_type_id)
        .decrement('sold_count', ticket.quantity || 1);
    }

    const [updated] = await db('issued_tickets')
      .where('id', ticketId)
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : ticket.notes,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return this.parseTicket(updated);
  }

  /**
   * Soft delete a ticket
   */
  async deleteTicket(ticketId: number): Promise<void> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Update ticket type sold count if valid
    if (ticket.ticket_type_id && ticket.status === 'valid') {
      await db('tickets')
        .where('id', ticket.ticket_type_id)
        .decrement('sold_count', ticket.quantity || 1);
    }

    await db('issued_tickets')
      .where('id', ticketId)
      .update({
        is_deleted: true,
        updated_at: db.fn.now(),
      });
  }

  /**
   * Validate payment and activate ticket
   */
  async confirmPayment(ticketId: number, paymentReference?: string): Promise<IssuedTicket> {
    const [ticket] = await db('issued_tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .update({
        status: 'valid',
        payment_status: 'completed',
        payment_reference: paymentReference || null,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return this.parseTicket(ticket);
  }

  // --------------------------------------------------------------------------
  // STATISTICS
  // --------------------------------------------------------------------------

  /**
   * Get ticket statistics for an event
   */
  async getEventTicketStats(eventId: number): Promise<TicketStats> {
    const stats = await db('issued_tickets')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .select(
        db.raw('COUNT(*) as total_issued'),
        db.raw('SUM(CASE WHEN is_checked_in = true THEN 1 ELSE 0 END) as total_checked_in'),
        db.raw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_pending"),
        db.raw("SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END) as total_valid"),
        db.raw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as total_cancelled"),
        db.raw("SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as total_expired"),
        db.raw("SUM(CASE WHEN payment_status = 'completed' THEN COALESCE(total_price, 0) ELSE 0 END) as total_revenue")
      )
      .first();

    return {
      total_issued: parseInt(stats.total_issued || '0', 10),
      total_checked_in: parseInt(stats.total_checked_in || '0', 10),
      total_pending: parseInt(stats.total_pending || '0', 10),
      total_valid: parseInt(stats.total_valid || '0', 10),
      total_cancelled: parseInt(stats.total_cancelled || '0', 10),
      total_expired: parseInt(stats.total_expired || '0', 10),
      total_revenue: parseFloat(stats.total_revenue || '0'),
    };
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TK-${timestamp}-${random}`;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async generateQRCode(payload: string, ticketNumber: string): Promise<string> {
    try {
      const filename = `qr_${ticketNumber.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      const filepath = path.join(this.qrCodeDir, filename);

      await QRCode.toFile(filepath, payload, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return `/uploads/qr-codes/${filename}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  private parseTicket(ticket: any): IssuedTicket {
    return {
      ...ticket,
      id: parseInt(ticket.id, 10),
      event_id: parseInt(ticket.event_id, 10),
      booking_id: ticket.booking_id ? parseInt(ticket.booking_id, 10) : null,
      registration_id: ticket.registration_id ? parseInt(ticket.registration_id, 10) : null,
      ticket_type_id: ticket.ticket_type_id ? parseInt(ticket.ticket_type_id, 10) : null,
      unit_price: ticket.unit_price ? parseFloat(ticket.unit_price) : null,
      total_price: ticket.total_price ? parseFloat(ticket.total_price) : null,
      quantity: ticket.quantity || 1,
      metadata: typeof ticket.metadata === 'string' ? JSON.parse(ticket.metadata || '{}') : (ticket.metadata || {}),
    };
  }

  private parseTicketWithDetails(ticket: any): TicketWithDetails {
    return {
      ...this.parseTicket(ticket),
      event_name: ticket.event_name,
      ticket_type_name: ticket.ticket_type_name,
      booking_code: ticket.booking_code,
    };
  }
}
