import db from '../database/db';
import { Event, EventListQuery, EventMetrics } from '../interfaces/event.interface';
import { CreateEventDTO } from '../dtos/create-event.dto';
import { ZoomService } from './zoom.service';
import { GoogleMeetService } from './google-meet.service';
import { Knex } from 'knex';

export class EventsService {
  private zoomService: ZoomService;
  private googleMeetService: GoogleMeetService;

  constructor() {
    this.zoomService = new ZoomService();
    this.googleMeetService = new GoogleMeetService();
  }

  async createEvent(eventData: CreateEventDTO): Promise<Event> {
    const now = new Date();
    let meeting_url = eventData.meeting_url || null;

    // Handle virtual event platform integration
    if (eventData.mode === 'virtual' && eventData.virtual_platform) {
      try {
        if (eventData.virtual_platform === 'zoom') {
          // Calculate duration in minutes
          const startTime = new Date(eventData.start_date);
          const endTime = new Date(eventData.end_date);
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

          meeting_url = await this.zoomService.createMeeting({
            topic: eventData.name,
            start_time: eventData.start_date,
            duration: durationMinutes,
            timezone: eventData.timezone || 'UTC',
            agenda: eventData.description,
          });
        } else if (eventData.virtual_platform === 'google-meet') {
          meeting_url = await this.googleMeetService.createMeetingLink({
            summary: eventData.name,
            description: eventData.description,
            start: eventData.start_date,
            end: eventData.end_date,
            timezone: eventData.timezone || 'UTC',
          });
        }
      } catch (error) {
        console.error('Virtual platform integration error:', error);
        // Don't fail the entire event creation, just log the error
        // User can manually add meeting link later
      }
    }
    
    const eventRecord = {
      event_code: eventData.event_code,
      name: eventData.name,
      description: eventData.description || null,
      category: eventData.category || null,
      type: eventData.type,
      event_type: eventData.event_type || null,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      all_day: eventData.all_day || false,
      timezone: eventData.timezone || null,
      url_slug: eventData.url_slug || null,
      
      // Registration
      reg_start_at: eventData.reg_start_at || null,
      reg_end_at: eventData.reg_end_at || null,
      capacity: eventData.capacity || null,
      waitlist_enabled: eventData.waitlist_enabled || false,
      
      // Venue
      mode: eventData.mode || null,
      venue_id: eventData.venue_id || null,
      venue_name: eventData.venue_name || null,
      location: eventData.location,
      address_line1: eventData.address_line1 || null,
      address_line2: eventData.address_line2 || null,
      city: eventData.city || null,
      state: eventData.state || null,
      zip_code: eventData.zip_code || null,
      country: eventData.country || null,
      meeting_url: eventData.meeting_url || null,
      accessibility_notes: eventData.accessibility_notes || null,
      emergency_contact: eventData.emergency_contact || null,
      
      // Owner
      owner: eventData.owner,
      
      // Media
      banner_image_url: eventData.banner_image_url || null,
      gallery_images: eventData.gallery_images ? JSON.stringify(eventData.gallery_images) : null,
      
      // SEO
      meta_title: eventData.meta_title || null,
      meta_description: eventData.meta_description || null,
      
      // Settings
      status: eventData.status,
      visibility: eventData.visibility || 'public',
      is_registration_open: eventData.is_registration_open || false,
      is_checkin_active: eventData.is_checkin_active || false,
      check_in_mode: eventData.check_in_mode || null,
      data_collection_form_id: eventData.data_collection_form_id || null,
      
      // People
      co_hosts: eventData.co_hosts ? JSON.stringify(eventData.co_hosts) : null,
      tags: eventData.tags ? JSON.stringify(eventData.tags) : null,
      
      // JSON Structures
      partners: eventData.partners ? JSON.stringify(eventData.partners) : null,
      sponsors: eventData.sponsors ? JSON.stringify(eventData.sponsors) : null,
      agenda: eventData.agenda ? JSON.stringify(eventData.agenda) : null,
      
      // Email
      email_config: eventData.email_config ? JSON.stringify(eventData.email_config) : null,
      
      // Internal
      internal_notes: eventData.internal_notes || null,
      lifecycle_status: eventData.lifecycle_status || 'draft',
      
      // Defaults for existing fields
      total_registrations: 0,
      checked_in_count: 0,
      
      // Timestamps
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const [createdEvent] = await db<Event>('events')
      .insert(eventRecord)
      .returning('*');

    return createdEvent;
  }

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
