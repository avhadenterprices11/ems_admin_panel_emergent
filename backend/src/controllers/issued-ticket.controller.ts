import { Request, Response } from 'express';
import { TicketIssuanceService, IssueTicketInput, IssuedTicketListParams, CheckinByCodeInput } from '../services/ticket-issuance.service';

const ticketIssuanceService = new TicketIssuanceService();

export class IssuedTicketController {
  // Get issued tickets list
  async getIssuedTickets(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const params: IssuedTicketListParams = {
        event_id: eventId,
        booking_id: req.query.booking_id ? parseInt(req.query.booking_id as string, 10) : undefined,
        status: req.query.status as string,
        is_checked_in: req.query.is_checked_in !== undefined 
          ? req.query.is_checked_in === 'true' 
          : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
      };

      const result = await ticketIssuanceService.getIssuedTickets(params);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching issued tickets:', error);
      return res.status(500).json({ message: 'Failed to fetch issued tickets' });
    }
  }

  // Get single issued ticket
  async getIssuedTicketById(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const ticket = await ticketIssuanceService.getIssuedTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Issued ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error fetching issued ticket:', error);
      return res.status(500).json({ message: 'Failed to fetch issued ticket' });
    }
  }

  // Get issued ticket by unique code (public API)
  async getIssuedTicketByCode(req: Request, res: Response) {
    try {
      const code = req.params.code;
      if (!code) {
        return res.status(400).json({ message: 'Code is required' });
      }

      const ticket = await ticketIssuanceService.getIssuedTicketByCode(code);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error fetching ticket by code:', error);
      return res.status(500).json({ message: 'Failed to fetch ticket' });
    }
  }

  // Issue a ticket manually
  async issueTicket(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { booking_id, booking_item_id, ticket_type_id, holder_name, holder_email, holder_phone, holder_company, holder_job_title, metadata } = req.body;

      if (!booking_id || !holder_name) {
        return res.status(400).json({ message: 'Booking ID and holder name are required' });
      }

      const input: IssueTicketInput = {
        event_id: eventId,
        booking_id: parseInt(booking_id, 10),
        booking_item_id: booking_item_id ? parseInt(booking_item_id, 10) : null,
        ticket_type_id: ticket_type_id ? parseInt(ticket_type_id, 10) : null,
        holder_name,
        holder_email,
        holder_phone,
        holder_company,
        holder_job_title,
        metadata
      };

      const ticket = await ticketIssuanceService.issueTicket(input);
      return res.status(201).json(ticket);
    } catch (error: any) {
      console.error('Error issuing ticket:', error);
      return res.status(500).json({ message: 'Failed to issue ticket' });
    }
  }

  // Check-in by code (QR or unique code)
  async checkinByCode(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { code, device_id, device_name, location } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Code is required' });
      }

      const input: CheckinByCodeInput = {
        event_id: eventId,
        code: code.trim().toUpperCase(),
        device_id: device_id ? parseInt(device_id, 10) : undefined,
        device_name,
        location
      };

      const result = await ticketIssuanceService.checkinByCode(input);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.message,
          ticket: result.ticket
        });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error processing check-in:', error);
      return res.status(500).json({ message: 'Failed to process check-in' });
    }
  }

  // Undo check-in
  async undoCheckin(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const result = await ticketIssuanceService.undoCheckin(ticketId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error undoing check-in:', error);
      return res.status(500).json({ message: 'Failed to undo check-in' });
    }
  }

  // Cancel ticket
  async cancelTicket(req: Request, res: Response) {
    try {
      const ticketId = parseInt(req.params.ticketId, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'Invalid ticket ID' });
      }

      const ticket = await ticketIssuanceService.cancelTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error cancelling ticket:', error);
      return res.status(500).json({ message: 'Failed to cancel ticket' });
    }
  }

  // Get check-in stats
  async getCheckinStats(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const stats = await ticketIssuanceService.getCheckinStats(eventId);
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error fetching check-in stats:', error);
      return res.status(500).json({ message: 'Failed to fetch check-in stats' });
    }
  }
}
