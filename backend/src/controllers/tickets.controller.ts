import { Request, Response } from 'express';
import { TicketsService, CreateTicketDTO, UpdateTicketDTO } from '../services/tickets.service';

const ticketsService = new TicketsService();

export class TicketsController {
  /**
   * GET /api/events/:eventId/tickets
   * Get all tickets for an event
   */
  async getTickets(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Update ticket statuses based on inventory and dates
      await ticketsService.updateTicketStatuses(eventId);
      
      const tickets = await ticketsService.getTicketsByEventId(eventId);
      
      res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  }

  /**
   * GET /api/events/:eventId/tickets/stats
   * Get ticket statistics for an event
   */
  async getTicketStats(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const stats = await ticketsService.getTicketStats(eventId);
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      res.status(500).json({ message: 'Failed to fetch ticket statistics' });
    }
  }

  /**
   * GET /api/events/:eventId/tickets/:ticketId
   * Get a single ticket by ID
   */
  async getTicketById(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        res.status(400).json({ message: 'Invalid ticket ID' });
        return;
      }

      const ticket = await ticketsService.getTicketById(ticketId);
      
      if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(200).json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ message: 'Failed to fetch ticket' });
    }
  }

  /**
   * POST /api/events/:eventId/tickets
   * Create a new ticket
   */
  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const { name, description, price, currency, capacity, category, min_per_order, max_per_order, is_visible, is_on_sale, internal_notes, sales_start_at, sales_end_at } = req.body;

      // Validate required fields
      if (!name) {
        res.status(400).json({ message: 'Ticket name is required' });
        return;
      }

      if (price === undefined || price === null) {
        res.status(400).json({ message: 'Ticket price is required' });
        return;
      }

      if (price < 0) {
        res.status(400).json({ message: 'Ticket price cannot be negative' });
        return;
      }

      const ticketData: CreateTicketDTO = {
        event_id: eventId,
        name,
        description,
        price: parseFloat(price),
        currency,
        capacity: capacity ? parseInt(capacity) : undefined,
        category,
        min_per_order: min_per_order ? parseInt(min_per_order) : undefined,
        max_per_order: max_per_order ? parseInt(max_per_order) : undefined,
        is_visible,
        is_on_sale,
        internal_notes,
        sales_start_at,
        sales_end_at,
      };

      const ticket = await ticketsService.createTicket(ticketData);
      
      res.status(201).json(ticket);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ message: error.message || 'Failed to create ticket' });
    }
  }

  /**
   * PUT /api/events/:eventId/tickets/:ticketId
   * Update a ticket
   */
  async updateTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        res.status(400).json({ message: 'Invalid ticket ID' });
        return;
      }

      const updateData: UpdateTicketDTO = {};
      const { name, description, price, currency, capacity, category, min_per_order, max_per_order, is_visible, is_on_sale, internal_notes, sales_start_at, sales_end_at, status } = req.body;

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) {
        if (price < 0) {
          res.status(400).json({ message: 'Ticket price cannot be negative' });
          return;
        }
        updateData.price = parseFloat(price);
      }
      if (currency !== undefined) updateData.currency = currency;
      if (capacity !== undefined) updateData.capacity = capacity === null ? undefined : parseInt(capacity);
      if (category !== undefined) updateData.category = category;
      if (min_per_order !== undefined) updateData.min_per_order = parseInt(min_per_order);
      if (max_per_order !== undefined) updateData.max_per_order = parseInt(max_per_order);
      if (is_visible !== undefined) updateData.is_visible = is_visible;
      if (is_on_sale !== undefined) updateData.is_on_sale = is_on_sale;
      if (internal_notes !== undefined) updateData.internal_notes = internal_notes;
      if (sales_start_at !== undefined) updateData.sales_start_at = sales_start_at;
      if (sales_end_at !== undefined) updateData.sales_end_at = sales_end_at;
      if (status !== undefined) updateData.status = status;

      const ticket = await ticketsService.updateTicket(ticketId, updateData);
      
      if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ message: error.message || 'Failed to update ticket' });
    }
  }

  /**
   * DELETE /api/events/:eventId/tickets/:ticketId
   * Soft delete a ticket
   */
  async deleteTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        res.status(400).json({ message: 'Invalid ticket ID' });
        return;
      }

      const success = await ticketsService.deleteTicket(ticketId);
      
      if (!success) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      res.status(400).json({ message: error.message || 'Failed to delete ticket' });
    }
  }

  /**
   * POST /api/events/:eventId/tickets/:ticketId/toggle-sales
   * Toggle ticket sales (pause/resume)
   */
  async toggleSales(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        res.status(400).json({ message: 'Invalid ticket ID' });
        return;
      }

      const ticket = await ticketsService.toggleTicketSales(ticketId);
      
      if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error toggling ticket sales:', error);
      res.status(400).json({ message: error.message || 'Failed to toggle ticket sales' });
    }
  }

  /**
   * POST /api/events/:eventId/tickets/:ticketId/end-sales
   * End ticket sales
   */
  async endSales(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        res.status(400).json({ message: 'Invalid ticket ID' });
        return;
      }

      const ticket = await ticketsService.endTicketSales(ticketId);
      
      if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(200).json(ticket);
    } catch (error: any) {
      console.error('Error ending ticket sales:', error);
      res.status(400).json({ message: error.message || 'Failed to end ticket sales' });
    }
  }

  /**
   * POST /api/events/:eventId/tickets/:ticketId/duplicate
   * Duplicate a ticket
   */
  async duplicateTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        res.status(400).json({ message: 'Invalid ticket ID' });
        return;
      }

      const ticket = await ticketsService.duplicateTicket(ticketId);
      
      if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(201).json(ticket);
    } catch (error: any) {
      console.error('Error duplicating ticket:', error);
      res.status(500).json({ message: error.message || 'Failed to duplicate ticket' });
    }
  }
}
