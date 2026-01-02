import { getDb, toJSON, ObjectId } from '../database/mongo';
import { CreateEventDTO } from '../dtos/create-event.dto';
import { ZoomService } from './zoom.service';
import { GoogleMeetService } from './google-meet.service';

interface Event {
  _id?: ObjectId;
  event_code: string;
  name: string;
  description?: string;
  category?: string;
  type: string;
  event_type?: string;
  start_date: string;
  end_date: string;
  all_day?: boolean;
  timezone?: string;
  url_slug?: string;
  reg_start_at?: string;
  reg_end_at?: string;
  capacity?: number;
  waitlist_enabled?: boolean;
  mode?: string;
  venue_id?: string;
  venue_name?: string;
  location?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  meeting_url?: string;
  accessibility_notes?: string;
  emergency_contact?: string;
  owner: string;
  banner_image_url?: string;
  promo_video_url?: string;
  gallery_images?: string[];
  meta_title?: string;
  meta_description?: string;
  status: string;
  visibility?: string;
  is_registration_open?: boolean;
  is_checkin_active?: boolean;
  check_in_mode?: string;
  data_collection_form_id?: number;
  co_hosts?: string[];
  tags?: string[];
  partners?: any[];
  sponsors?: any[];
  agenda?: any[];
  email_config?: any;
  internal_notes?: string;
  lifecycle_status?: string;
  total_registrations?: number;
  checked_in_count?: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

interface EventListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  tab?: string;
  type?: string;
  location?: string;
  owner?: string;
  status?: string;
  registrationStatus?: string;
  attendanceMin?: number;
  attendanceMax?: number;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface EventMetrics {
  totalEvents: number;
  activeEvents: number;
  draftEvents: number;
  totalRegistrations: number;
  growthRate: number;
}

export class EventsService {
  private zoomService: ZoomService;
  private googleMeetService: GoogleMeetService;

  constructor() {
    this.zoomService = new ZoomService();
    this.googleMeetService = new GoogleMeetService();
  }

