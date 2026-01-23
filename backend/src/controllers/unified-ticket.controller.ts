import { Request, Response } from 'express';
import { UnifiedTicketService } from '../services/unified-ticket.service';

const ticketService = new UnifiedTicketService();

/**
 * UNIFIED TICKET CONTROLLER
 * 
 * All ticket operations go through this controller.
 * Data source: issued_tickets table (SINGLE SOURCE OF TRUTH)
 */
export class UnifiedTicketController {
  // --------------------------------------------------------------------------
  // TICKET ISSUANCE
  // --------------------------------------------------------------------------

  /**
   * Issue a new ticket manually
   * POST /api/events/:eventId/tickets/issue
   */
  async issueTicket(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { 
        holder_name, 
        holder_email, 
        holder_phone,
        ticket_type_id,
        unit_price,
        payment_status,
        payment_method,
        order_reference,
        notes
      } = req.body;

      if (!holder_name) {
        return res.status(400).json({ message: 'Holder name is required' });
      }

      const ticket = await ticketService.issueTicket({
        event_id: eventId,
        holder_name,
        holder_email,
        holder_phone,
        ticket_type_id,
        unit_price,
        payment_status: payment_status || 'completed',
        payment_method,
        order_reference,
        notes,
      });

      return res.status(201).json({
        message: 'Ticket issued successfully',
        ticket,
      });
    } catch (error: any) {
      console.error('Error issuing ticket:', error);
      return res.status(500).json({ message: error.message || 'Failed to issue ticket' });
    }
  }

  /**
   * Issue tickets for a booking
   * POST /api/events/:eventId/bookings/:bookingId/issue-tickets
   */
  async issueTicketsForBooking(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const bookingId = parseInt(req.params.bookingId, 10);

      if (isNaN(eventId) || isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid event or booking ID' });
      }

      const { items, payment_status } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required' });
      }

      const tickets = await ticketService.issueTicketsForBooking(
        bookingId,
        eventId,
        items,
        payment_status || 'pending'
      );

      return res.status(201).json({
        message: `${tickets.length} tickets issued successfully`,
        tickets,
      });
    } catch (error: any) {
      console.error('Error issuing tickets for booking:', error);
      return res.status(500).json({ message: error.message || 'Failed to issue tickets' });
    }
  }

  // --------------------------------------------------------------------------
  // TICKET LOOKUP
  // --------------------------------------------------------------------------

  /**
   * Get all tickets for an event
   * GET /api/events/:eventId/tickets
   */
  async getEventTickets(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { page, limit, status, search, checked_in } = req.query;

      const result = await ticketService.getEventTickets(eventId, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
        status: status as string,
        search: search as string,
        checked_in: checked_in !== undefined ? checked_in === 'true' : undefined,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching event tickets:', error);
      return res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
    }
  }

  /**
   * Get ticket by ID
   * GET /api/events/:eventId/tickets/:ticketId
   */
  async getTicketById(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      return res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
    }
  }

  /**
   * Get ticket by unique code
   * GET /api/events/:eventId/tickets/code/:code
   */
  async getTicketByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      if (!code) {
        return res.status(400).json({ message: 'Code is required' });
      }

      const ticket = await ticketService.getTicketByUniqueCode(code);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error fetching ticket by code:', error);
      return res.status(500).json({ message: error.message || 'Failed to fetch ticket' });
    }
  }

  /**
   * Get tickets for a booking
   * GET /api/events/:eventId/bookings/:bookingId/tickets
   */
  async getBookingTickets(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.bookingId, 10);
      if (isNaN(bookingId)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const tickets = await ticketService.getBookingTickets(bookingId);
      return res.status(200).json({ tickets });
    } catch (error: any) {
      console.error('Error fetching booking tickets:', error);
      return res.status(500).json({ message: error.message || 'Failed to fetch tickets' });
    }
  }

  // --------------------------------------------------------------------------
  // CHECK-IN
  // --------------------------------------------------------------------------

  /**
   * Check in a ticket
   * POST /api/events/:eventId/checkin
   */
  async checkInTicket(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { qr_payload, unique_code, checked_in_by } = req.body;

      if (!qr_payload && !unique_code) {
        return res.status(400).json({ message: 'Either qr_payload or unique_code is required' });
      }

      const result = await ticketService.checkInTicket(eventId, {
        qr_payload,
        unique_code,
        checked_in_by,
      });

      if (result.success) {
        return res.status(200).json(result);
      } else if (result.already_checked_in) {
        return res.status(409).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Error checking in ticket:', error);
      return res.status(500).json({ message: error.message || 'Failed to check in ticket' });
    }
  }

  /**
   * Undo check-in
   * POST /api/events/:eventId/tickets/:ticketId/undo-checkin
   */
  async undoCheckIn(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const ticket = await ticketService.undoCheckIn(ticketId);
      return res.status(200).json({
        message: 'Check-in undone successfully',
        ticket,
      });
    } catch (error: any) {
      console.error('Error undoing check-in:', error);
      return res.status(500).json({ message: error.message || 'Failed to undo check-in' });
    }
  }

  // --------------------------------------------------------------------------
  // TICKET MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Update ticket
   * PUT /api/events/:eventId/tickets/:ticketId
   */
  async updateTicket(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const { holder_name, holder_email, holder_phone, status, payment_status, notes, expires_at } = req.body;

      const ticket = await ticketService.updateTicket(ticketId, {
        holder_name,
        holder_email,
        holder_phone,
        status,
        payment_status,
        notes,
        expires_at,
      });

      return res.status(200).json({
        message: 'Ticket updated successfully',
        ticket,
      });
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      return res.status(500).json({ message: error.message || 'Failed to update ticket' });
    }
  }

  /**
   * Cancel ticket
   * POST /api/events/:eventId/tickets/:ticketId/cancel
   */
  async cancelTicket(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const { reason } = req.body;
      const ticket = await ticketService.cancelTicket(ticketId, reason);

      return res.status(200).json({
        message: 'Ticket cancelled successfully',
        ticket,
      });
    } catch (error: any) {
      console.error('Error cancelling ticket:', error);
      return res.status(500).json({ message: error.message || 'Failed to cancel ticket' });
    }
  }

  /**
   * Delete ticket (soft delete)
   * DELETE /api/events/:eventId/tickets/:ticketId
   */
  async deleteTicket(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      await ticketService.deleteTicket(ticketId);
      return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      return res.status(500).json({ message: error.message || 'Failed to delete ticket' });
    }
  }

  /**
   * Confirm payment
   * POST /api/events/:eventId/tickets/:ticketId/confirm-payment
   */
  async confirmPayment(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const { payment_reference } = req.body;
      const ticket = await ticketService.confirmPayment(ticketId, payment_reference);

      return res.status(200).json({
        message: 'Payment confirmed, ticket activated',
        ticket,
      });
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return res.status(500).json({ message: error.message || 'Failed to confirm payment' });
    }
  }

  // --------------------------------------------------------------------------
  // STATISTICS
  // --------------------------------------------------------------------------

  /**
   * Get ticket statistics for an event
   * GET /api/events/:eventId/tickets/stats
   */
  async getTicketStats(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const stats = await ticketService.getEventTicketStats(eventId);
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error fetching ticket stats:', error);
      return res.status(500).json({ message: error.message || 'Failed to fetch stats' });
    }
  }
}
