import db from '../database/db';

export interface Registration {
  id: number;
  event_id: number;
  user_id?: number;
  registrant_name?: string;
  registrant_email?: string;
  registrant_phone?: string;
  ticket_id?: number;
  quantity: number;
  status: string;
  registration_source: string;
  payment_status?: string;
  payment_method?: string;
  total_amount: number;
  currency: string;
  registration_code?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined fields
  ticket_name?: string;
}

export interface RegistrationListParams {
  event_id: number;
  status?: string;
  payment_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateRegistrationInput {
  event_id: number;
  registrant_name: string;
  registrant_email: string;
  registrant_phone?: string;
  ticket_id?: number;
  quantity?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  total_amount?: number;
}

export interface UpdateRegistrationInput {
  registrant_name?: string;
  registrant_email?: string;
  registrant_phone?: string;
  ticket_id?: number;
  quantity?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  total_amount?: number;
}

export class RegistrationsService {
  private generateRegistrationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'REG-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getRegistrationsByEventId(params: RegistrationListParams): Promise<{ registrations: Registration[]; total: number; page: number; limit: number }> {
    const { event_id, status, payment_status, search, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = db('event_registrations as r')
      .leftJoin('tickets as t', 'r.ticket_id', 't.id')
      .select(
        'r.id',
        'r.event_id',
        'r.user_id',
        'r.registrant_name',
        'r.registrant_email',
        'r.registrant_phone',
        'r.ticket_id',
        'r.quantity',
        'r.status',
        'r.registration_source',
        'r.payment_status',
        'r.payment_method',
        'r.total_amount',
        'r.currency',
        'r.registration_code',
        'r.metadata',
        'r.created_at',
        'r.updated_at',
        'r.is_deleted',
        't.name as ticket_name'
      )
      .where('r.event_id', event_id)
      .andWhere('r.is_deleted', false);

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.andWhere('r.status', 'pending');
      } else if (status === 'incomplete') {
        query = query.andWhere('r.status', 'started');
      } else if (status === 'cancelled') {
        query = query.andWhere('r.status', 'cancelled');
      } else {
        query = query.andWhere('r.status', status);
      }
    }

    // Apply payment status filter
    if (payment_status) {
      query = query.andWhere('r.payment_status', payment_status);
    }

    // Apply search filter
    if (search) {
      query = query.andWhere(function() {
        this.where('r.registrant_name', 'ilike', `%${search}%`)
          .orWhere('r.registrant_email', 'ilike', `%${search}%`)
          .orWhere('r.registration_code', 'ilike', `%${search}%`);
      });
    }

    // Count total
    const countQuery = query.clone().clearSelect().count('r.id as count').first();
    const countResult = await countQuery;
    const total = parseInt((countResult as any)?.count || '0', 10);

