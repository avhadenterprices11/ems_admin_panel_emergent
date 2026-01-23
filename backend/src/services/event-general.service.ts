import db from '../database/db';
import { MasterDataService } from './master-data.service';

const masterDataService = new MasterDataService();

export interface EventGeneralDetails {
  id: number;
  event_code: string;
  // Basic Info
  name: string;
  description?: string;
  category_id?: number;
  category?: { id: number; name: string; slug: string };
  type: string;
  event_type?: string;
  visibility: string;
  check_in_mode?: string;
  owner: string;
  // Co-hosts
  co_hosts?: { id: number; user_id: number; role: string; name: string; email: string }[];
  // Tags
  tags?: { id: number; name: string; slug: string; color?: string }[];
  // Date & Time
  start_date: string;
  end_date: string;
  all_day: boolean;
  timezone?: string;
  // Registration
  reg_start_at?: string;
  reg_end_at?: string;
  capacity?: number;
  waitlist_enabled: boolean;
  // Location
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
  // Virtual meeting
  virtual_platform?: string;
  meeting_platform?: string;
  // Media
  banner_image_url?: string;
  promo_video_url?: string;
  gallery_images?: any[];
  event_media?: any[];
  // Accessibility & Safety
  accessibility_notes?: string;
  emergency_contact?: string;
  // Agenda
  agenda?: any[];
  // Partners & Sponsors
  partners?: any[];
  sponsors?: any[];
  // Internal
  internal_notes?: string;
  lifecycle_status?: string;
  // Meta
  created_at: string;
  updated_at: string;
}

export interface UpdateEventGeneralDetailsDTO {
  // Basic Info
  name?: string;
  description?: string;
  category_id?: number;
  type?: string;
  event_type?: string;
  visibility?: string;
  check_in_mode?: string;
  owner?: string;
  // Tags (array of tag IDs)
  tag_ids?: number[];
  // Co-hosts (array of user IDs)
  cohost_ids?: number[];
  // Date & Time
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  timezone?: string;
  // Registration
  reg_start_at?: string;
  reg_end_at?: string;
  capacity?: number;
  waitlist_enabled?: boolean;
  // Location
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
  // Media
  banner_image_url?: string;
  promo_video_url?: string;
  // Accessibility & Safety
  accessibility_notes?: string;
  emergency_contact?: string;
  // Agenda
  agenda?: any[];
}

