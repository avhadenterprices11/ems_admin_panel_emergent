import db from '../database/db';

export interface Ticket {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  capacity?: number;
  sold_count: number;
  status: string;
  ticket_type: string;
  category: string;
  min_per_order: number;
  max_per_order: number;
  is_visible: boolean;
  is_on_sale: boolean;
  internal_notes?: string;
  sales_start_at?: Date;
  sales_end_at?: Date;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface CreateTicketDTO {
  event_id: number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  capacity?: number;
  ticket_type?: string;
  category?: string;
  min_per_order?: number;
  max_per_order?: number;
  is_visible?: boolean;
  is_on_sale?: boolean;
  internal_notes?: string;
  sales_start_at?: string;
  sales_end_at?: string;
}

export interface UpdateTicketDTO {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  capacity?: number;
  ticket_type?: string;
  category?: string;
  min_per_order?: number;
  max_per_order?: number;
  is_visible?: boolean;
  is_on_sale?: boolean;
  internal_notes?: string;
  sales_start_at?: string;
  sales_end_at?: string;
  status?: string;
}

export interface TicketStats {
  totalSales: number;
  ticketsSold: number;
  totalCapacity: number;
  addonRevenue: number;
  avgOrderValue: number;
}

export class TicketsService {
  /**
   * Get all tickets for an event
   */
  async getTicketsByEventId(eventId: number, includeDeleted: boolean = false): Promise<Ticket[]> {
    let query = db<Ticket>('tickets')
      .where('event_id', eventId)
      .orderBy('created_at', 'asc');
    
    if (!includeDeleted) {
      query = query.where('is_deleted', false);
    }
    
    return await query;
  }

  /**
   * Get a single ticket by ID
   */
  async getTicketById(ticketId: number): Promise<Ticket | null> {
    const ticket = await db<Ticket>('tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .first();
    
    return ticket || null;
  }

  /**
   * Create a new ticket
   */
  async createTicket(data: CreateTicketDTO): Promise<Ticket> {
    // Validate event exists
    const event = await db('events')
      .where('id', data.event_id)
      .where('deleted_at', null)
      .first();
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Determine ticket type based on price
    const ticketType = data.price === 0 ? 'free' : 'paid';

    // Determine initial status
    let status = 'draft';
    if (data.is_on_sale !== false) {
      const now = new Date();
      const salesStart = data.sales_start_at ? new Date(data.sales_start_at) : null;
      const salesEnd = data.sales_end_at ? new Date(data.sales_end_at) : null;
      
      if (salesEnd && now > salesEnd) {
        status = 'ended';
      } else if (!salesStart || now >= salesStart) {
        status = 'on_sale';
      } else {
        status = 'draft';
      }
    }

    const ticketData = {
      event_id: data.event_id,
      name: data.name,
      description: data.description || null,
      price: data.price,
      currency: data.currency || 'USD',
      capacity: data.capacity || null,
      sold_count: 0,
      status,
      ticket_type: ticketType,
      category: data.category || 'General',
      min_per_order: data.min_per_order || 1,
      max_per_order: data.max_per_order || 10,
      is_visible: data.is_visible !== false,
      is_on_sale: data.is_on_sale !== false,
      internal_notes: data.internal_notes || null,
      sales_start_at: data.sales_start_at || null,
      sales_end_at: data.sales_end_at || null,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    const [ticket] = await db<Ticket>('tickets')
      .insert(ticketData)
      .returning('*');

    // Log activity
    await this.logActivity(data.event_id, 'ticket_created', `Ticket "${data.name}" created`);

    return ticket;
  }

  /**
   * Update a ticket
   */
  async updateTicket(ticketId: number, data: UpdateTicketDTO): Promise<Ticket | null> {
    const existingTicket = await this.getTicketById(ticketId);
    if (!existingTicket) {
      return null;
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    // Only update provided fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) {
      updateData.price = data.price;
      updateData.ticket_type = data.price === 0 ? 'free' : 'paid';
    }
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.min_per_order !== undefined) updateData.min_per_order = data.min_per_order;
    if (data.max_per_order !== undefined) updateData.max_per_order = data.max_per_order;
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;
    if (data.is_on_sale !== undefined) updateData.is_on_sale = data.is_on_sale;
    if (data.internal_notes !== undefined) updateData.internal_notes = data.internal_notes;
    if (data.sales_start_at !== undefined) updateData.sales_start_at = data.sales_start_at;
    if (data.sales_end_at !== undefined) updateData.sales_end_at = data.sales_end_at;
    if (data.status !== undefined) updateData.status = data.status;

    // Update status based on is_on_sale
    if (data.is_on_sale !== undefined && !data.status) {
      updateData.status = data.is_on_sale ? 'on_sale' : 'draft';
    }

    // Check if sold out
    if (updateData.capacity && existingTicket.sold_count >= updateData.capacity) {
      updateData.status = 'sold_out';
    }

    const [updatedTicket] = await db<Ticket>('tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .update(updateData)
      .returning('*');

    // Log activity
    await this.logActivity(existingTicket.event_id, 'ticket_updated', `Ticket "${existingTicket.name}" updated`);

    return updatedTicket || null;
  }

  /**
   * Delete a ticket (soft delete)
   */
  async deleteTicket(ticketId: number): Promise<boolean> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      return false;
    }

    // Check if ticket has sales
    if (ticket.sold_count > 0) {
      throw new Error('Cannot delete ticket with existing sales. Consider ending sales instead.');
    }

    const updated = await db<Ticket>('tickets')
      .where('id', ticketId)
      .where('is_deleted', false)
      .update({ is_deleted: true, updated_at: new Date() });

    // Log activity
    await this.logActivity(ticket.event_id, 'ticket_deleted', `Ticket "${ticket.name}" deleted`);

    return updated > 0;
  }