    // Apply pagination and ordering
    const registrations = await query
      .orderBy('r.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      registrations,
      total,
      page,
      limit,
    };
  }

  async getRegistrationById(eventId: number, registrationId: number): Promise<Registration | null> {
    const registration = await db('event_registrations as r')
      .leftJoin('tickets as t', 'r.ticket_id', 't.id')
      .select(
        'r.*',
        't.name as ticket_name'
      )
      .where('r.id', registrationId)
      .andWhere('r.event_id', eventId)
      .andWhere('r.is_deleted', false)
      .first();

    return registration || null;
  }

  async createRegistration(input: CreateRegistrationInput): Promise<Registration> {
    const registration_code = this.generateRegistrationCode();
    
    // Get ticket price if ticket_id is provided
    let total_amount = input.total_amount || 0;
    if (input.ticket_id && !input.total_amount) {
      const ticket = await db('tickets').where('id', input.ticket_id).first();
      if (ticket) {
        total_amount = parseFloat(ticket.price) * (input.quantity || 1);
      }
    }

    const [registration] = await db('event_registrations')
      .insert({
        event_id: input.event_id,
        registrant_name: input.registrant_name,
        registrant_email: input.registrant_email,
        registrant_phone: input.registrant_phone || null,
        ticket_id: input.ticket_id || null,
        quantity: input.quantity || 1,
        status: input.status || 'completed',
        registration_source: 'admin',
        payment_status: input.payment_status || 'pending',
        payment_method: input.payment_method || 'manual',
        total_amount,
        currency: 'USD',
        registration_code,
      })
      .returning('*');

    // Update ticket sold count if ticket_id is provided
    if (input.ticket_id) {
      await db('tickets')
        .where('id', input.ticket_id)
        .increment('sold_count', input.quantity || 1);
    }

    // Log activity
    await db('event_activity_logs').insert({
      event_id: input.event_id,
      actor_type: 'admin',
      action_type: 'registration_created',
      description: `Registration created for ${input.registrant_name} (${registration_code})`,
      metadata: JSON.stringify({ registration_id: registration.id }),
    });

    return registration;
  }

  async updateRegistration(eventId: number, registrationId: number, input: UpdateRegistrationInput): Promise<Registration> {
    const existing = await this.getRegistrationById(eventId, registrationId);
    if (!existing) {
      throw new Error('Registration not found');
    }

    const [updated] = await db('event_registrations')
      .where('id', registrationId)
      .andWhere('event_id', eventId)
      .update({
        ...input,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return updated;
  }

  async updateRegistrationStatus(eventId: number, registrationId: number, status: string): Promise<Registration> {
    const existing = await this.getRegistrationById(eventId, registrationId);
    if (!existing) {
      throw new Error('Registration not found');
    }

    const [updated] = await db('event_registrations')
      .where('id', registrationId)
      .andWhere('event_id', eventId)
      .update({
        status,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'admin',
      action_type: 'registration_status_updated',
      description: `Registration ${existing.registration_code} status changed to ${status}`,
      metadata: JSON.stringify({ registration_id: registrationId, old_status: existing.status, new_status: status }),
    });

    return updated;
  }

  async updatePaymentStatus(eventId: number, registrationId: number, payment_status: string): Promise<Registration> {
    const existing = await this.getRegistrationById(eventId, registrationId);
    if (!existing) {
      throw new Error('Registration not found');
    }

    const [updated] = await db('event_registrations')
      .where('id', registrationId)
      .andWhere('event_id', eventId)
      .update({
        payment_status,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'admin',
      action_type: 'payment_status_updated',
      description: `Registration ${existing.registration_code} payment status changed to ${payment_status}`,
      metadata: JSON.stringify({ registration_id: registrationId, old_status: existing.payment_status, new_status: payment_status }),
    });

    return updated;
  }

  async deleteRegistration(eventId: number, registrationId: number): Promise<void> {
    const existing = await this.getRegistrationById(eventId, registrationId);
    if (!existing) {
      throw new Error('Registration not found');
    }

    // Soft delete
    await db('event_registrations')
      .where('id', registrationId)
      .andWhere('event_id', eventId)
      .update({
        is_deleted: true,
        updated_at: db.fn.now(),
      });

    // Decrement ticket sold count if applicable
    if (existing.ticket_id) {
      await db('tickets')
        .where('id', existing.ticket_id)
        .decrement('sold_count', existing.quantity || 1);
    }

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'admin',
      action_type: 'registration_deleted',
      description: `Registration ${existing.registration_code} deleted`,
      metadata: JSON.stringify({ registration_id: registrationId }),
    });
  }

  async getRegistrationStats(eventId: number): Promise<{
    total: number;
    pending: number;
    incomplete: number;
    cancelled: number;
    approved: number;
  }> {
    const stats = await db('event_registrations')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE status = 'pending') as pending"),
        db.raw("COUNT(*) FILTER (WHERE status = 'started') as incomplete"),
        db.raw("COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled"),
        db.raw("COUNT(*) FILTER (WHERE status = 'completed' OR status = 'approved') as approved")
      )
      .first();

    return {
      total: parseInt(stats?.total || '0', 10),
      pending: parseInt(stats?.pending || '0', 10),
      incomplete: parseInt(stats?.incomplete || '0', 10),
      cancelled: parseInt(stats?.cancelled || '0', 10),
      approved: parseInt(stats?.approved || '0', 10),
    };
  }
}
