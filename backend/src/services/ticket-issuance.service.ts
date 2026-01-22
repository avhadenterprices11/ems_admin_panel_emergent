import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { BadgeDesignService, BadgeDesign } from './badge-design.service';
import { BookingService, Booking } from './booking.service';
import { S3Service } from './s3.service';

export interface IssuedTicket {
  id: number;
  ticket_number: string;
  unique_code: string;
  event_id: number;
  booking_id: number;
  booking_item_id: number | null;
  ticket_type_id: number | null;
  attendee_id: number | null;
  holder_name: string;
  holder_email: string | null;
  holder_phone: string | null;
  holder_company: string | null;
  holder_job_title: string | null;
  qr_payload: string;
  qr_image_url: string | null;
  badge_design_id: number | null;
  status: string;
  is_checked_in: boolean;
  checked_in_at: string | null;
  checkin_method: string | null;
  checkin_location: string | null;
  checkin_device_id: number | null;
  metadata: any;
  issued_at: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined
  ticket_type_name?: string;
  badge_design?: BadgeDesign;
  booking_code?: string;
  event_name?: string;
}

export interface IssueTicketInput {
  event_id: number;
  booking_id: number;
  booking_item_id?: number | null;
  ticket_type_id?: number | null;
  holder_name: string;
  holder_email?: string | null;
  holder_phone?: string | null;
  holder_company?: string | null;
  holder_job_title?: string | null;
  metadata?: any;
}

export interface IssuedTicketListParams {
  event_id: number;
  booking_id?: number;
  status?: string;
  is_checked_in?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CheckinByCodeInput {
  event_id: number;
  code: string; // Can be either unique_code or qr_payload
  device_id?: number;
  device_name?: string;
  location?: string;
}

export interface CheckinResult {
  success: boolean;
  message: string;
  ticket?: IssuedTicket;
}

export class TicketIssuanceService {
  private badgeDesignService: BadgeDesignService;
  private s3Service: S3Service;

  constructor() {
    this.badgeDesignService = new BadgeDesignService();
    this.s3Service = new S3Service();
  }