  /**
   * Pause or resume ticket sales
   */
  async toggleTicketSales(ticketId: number): Promise<Ticket | null> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      return null;
    }

    // Cannot toggle if ended or sold out
    if (ticket.status === 'ended' || ticket.status === 'sold_out') {
      throw new Error(`Cannot toggle sales for ${ticket.status} ticket`);
    }

    const newIsOnSale = !ticket.is_on_sale;
    const newStatus = newIsOnSale ? 'on_sale' : 'draft';

    const [updatedTicket] = await db<Ticket>('tickets')
      .where('id', ticketId)
      .update({
        is_on_sale: newIsOnSale,
        status: newStatus,
        updated_at: new Date(),
      })
      .returning('*');

    // Log activity
    const action = newIsOnSale ? 'resumed' : 'paused';
    await this.logActivity(ticket.event_id, `ticket_${action}`, `Ticket "${ticket.name}" sales ${action}`);

    return updatedTicket || null;
  }

  /**
   * End ticket sales
   */
  async endTicketSales(ticketId: number): Promise<Ticket | null> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      return null;
    }

    const [updatedTicket] = await db<Ticket>('tickets')
      .where('id', ticketId)
      .update({
        status: 'ended',
        is_on_sale: false,
        updated_at: new Date(),
      })
      .returning('*');

    // Log activity
    await this.logActivity(ticket.event_id, 'ticket_ended', `Ticket "${ticket.name}" sales ended`);

    return updatedTicket || null;
  }

  /**
   * Duplicate a ticket
   */
  async duplicateTicket(ticketId: number): Promise<Ticket | null> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) {
      return null;
    }

    const duplicateData: CreateTicketDTO = {
      event_id: ticket.event_id,
      name: `${ticket.name} (Copy)`,
      description: ticket.description,
      price: parseFloat(ticket.price.toString()),
      currency: ticket.currency,
      capacity: ticket.capacity || undefined,
      category: ticket.category,
      min_per_order: ticket.min_per_order,
      max_per_order: ticket.max_per_order,
      is_visible: ticket.is_visible,
      is_on_sale: false, // Start as draft
      internal_notes: ticket.internal_notes,
      sales_start_at: ticket.sales_start_at ? ticket.sales_start_at.toISOString() : undefined,
      sales_end_at: ticket.sales_end_at ? ticket.sales_end_at.toISOString() : undefined,
    };

    return await this.createTicket(duplicateData);
  }

  /**
   * Get ticket statistics for an event
   */
  async getTicketStats(eventId: number): Promise<TicketStats> {
    const tickets = await this.getTicketsByEventId(eventId);
    
    let totalSales = 0;
    let ticketsSold = 0;
    let totalCapacity = 0;

    for (const ticket of tickets) {
      ticketsSold += ticket.sold_count;
      totalCapacity += ticket.capacity || 0;
      totalSales += ticket.sold_count * parseFloat(ticket.price.toString());
    }

    // Get addon revenue (placeholder - would come from addons table)
    const addonRevenue = 0;

    // Calculate average order value
    const avgOrderValue = ticketsSold > 0 ? totalSales / ticketsSold : 0;

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      ticketsSold,
      totalCapacity,
      addonRevenue,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    };
  }

  /**
   * Update ticket status automatically based on inventory and dates
   */
  async updateTicketStatuses(eventId: number): Promise<void> {
    const tickets = await this.getTicketsByEventId(eventId);
    const now = new Date();

    for (const ticket of tickets) {
      if (ticket.status === 'ended') continue; // Don't update ended tickets
      
      let newStatus = ticket.status;

      // Check if sold out
      if (ticket.capacity && ticket.sold_count >= ticket.capacity) {
        newStatus = 'sold_out';
      }
      // Check if sales period ended
      else if (ticket.sales_end_at && now > new Date(ticket.sales_end_at)) {
        newStatus = 'ended';
      }
      // Check if on sale
      else if (ticket.is_on_sale) {
        if (!ticket.sales_start_at || now >= new Date(ticket.sales_start_at)) {
          newStatus = 'on_sale';
        } else {
          newStatus = 'draft';
        }
      } else {
        newStatus = 'draft';
      }

      // Update if status changed
      if (newStatus !== ticket.status) {
        await db('tickets')
          .where('id', ticket.id)
          .update({ status: newStatus, updated_at: new Date() });
        
        if (newStatus === 'sold_out') {
          await this.logActivity(eventId, 'ticket_sold_out', `Ticket "${ticket.name}" is now sold out`);
        }
      }
    }
  }

  /**
   * Log activity to event_activity_logs
   */
  private async logActivity(eventId: number, actionType: string, description: string): Promise<void> {
    try {
      await db('event_activity_logs').insert({
        event_id: eventId,
        actor_type: 'admin',
        action_type: actionType,
        description,
        created_at: new Date(),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
