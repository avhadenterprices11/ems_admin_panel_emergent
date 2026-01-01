import db from '../database/db';
import { Event, EventListQuery, EventMetrics } from '../interfaces/event.interface';
import { Knex } from 'knex';

export class EventsService {
  async getEventsList(query: EventListQuery) {
    const {
      page = 1,
      pageSize = 10,
      search,
      tab,
      type,
      location,
      owner,
      status,
      registrationStatus,
      attendanceMin,
      attendanceMax,
      startDateFrom,
      startDateTo,
      sortBy = 'start_date',
      sortOrder = 'desc',
    } = query;

    let queryBuilder = db<Event>('events').where('deleted_at', null);

    // Search
    if (search) {
      queryBuilder = queryBuilder.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('event_code', 'ilike', `%${search}%`);
      });
    }

    // Tab filtering
    if (tab) {
      queryBuilder = this.applyTabFilter(queryBuilder, tab);
    }

    // Type filter
    if (type) {
      queryBuilder = queryBuilder.where('type', type);
    }

    // Location filter
    if (location) {
      queryBuilder = queryBuilder.where('location', 'ilike', `%${location}%`);
    }

    // Owner filter
    if (owner) {
      queryBuilder = queryBuilder.where('owner', 'ilike', `%${owner}%`);
    }

    // Status filter
    if (status) {
      queryBuilder = queryBuilder.where('status', status);
    }

    // Registration status filter
    if (registrationStatus) {
      if (registrationStatus === 'open') {
        queryBuilder = queryBuilder.where('is_registration_open', true);
      } else if (registrationStatus === 'closed') {
        queryBuilder = queryBuilder.where('is_registration_open', false);
      }
    }

    // Attendance range filter
    if (attendanceMin !== undefined) {
      queryBuilder = queryBuilder.where('total_registrations', '>=', attendanceMin);
    }
    if (attendanceMax !== undefined) {
      queryBuilder = queryBuilder.where('total_registrations', '<=', attendanceMax);
    }

    // Date range filter
    if (startDateFrom) {
      queryBuilder = queryBuilder.where('start_date', '>=', startDateFrom);
    }
    if (startDateTo) {
      queryBuilder = queryBuilder.where('start_date', '<=', startDateTo);
    }

    // Get total count
    const totalRecords = await queryBuilder.clone().count('* as count').first();
    const total = parseInt(totalRecords?.count as string || '0');

    // Sorting
    queryBuilder = queryBuilder.orderBy(sortBy, sortOrder as 'asc' | 'desc');

    // Pagination
    const offset = (page - 1) * pageSize;
    const events = await queryBuilder.limit(pageSize).offset(offset);

    return {
      data: events,
      pagination: {
        page,
        pageSize,
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async calculateMetrics(query: { startDateFrom?: string; startDateTo?: string; tab?: string }): Promise<EventMetrics> {
    const { startDateFrom, startDateTo, tab } = query;

    let queryBuilder = db<Event>('events').where('deleted_at', null);

    // Apply date range if provided
    if (startDateFrom) {
      queryBuilder = queryBuilder.where('start_date', '>=', startDateFrom);
    }
    if (startDateTo) {
      queryBuilder = queryBuilder.where('start_date', '<=', startDateTo);
    }

    // Apply tab filter if provided
    if (tab) {
      queryBuilder = this.applyTabFilter(queryBuilder, tab);
    }

    const totalEvents = await queryBuilder.clone().count('* as count').first();
    const activeEvents = await queryBuilder.clone().where('status', 'Published').count('* as count').first();
    const draftEvents = await queryBuilder.clone().where('status', 'Draft').count('* as count').first();
    const totalRegs = await queryBuilder.clone().sum('total_registrations as sum').first();

    // Calculate growth rate (compare to previous period)
    const growthRate = await this.calculateGrowthRate(startDateFrom, startDateTo);

    return {
      totalEvents: parseInt(totalEvents?.count as string || '0'),
      activeEvents: parseInt(activeEvents?.count as string || '0'),
      draftEvents: parseInt(draftEvents?.count as string || '0'),
      totalRegistrations: parseInt(totalRegs?.sum as string || '0'),
      growthRate,
    };
  }

  async bulkArchiveEvents(eventIds: string[]): Promise<number> {
    const updated = await db<Event>('events')
      .whereIn('event_code', eventIds)
      .where('deleted_at', null)
      .update({ status: 'Archived', updated_at: db.fn.now() });

    return updated;
  }

  async bulkDeleteEvents(eventIds: string[]): Promise<number> {
    const updated = await db<Event>('events')
      .whereIn('event_code', eventIds)
      .where('deleted_at', null)
      .update({ deleted_at: db.fn.now() });

    return updated;
  }

  private applyTabFilter(queryBuilder: Knex.QueryBuilder, tab: string): Knex.QueryBuilder {
    const today = new Date().toISOString().split('T')[0];

    switch (tab) {
      case 'active':
        return queryBuilder.where('status', 'Published').where('start_date', '>=', today);
      case 'draft':
        return queryBuilder.where('status', 'Draft');
      case 'archived':
        return queryBuilder.where('status', 'Archived');
      case 'live':
        return queryBuilder
          .where('status', 'Published')
          .where('start_date', '<=', today)
          .where('end_date', '>=', today);
      default:
        return queryBuilder;
    }
  }

  private async calculateGrowthRate(startDateFrom?: string, startDateTo?: string): Promise<number> {
    if (!startDateFrom || !startDateTo) {
      return 0;
    }

    const start = new Date(startDateFrom);
    const end = new Date(startDateTo);
    const periodDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (periodDays <= 0) {
      return 0;
    }

    // Calculate previous period
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - periodDays);

    // Current period registrations
    const currentRegs = await db<Event>('events')
      .where('deleted_at', null)
      .where('start_date', '>=', startDateFrom)
      .where('start_date', '<=', startDateTo)
      .sum('total_registrations as sum')
      .first();

    // Previous period registrations
    const prevRegs = await db<Event>('events')
      .where('deleted_at', null)
      .where('start_date', '>=', prevStart.toISOString())
      .where('start_date', '<=', prevEnd.toISOString())
      .sum('total_registrations as sum')
      .first();

    const current = parseInt(currentRegs?.sum as string || '0');
    const previous = parseInt(prevRegs?.sum as string || '0');

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }
}