export class EventGeneralService {
  async getEventGeneralDetails(eventId: number): Promise<EventGeneralDetails> {
    // Get event base data
    const event = await db('events')
      .where('id', eventId)
      .whereNull('deleted_at')
      .first();

    if (!event) {
      throw new Error('Event not found');
    }

    // Get category if exists
    let category = null;
    if (event.category_id) {
      category = await db('categories')
        .where('id', event.category_id)
        .whereNull('deleted_at')
        .select('id', 'name', 'slug')
        .first();
    }

    // Get tags
    const tags = await masterDataService.getEventTags(eventId);

    // Get co-hosts
    const co_hosts = await masterDataService.getEventCohosts(eventId);

    // Get media
    const event_media = await masterDataService.getEventMedia(eventId);

    return {
      id: event.id,
      event_code: event.event_code,
      name: event.name,
      description: event.description,
      category_id: event.category_id,
      category,
      type: event.type,
      event_type: event.event_type,
      visibility: event.visibility,
      check_in_mode: event.check_in_mode,
      owner: event.owner,
      co_hosts,
      tags,
      start_date: event.start_date,
      end_date: event.end_date,
      all_day: event.all_day,
      timezone: event.timezone,
      reg_start_at: event.reg_start_at,
      reg_end_at: event.reg_end_at,
      capacity: event.capacity,
      waitlist_enabled: event.waitlist_enabled,
      mode: event.mode,
      venue_id: event.venue_id,
      venue_name: event.venue_name,
      location: event.location,
      address_line1: event.address_line1,
      address_line2: event.address_line2,
      city: event.city,
      state: event.state,
      zip_code: event.zip_code,
      country: event.country,
      meeting_url: event.meeting_url,
      virtual_platform: event.meeting_platform,
      meeting_platform: event.meeting_platform,
      banner_image_url: event.banner_image_url,
      promo_video_url: event.promo_video_url,
      gallery_images: event.gallery_images,
      event_media,
      accessibility_notes: event.accessibility_notes,
      emergency_contact: event.emergency_contact,
      agenda: event.agenda,
      partners: event.partners,
      sponsors: event.sponsors,
      internal_notes: event.internal_notes,
      lifecycle_status: event.lifecycle_status,
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
  }

  async updateEventGeneralDetails(eventId: number, data: UpdateEventGeneralDetailsDTO): Promise<EventGeneralDetails> {
    // Check event exists
    const event = await db('events')
      .where('id', eventId)
      .whereNull('deleted_at')
      .first();

    if (!event) {
      throw new Error('Event not found');
    }

    // Build update object for events table
    const eventUpdate: any = {
      updated_at: new Date(),
    };

    // Basic Info
    if (data.name !== undefined) eventUpdate.name = data.name;
    if (data.description !== undefined) eventUpdate.description = data.description;
    if (data.category_id !== undefined) eventUpdate.category_id = data.category_id;
    if (data.type !== undefined) eventUpdate.type = data.type;
    if (data.event_type !== undefined) eventUpdate.event_type = data.event_type;
    if (data.visibility !== undefined) eventUpdate.visibility = data.visibility;
    if (data.check_in_mode !== undefined) eventUpdate.check_in_mode = data.check_in_mode;
    if (data.owner !== undefined) eventUpdate.owner = data.owner;

    // Date & Time
    if (data.start_date !== undefined) eventUpdate.start_date = data.start_date;
    if (data.end_date !== undefined) eventUpdate.end_date = data.end_date;
    if (data.all_day !== undefined) eventUpdate.all_day = data.all_day;
    if (data.timezone !== undefined) eventUpdate.timezone = data.timezone;

    // Registration
    if (data.reg_start_at !== undefined) eventUpdate.reg_start_at = data.reg_start_at;
    if (data.reg_end_at !== undefined) eventUpdate.reg_end_at = data.reg_end_at;
    if (data.capacity !== undefined) eventUpdate.capacity = data.capacity;
    if (data.waitlist_enabled !== undefined) eventUpdate.waitlist_enabled = data.waitlist_enabled;

    // Location
    if (data.mode !== undefined) eventUpdate.mode = data.mode;
    if (data.venue_id !== undefined) eventUpdate.venue_id = data.venue_id;
    if (data.venue_name !== undefined) eventUpdate.venue_name = data.venue_name;
    if (data.location !== undefined) eventUpdate.location = data.location;
    if (data.address_line1 !== undefined) eventUpdate.address_line1 = data.address_line1;
    if (data.address_line2 !== undefined) eventUpdate.address_line2 = data.address_line2;
    if (data.city !== undefined) eventUpdate.city = data.city;
    if (data.state !== undefined) eventUpdate.state = data.state;
    if (data.zip_code !== undefined) eventUpdate.zip_code = data.zip_code;
    if (data.country !== undefined) eventUpdate.country = data.country;
    if (data.meeting_url !== undefined) eventUpdate.meeting_url = data.meeting_url;

    // Media
    if (data.banner_image_url !== undefined) eventUpdate.banner_image_url = data.banner_image_url;
    if (data.promo_video_url !== undefined) eventUpdate.promo_video_url = data.promo_video_url;

    // Accessibility & Safety
    if (data.accessibility_notes !== undefined) eventUpdate.accessibility_notes = data.accessibility_notes;
    if (data.emergency_contact !== undefined) eventUpdate.emergency_contact = data.emergency_contact;

    // Agenda
    if (data.agenda !== undefined) eventUpdate.agenda = JSON.stringify(data.agenda);

    // Update events table
    await db('events').where('id', eventId).update(eventUpdate);

    // Update tags if provided
    if (data.tag_ids !== undefined) {
      await masterDataService.setEventTags(eventId, data.tag_ids);
    }

    // Update co-hosts if provided
    if (data.cohost_ids !== undefined) {
      await masterDataService.setEventCohosts(eventId, data.cohost_ids);
    }

    // Log activity
    await this.logActivity(eventId, 'general_details_updated', 'Event general details updated');

    // Return updated data
    return this.getEventGeneralDetails(eventId);
  }

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
