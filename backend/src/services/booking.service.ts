import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';

export interface Booking {
  id: number;
  booking_code: string;
  event_id: number;
  registration_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  promo_code: string | null;
  metadata: any;
  source: string;
  booked_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined
  event_name?: string;
  items?: BookingItem[];
}

export interface BookingItem {
  id: number;
  booking_id: number;
  ticket_id: number | null;
  addon_id: number | null;
  item_type: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingInput {
  event_id: number;
  registration_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  payment_method?: string | null;
  promo_code?: string | null;
  source?: string;
  metadata?: any;
  items: CreateBookingItemInput[];
}

export interface CreateBookingItemInput {
  ticket_id?: number | null;
  addon_id?: number | null;
  item_type: 'ticket' | 'addon';
  item_name: string;
  quantity: number;
  unit_price: number;
}

export interface BookingListParams {
  event_id: number;
  status?: string;
  payment_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class BookingService {
  // Generate unique booking code
  generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BK-${code}`;
  }

  // Get bookings list
  async getBookings(params: BookingListParams): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const { event_id, status, payment_status, search, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = db('bookings as b')
      .leftJoin('events as e', 'b.event_id', 'e.id')
      .select('b.*', 'e.name as event_name')
      .where('b.event_id', event_id)
      .andWhere('b.is_deleted', false);

    if (status) {
      query = query.andWhere('b.status', status);
    }

    if (payment_status) {
      query = query.andWhere('b.payment_status', payment_status);
    }

    if (search) {
      query = query.andWhere(function() {
        this.where('b.booking_code', 'ilike', `%${search}%`)
          .orWhere('b.customer_name', 'ilike', `%${search}%`)
          .orWhere('b.customer_email', 'ilike', `%${search}%`);
      });
    }

    // Count total
    const countQuery = query.clone().clearSelect().count('b.id as count').first();
    const countResult = await countQuery;
    const total = parseInt((countResult as any)?.count || '0', 10);

    // Get paginated results
    const bookings = await query
      .orderBy('b.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { bookings, total, page, limit };
  }

  // Get booking by ID with items
  async getBookingById(bookingId: number): Promise<Booking | null> {
    const booking = await db('bookings as b')
      .leftJoin('events as e', 'b.event_id', 'e.id')
      .select('b.*', 'e.name as event_name')
      .where('b.id', bookingId)
      .andWhere('b.is_deleted', false)
      .first();

    if (!booking) return null;

    const items = await db('booking_items')
      .where('booking_id', bookingId)
      .orderBy('id');

    return { ...booking, items };
  }

  // Get booking by code
  async getBookingByCode(bookingCode: string): Promise<Booking | null> {
    const booking = await db('bookings as b')
      .leftJoin('events as e', 'b.event_id', 'e.id')
      .select('b.*', 'e.name as event_name')
      .where('b.booking_code', bookingCode)
      .andWhere('b.is_deleted', false)
      .first();

    if (!booking) return null;

    const items = await db('booking_items')
      .where('booking_id', booking.id)
      .orderBy('id');

    return { ...booking, items };
  }

  // Create a new booking
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const bookingCode = this.generateBookingCode();

    // Calculate totals
    let subtotal = 0;
    for (const item of input.items) {
      subtotal += item.unit_price * item.quantity;
    }

    // TODO: Apply promo code discount if provided
    const discountAmount = 0;

    // TODO: Calculate tax based on event settings
    const taxAmount = 0;

    const totalAmount = subtotal - discountAmount + taxAmount;

    // Create booking
    const [booking] = await db('bookings')
      .insert({
        booking_code: bookingCode,
        event_id: input.event_id,
        registration_id: input.registration_id || null,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone || null,
        status: 'pending',
        payment_status: 'pending',
        payment_method: input.payment_method || null,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: 'USD',
        promo_code: input.promo_code || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        source: input.source || 'admin'
      })
      .returning('*');

    // Create booking items
    const itemsToInsert = input.items.map(item => ({
      booking_id: booking.id,
      ticket_id: item.ticket_id || null,
      addon_id: item.addon_id || null,
      item_type: item.item_type,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      currency: 'USD'
    }));

    const items = await db('booking_items')
      .insert(itemsToInsert)
      .returning('*');

    return { ...booking, items };
  }

  // Confirm a booking
  async confirmBooking(bookingId: number): Promise<Booking | null> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return null;

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be confirmed');
    }

    const [updated] = await db('bookings')
      .where('id', bookingId)
      .update({
        status: 'confirmed',
        confirmed_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return this.getBookingById(updated.id);
  }

  // Update payment status
  async updatePaymentStatus(bookingId: number, paymentStatus: string, paymentReference?: string): Promise<Booking | null> {
    const [updated] = await db('bookings')
      .where('id', bookingId)
      .update({
        payment_status: paymentStatus,
        payment_reference: paymentReference || null,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!updated) return null;
    return this.getBookingById(updated.id);
  }

  // Cancel a booking
  async cancelBooking(bookingId: number): Promise<Booking | null> {
    const [updated] = await db('bookings')
      .where('id', bookingId)
      .update({
        status: 'cancelled',
        cancelled_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    if (!updated) return null;
    return this.getBookingById(updated.id);
  }

  // Delete booking (soft delete)
  async deleteBooking(bookingId: number): Promise<boolean> {
    const result = await db('bookings')
      .where('id', bookingId)
      .update({ is_deleted: true, updated_at: db.fn.now() });

    return result > 0;
  }
}