  async createEvent(eventData: CreateEventDTO): Promise<any> {
    const db = await getDb();
    const now = new Date();
    let meeting_url = eventData.meeting_url || null;

    // Handle virtual event platform integration
    if (eventData.mode === 'virtual' && (eventData as any).virtual_platform) {
      try {
        const platform = (eventData as any).virtual_platform;
        if (platform === 'zoom') {
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
        } else if (platform === 'google-meet') {
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
      }
    }

    const eventRecord: Omit<Event, '_id'> = {
      event_code: eventData.event_code,
      name: eventData.name,
      description: eventData.description || undefined,
      category: eventData.category || undefined,
      type: eventData.type,
      event_type: eventData.event_type || undefined,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      all_day: eventData.all_day || false,
      timezone: eventData.timezone || undefined,
      url_slug: eventData.url_slug || undefined,
      reg_start_at: eventData.reg_start_at || undefined,
      reg_end_at: eventData.reg_end_at || undefined,
      capacity: eventData.capacity || undefined,
      waitlist_enabled: eventData.waitlist_enabled || false,
      mode: eventData.mode || undefined,
      venue_id: eventData.venue_id || undefined,
      venue_name: eventData.venue_name || undefined,
      location: eventData.location || undefined,
      address_line1: eventData.address_line1 || undefined,
      address_line2: eventData.address_line2 || undefined,
      city: eventData.city || undefined,
      state: eventData.state || undefined,
      zip_code: eventData.zip_code || undefined,
      country: eventData.country || undefined,
      meeting_url: meeting_url || undefined,
      accessibility_notes: eventData.accessibility_notes || undefined,
      emergency_contact: eventData.emergency_contact || undefined,
      owner: eventData.owner,
      banner_image_url: eventData.banner_image_url || undefined,
      promo_video_url: (eventData as any).promo_video_url || undefined,
      gallery_images: eventData.gallery_images || [],
      meta_title: eventData.meta_title || undefined,
      meta_description: eventData.meta_description || undefined,
      status: eventData.status,
      visibility: eventData.visibility || 'public',
      is_registration_open: eventData.is_registration_open || false,
      is_checkin_active: eventData.is_checkin_active || false,
      check_in_mode: eventData.check_in_mode || undefined,
      data_collection_form_id: eventData.data_collection_form_id || undefined,
      co_hosts: eventData.co_hosts || [],
      tags: eventData.tags || [],
      partners: eventData.partners || [],
      sponsors: eventData.sponsors || [],
      agenda: eventData.agenda || [],
      email_config: eventData.email_config || undefined,
      internal_notes: eventData.internal_notes || undefined,
      lifecycle_status: eventData.lifecycle_status || 'draft',
      total_registrations: 0,
      checked_in_count: 0,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    const result = await db.collection('events').insertOne(eventRecord);
    const createdEvent = await db.collection('events').findOne({ _id: result.insertedId });
    
    return toJSON(createdEvent);
  }

  async getEventsList(query: EventListQuery) {
    const db = await getDb();
    const {
      page: pageStr = '1',
      pageSize: pageSizeStr = '10',
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

    // Convert string params to numbers
    const page = typeof pageStr === 'string' ? parseInt(pageStr, 10) : pageStr;
    const pageSize = typeof pageSizeStr === 'string' ? parseInt(pageSizeStr, 10) : pageSizeStr;

    const filter: any = { deleted_at: null };

    // Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { event_code: { $regex: search, $options: 'i' } },
      ];
    }

    // Tab filtering
    this.applyTabFilter(filter, tab);

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Owner filter
    if (owner) {
      filter.owner = { $regex: owner, $options: 'i' };
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Registration status filter
    if (registrationStatus) {
      filter.is_registration_open = registrationStatus === 'open';
    }

    // Attendance range filter
    if (attendanceMin !== undefined) {
      filter.total_registrations = { ...filter.total_registrations, $gte: attendanceMin };
    }
    if (attendanceMax !== undefined) {
      filter.total_registrations = { ...filter.total_registrations, $lte: attendanceMax };
    }

    // Date range filter
    if (startDateFrom) {
      filter.start_date = { ...filter.start_date, $gte: startDateFrom };
    }
    if (startDateTo) {
      filter.start_date = { ...filter.start_date, $lte: startDateTo };
    }

    // Get total count
    const total = await db.collection('events').countDocuments(filter);

    // Sorting
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Pagination
    const offset = (page - 1) * pageSize;
    const events = await db.collection('events')
      .find(filter)
      .sort(sort)
      .skip(offset)
      .limit(pageSize)
      .toArray();

    return {
      data: events.map(toJSON),
      pagination: {
        page,
        pageSize,
        totalRecords: total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async calculateMetrics(query: { startDateFrom?: string; startDateTo?: string; tab?: string }): Promise<EventMetrics> {
    const db = await getDb();
    const { startDateFrom, startDateTo, tab } = query;

    const filter: any = { deleted_at: null };

    // Apply date range if provided
    if (startDateFrom) {
      filter.start_date = { ...filter.start_date, $gte: startDateFrom };
    }
    if (startDateTo) {
      filter.start_date = { ...filter.start_date, $lte: startDateTo };
    }

    // Apply tab filter if provided
    this.applyTabFilter(filter, tab);

    const totalEvents = await db.collection('events').countDocuments(filter);
    const activeEvents = await db.collection('events').countDocuments({ ...filter, status: 'Published' });
    const draftEvents = await db.collection('events').countDocuments({ ...filter, status: 'Draft' });

    // Sum total registrations
    const regsPipeline = [
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total_registrations' } } }
    ];
    const regsResult = await db.collection('events').aggregate(regsPipeline).toArray();
    const totalRegistrations = regsResult[0]?.total || 0;

    // Calculate growth rate
    const growthRate = await this.calculateGrowthRate(startDateFrom, startDateTo);

    return {
      totalEvents,
      activeEvents,
      draftEvents,
      totalRegistrations,
      growthRate,
    };
  }

  async bulkArchiveEvents(eventIds: string[]): Promise<number> {
    const db = await getDb();
    const result = await db.collection('events').updateMany(
      { event_code: { $in: eventIds }, deleted_at: null },
      { $set: { status: 'Archived', updated_at: new Date() } }
    );
    return result.modifiedCount;
  }

  async bulkDeleteEvents(eventIds: string[]): Promise<number> {
    const db = await getDb();
    const result = await db.collection('events').updateMany(
      { event_code: { $in: eventIds }, deleted_at: null },
      { $set: { deleted_at: new Date() } }
    );
    return result.modifiedCount;
  }

  private applyTabFilter(filter: any, tab?: string): void {
    if (!tab) return;

    const today = new Date().toISOString().split('T')[0];

    switch (tab) {
      case 'active':
        filter.status = 'Published';
        filter.start_date = { ...filter.start_date, $gte: today };
        break;
      case 'draft':
        filter.status = 'Draft';
        break;
      case 'archived':
        filter.status = 'Archived';
        break;
      case 'live':
        filter.status = 'Published';
        filter.start_date = { ...filter.start_date, $lte: today };
        filter.end_date = { $gte: today };
        break;
    }
  }

  private async calculateGrowthRate(startDateFrom?: string, startDateTo?: string): Promise<number> {
    if (!startDateFrom || !startDateTo) {
      return 0;
    }

    const db = await getDb();
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
    const currentPipeline = [
      { $match: { deleted_at: null, start_date: { $gte: startDateFrom, $lte: startDateTo } } },
      { $group: { _id: null, total: { $sum: '$total_registrations' } } }
    ];
    const currentResult = await db.collection('events').aggregate(currentPipeline).toArray();
    const current = currentResult[0]?.total || 0;

    // Previous period registrations
    const prevPipeline = [
      { $match: { deleted_at: null, start_date: { $gte: prevStart.toISOString(), $lte: prevEnd.toISOString() } } },
      { $group: { _id: null, total: { $sum: '$total_registrations' } } }
    ];
    const prevResult = await db.collection('events').aggregate(prevPipeline).toArray();
    const previous = prevResult[0]?.total || 0;

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 100);
  }
}