  // Generate unique 6-character alphanumeric code
  generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Generate ticket number
  generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TK-${timestamp}-${random}`;
  }

  // Generate QR payload (encoded ticket info)
  generateQRPayload(ticketId: number, eventId: number, uniqueCode: string): string {
    // Create a signed/encoded payload that can be validated
    // Format: EVENTID-TICKETID-UNIQUECODE-CHECKSUM
    const data = `${eventId}-${ticketId}-${uniqueCode}`;
    const checksum = this.simpleChecksum(data);
    return `${data}-${checksum}`;
  }

  // Generate QR code image and upload to storage
  async generateAndUploadQRImage(qrPayload: string, ticketNumber: string): Promise<string> {
    try {
      // Generate QR code as PNG buffer
      const qrBuffer = await QRCode.toBuffer(qrPayload, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      // Upload to storage
      const fileName = `qr-codes/${ticketNumber}.png`;
      const imageUrl = await this.s3Service.uploadBuffer(qrBuffer, fileName, 'image/png');
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate/upload QR image:', error);
      throw error;
    }
  }

  // Simple checksum for validation
  private simpleChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 4);
  }

  // Validate QR payload format
  validateQRPayload(payload: string): { valid: boolean; eventId?: number; ticketId?: number; uniqueCode?: string } {
    const parts = payload.split('-');
    if (parts.length !== 4) {
      return { valid: false };
    }

    const [eventIdStr, ticketIdStr, uniqueCode, checksum] = parts;
    const eventId = parseInt(eventIdStr, 10);
    const ticketId = parseInt(ticketIdStr, 10);

    if (isNaN(eventId) || isNaN(ticketId)) {
      return { valid: false };
    }

    const expectedChecksum = this.simpleChecksum(`${eventId}-${ticketId}-${uniqueCode}`);
    if (checksum !== expectedChecksum) {
      return { valid: false };
    }

    return { valid: true, eventId, ticketId, uniqueCode };
  }

  // Issue a new ticket
  async issueTicket(input: IssueTicketInput): Promise<IssuedTicket> {
    // Generate unique values
    let uniqueCode = this.generateUniqueCode();
    let ticketNumber = this.generateTicketNumber();

    // Ensure unique code is truly unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db('issued_tickets')
        .where('unique_code', uniqueCode)
        .first();
      if (!existing) break;
      uniqueCode = this.generateUniqueCode();
      attempts++;
    }

    // Get badge design for this ticket
    const badgeDesign = await this.badgeDesignService.getDesignForTicket(
      input.event_id,
      input.ticket_type_id || undefined
    );

    // Create the issued ticket first to get ID
    const [ticket] = await db('issued_tickets')
      .insert({
        ticket_number: ticketNumber,
        unique_code: uniqueCode,
        event_id: input.event_id,
        booking_id: input.booking_id,
        booking_item_id: input.booking_item_id || null,
        ticket_type_id: input.ticket_type_id || null,
        holder_name: input.holder_name,
        holder_email: input.holder_email || null,
        holder_phone: input.holder_phone || null,
        holder_company: input.holder_company || null,
        holder_job_title: input.holder_job_title || null,
        qr_payload: '', // Will update after
        qr_image_url: null, // Will update after
        badge_design_id: badgeDesign?.id || null,
        status: 'valid',
        is_checked_in: false,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      })
      .returning('*');

    // Generate QR payload with actual ticket ID
    const qrPayload = this.generateQRPayload(ticket.id, input.event_id, uniqueCode);

    // Generate and upload QR code image
    let qrImageUrl: string | null = null;
    try {
      qrImageUrl = await this.generateAndUploadQRImage(qrPayload, ticketNumber);
    } catch (error) {
      console.error('Failed to generate QR image, continuing without:', error);
    }

    // Update with QR payload and image URL
    const [updated] = await db('issued_tickets')
      .where('id', ticket.id)
      .update({ 
        qr_payload: qrPayload,
        qr_image_url: qrImageUrl
      })
      .returning('*');

    return updated;
  }

  // Issue tickets for a confirmed booking
  async issueTicketsForBooking(booking: Booking): Promise<IssuedTicket[]> {
    if (!booking.items || booking.items.length === 0) {
      return [];
    }

    const issuedTickets: IssuedTicket[] = [];

    for (const item of booking.items) {
      if (item.item_type !== 'ticket') continue;

      // Issue one ticket per quantity
      for (let i = 0; i < item.quantity; i++) {
        const ticket = await this.issueTicket({
          event_id: booking.event_id,
          booking_id: booking.id,
          booking_item_id: item.id,
          ticket_type_id: item.ticket_id,
          holder_name: booking.customer_name,
          holder_email: booking.customer_email,
          holder_phone: booking.customer_phone
        });
        issuedTickets.push(ticket);
      }
    }

    return issuedTickets;
  }

  // Get issued tickets list
  async getIssuedTickets(params: IssuedTicketListParams): Promise<{ tickets: IssuedTicket[]; total: number; page: number; limit: number }> {
    const { event_id, booking_id, status, is_checked_in, search, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = db('issued_tickets as it')
      .leftJoin('tickets as t', 'it.ticket_type_id', 't.id')
      .leftJoin('bookings as b', 'it.booking_id', 'b.id')
      .leftJoin('events as e', 'it.event_id', 'e.id')
      .select(
        'it.*',
        't.name as ticket_type_name',
        'b.booking_code',
        'e.name as event_name'
      )
      .where('it.event_id', event_id)
      .andWhere('it.is_deleted', false);

    if (booking_id) {
      query = query.andWhere('it.booking_id', booking_id);
    }

    if (status) {
      query = query.andWhere('it.status', status);
    }

    if (is_checked_in !== undefined) {
      query = query.andWhere('it.is_checked_in', is_checked_in);
    }

    if (search) {
      query = query.andWhere(function() {
        this.where('it.ticket_number', 'ilike', `%${search}%`)
          .orWhere('it.unique_code', 'ilike', `%${search}%`)
          .orWhere('it.holder_name', 'ilike', `%${search}%`)
          .orWhere('it.holder_email', 'ilike', `%${search}%`);
      });
    }

    // Count total
    const countQuery = query.clone().clearSelect().count('it.id as count').first();
    const countResult = await countQuery;
    const total = parseInt((countResult as any)?.count || '0', 10);

    // Get paginated results
    const tickets = await query
      .orderBy('it.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { tickets, total, page, limit };
  }

  // Get issued ticket by ID
  async getIssuedTicketById(ticketId: number): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets as it')
      .leftJoin('tickets as t', 'it.ticket_type_id', 't.id')
      .leftJoin('bookings as b', 'it.booking_id', 'b.id')
      .leftJoin('events as e', 'it.event_id', 'e.id')
      .select(
        'it.*',
        't.name as ticket_type_name',
        'b.booking_code',
        'e.name as event_name'
      )
      .where('it.id', ticketId)
      .andWhere('it.is_deleted', false)
      .first();

    return ticket || null;
  }

  // Get issued ticket by unique code
  async getIssuedTicketByCode(uniqueCode: string): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets as it')
      .leftJoin('tickets as t', 'it.ticket_type_id', 't.id')
      .leftJoin('bookings as b', 'it.booking_id', 'b.id')
      .leftJoin('events as e', 'it.event_id', 'e.id')
      .select(
        'it.*',
        't.name as ticket_type_name',
        'b.booking_code',
        'e.name as event_name'
      )
      .where('it.unique_code', uniqueCode.toUpperCase())
      .andWhere('it.is_deleted', false)
      .first();

    return ticket || null;
  }

  // Get issued ticket by QR payload
  async getIssuedTicketByQRPayload(qrPayload: string): Promise<IssuedTicket | null> {
    const ticket = await db('issued_tickets as it')
      .leftJoin('tickets as t', 'it.ticket_type_id', 't.id')
      .leftJoin('bookings as b', 'it.booking_id', 'b.id')
      .leftJoin('events as e', 'it.event_id', 'e.id')
      .select(
        'it.*',
        't.name as ticket_type_name',
        'b.booking_code',
        'e.name as event_name'
      )
      .where('it.qr_payload', qrPayload)
      .andWhere('it.is_deleted', false)
      .first();

    return ticket || null;
  }

  // Check-in by code (QR or unique code)
  async checkinByCode(input: CheckinByCodeInput): Promise<CheckinResult> {
    const { event_id, code, device_id, device_name, location } = input;

    // Try to find ticket by unique code first (6 chars)
    let ticket: IssuedTicket | null = null;
    
    if (code.length === 6) {
      ticket = await this.getIssuedTicketByCode(code);
    }

    // If not found, try as QR payload
    if (!ticket) {
      ticket = await this.getIssuedTicketByQRPayload(code);
    }

    // Also try to validate QR payload format and find by parsed data
    if (!ticket) {
      const parsed = this.validateQRPayload(code);
      if (parsed.valid && parsed.uniqueCode) {
        ticket = await this.getIssuedTicketByCode(parsed.uniqueCode);
      }
    }

    if (!ticket) {
      return { success: false, message: 'Invalid ticket code or QR code' };
    }

    // Verify event matches
    if (ticket.event_id !== event_id) {
      return { success: false, message: 'Ticket does not belong to this event' };
    }

    // Check ticket status
    if (ticket.status === 'cancelled') {
      return { success: false, message: 'This ticket has been cancelled' };
    }

    if (ticket.status === 'expired') {
      return { success: false, message: 'This ticket has expired' };
    }

    // Check if already checked in
    if (ticket.is_checked_in) {
      return { 
        success: false, 
        message: `Already checked in at ${new Date(ticket.checked_in_at!).toLocaleString()}`,
        ticket 
      };
    }

    // Get or create device
    let deviceId = device_id;
    if (!deviceId && device_name) {
      deviceId = await this.getOrCreateDevice(event_id, device_name, location);
    }

    // Determine check-in method
    const checkinMethod = code.length === 6 ? 'code' : 'qr';

    // Perform check-in
    const [updated] = await db('issued_tickets')
      .where('id', ticket.id)
      .update({
        is_checked_in: true,
        checked_in_at: db.fn.now(),
        checkin_method: checkinMethod,
        checkin_location: location || null,
        checkin_device_id: deviceId || null,
        status: 'used',
        updated_at: db.fn.now()
      })
      .returning('*');

    // Update device stats
    if (deviceId) {
      await db('event_checkin_devices')
        .where('id', deviceId)
        .update({
          total_scans: db.raw('total_scans + 1'),
          last_seen_at: db.fn.now(),
          status: 'online',
          updated_at: db.fn.now()
        });
    }

    // Log activity
    await db('event_activity_logs').insert({
      event_id,
      actor_type: 'system',
      action_type: 'ticket_checkin',
      description: `${ticket.holder_name} checked in via ${checkinMethod}`,
      metadata: JSON.stringify({ 
        ticket_id: ticket.id, 
        ticket_number: ticket.ticket_number,
        location,
        method: checkinMethod
      })
    });

    return { 
      success: true, 
      message: 'Check-in successful',
      ticket: { ...ticket, ...updated }
    };
  }

  // Undo check-in
  async undoCheckin(ticketId: number): Promise<CheckinResult> {
    const ticket = await this.getIssuedTicketById(ticketId);

    if (!ticket) {
      return { success: false, message: 'Ticket not found' };
    }

    if (!ticket.is_checked_in) {
      return { success: false, message: 'Ticket is not checked in' };
    }

    const [updated] = await db('issued_tickets')
      .where('id', ticketId)
      .update({
        is_checked_in: false,
        checked_in_at: null,
        checkin_method: null,
        checkin_location: null,
        checkin_device_id: null,
        status: 'valid',
        updated_at: db.fn.now()
      })
      .returning('*');

    // Log activity
    await db('event_activity_logs').insert({
      event_id: ticket.event_id,
      actor_type: 'admin',
      action_type: 'undo_checkin',
      description: `Check-in undone for ${ticket.holder_name}`,
      metadata: JSON.stringify({ ticket_id: ticketId, ticket_number: ticket.ticket_number })
    });

    return { 
      success: true, 
      message: 'Check-in undone successfully',
      ticket: { ...ticket, ...updated }
    };
  }

  // Get or create device
  private async getOrCreateDevice(eventId: number, deviceName: string, location?: string): Promise<number> {
    let device = await db('event_checkin_devices')
      .where('event_id', eventId)
      .andWhere('device_name', deviceName)
      .first();

    if (!device) {
      [device] = await db('event_checkin_devices')
        .insert({
          event_id: eventId,
          device_name: deviceName,
          device_type: 'scanner',
          location: location || null,
          status: 'online'
        })
        .returning('*');
    }

    return device.id;
  }

  // Cancel a ticket
  async cancelTicket(ticketId: number): Promise<IssuedTicket | null> {
    const [updated] = await db('issued_tickets')
      .where('id', ticketId)
      .update({
        status: 'cancelled',
        updated_at: db.fn.now()
      })
      .returning('*');

    return updated ? this.getIssuedTicketById(updated.id) : null;
  }

  // Get check-in stats for issued tickets
  async getCheckinStats(eventId: number): Promise<{
    total_issued: number;
    total_checked_in: number;
    total_not_checked_in: number;
    checkin_percentage: number;
    by_ticket_type: { ticket_type: string; checked_in: number; total: number }[];
  }> {
    // Overall stats
    const overallStats = await db('issued_tickets')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .andWhere('status', '!=', 'cancelled')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE is_checked_in = true) as checked_in")
      )
      .first();

    const total = parseInt(overallStats?.total || '0', 10);
    const checkedIn = parseInt(overallStats?.checked_in || '0', 10);

    // Stats by ticket type
    const byTicketType = await db('issued_tickets as it')
      .leftJoin('tickets as t', 'it.ticket_type_id', 't.id')
      .where('it.event_id', eventId)
      .andWhere('it.is_deleted', false)
      .andWhere('it.status', '!=', 'cancelled')
      .select(
        db.raw("COALESCE(t.name, 'General') as ticket_type"),
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE it.is_checked_in = true) as checked_in")
      )
      .groupBy('t.name');

    return {
      total_issued: total,
      total_checked_in: checkedIn,
      total_not_checked_in: total - checkedIn,
      checkin_percentage: total > 0 ? (checkedIn / total) * 100 : 0,
      by_ticket_type: byTicketType.map((row: any) => ({
        ticket_type: row.ticket_type,
        checked_in: parseInt(row.checked_in, 10),
        total: parseInt(row.total, 10)
      }))
    };
  }
}
