import { Request, Response } from 'express';
import { BookingService, CreateBookingInput, BookingListParams } from '../services/booking.service';
import { TicketIssuanceService } from '../services/ticket-issuance.service';

const bookingService = new BookingService();
const ticketIssuanceService = new TicketIssuanceService();

export class BookingController {
  // Get bookings list
  async getBookings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const params: BookingListParams = {
        event_id: eventId,
        status: req.query.status as string,
        payment_status: req.query.payment_status as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      };

      const result = await bookingService.getBookings(params);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  }

  // Get booking by ID
  async getBookingById(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const booking = await bookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      return res.status(200).json(booking);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      return res.status(500).json({ message: 'Failed to fetch booking' });
    }
  }

  // Get booking by code (public API)
  async getBookingByCode(req: Request, res: Response) {
    try {
      const bookingCode = req.params.bookingCode;
      if (!bookingCode) {
        return res.status(400).json({ message: 'Booking code is required' });
      }

      const booking = await bookingService.getBookingByCode(bookingCode);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Get issued tickets for this booking
      const { tickets } = await ticketIssuanceService.getIssuedTickets({
        event_id: booking.event_id,
        booking_id: booking.id
      });

      return res.status(200).json({ booking, tickets });
    } catch (error: any) {
      console.error('Error fetching booking by code:', error);
      return res.status(500).json({ message: 'Failed to fetch booking' });
    }
  }

  // Create booking
  async createBooking(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { customer_name, customer_email, customer_phone, payment_method, promo_code, items, source } = req.body;

      if (!customer_name || !customer_email) {
        return res.status(400).json({ message: 'Customer name and email are required' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }

      const input: CreateBookingInput = {
        event_id: eventId,
        customer_name,
        customer_email,
        customer_phone,
        payment_method,
        promo_code,
        source: source || 'admin',
        items
      };

      const booking = await bookingService.createBooking(input);
      return res.status(201).json(booking);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ message: 'Failed to create booking' });
    }
  }

  // Confirm booking and issue tickets
  async confirmBooking(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      // Confirm the booking
      const booking = await bookingService.confirmBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Issue tickets
      const tickets = await ticketIssuanceService.issueTicketsForBooking(booking);

      return res.status(200).json({ 
        booking, 
        tickets,
        message: `Booking confirmed and ${tickets.length} ticket(s) issued`
      });
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      return res.status(500).json({ message: error.message || 'Failed to confirm booking' });
    }
  }

  // Update payment status
  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const { payment_status, payment_reference } = req.body;
      if (!payment_status) {
        return res.status(400).json({ message: 'Payment status is required' });
      }

      const booking = await bookingService.updatePaymentStatus(bookingId, payment_status, payment_reference);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      return res.status(200).json(booking);
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      return res.status(500).json({ message: 'Failed to update payment status' });
    }
  }

  // Cancel booking
  async cancelBooking(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const booking = await bookingService.cancelBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      return res.status(200).json(booking);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      return res.status(500).json({ message: 'Failed to cancel booking' });
    }
  }

  // Delete booking
  async deleteBooking(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const success = await bookingService.deleteBooking(bookingId);
      if (!success) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      return res.status(200).json({ message: 'Booking deleted' });
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      return res.status(500).json({ message: 'Failed to delete booking' });
    }
  }
}
