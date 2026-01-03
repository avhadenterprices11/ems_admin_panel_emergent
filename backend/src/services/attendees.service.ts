import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';

export interface Attendee {
  id: number;
  event_id: number;
  registration_id?: number;
  ticket_id?: number;
  attendee_name: string;
  attendee_email?: string;
  qr_code_value: string;
  checkin_status: string;
  checkin_time?: string;
  checkin_source?: string;
  checkin_location?: string;
  checkin_device_id?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined fields
  ticket_name?: string;
  device_name?: string;
}

export interface CheckinLog {
  id: number;
  event_id: number;
  attendee_id: number;
  device_id?: number;
  location?: string;
  action: string;
  timestamp: string;
  metadata?: any;
}

export interface CheckinDevice {
  id: number;
  event_id: number;
  device_name: string;
  device_type?: string;
  location?: string;
  total_scans: number;
  last_seen_at?: string;
  battery_level?: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CheckinMetrics {
  total_registrations: number;
  total_checked_in: number;
  total_not_checked_in: number;
  no_show_count: number;
  no_show_rate: number;
  checkin_percentage: number;
  peak_checkin_time?: string;
  last_checkin_time?: string;
  last_checkin_ago?: string;
}

export interface LocationStats {
  location: string;
  checkin_count: number;
  last_checkin?: string;
  last_checkin_ago?: string;
}

export interface AttendeeListParams {
  event_id: number;
  checkin_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QRCheckinInput {
  event_id: number;
  qr_code: string;
  device_id?: number;
  device_name?: string;
  location?: string;
}

export class AttendeesService {
  // Generate unique QR code value
  generateQRCode(): string {
    return `QR-${uuidv4()}`;
  }

  // Create attendee from registration
  async createAttendeeFromRegistration(
    eventId: number,
    registrationId: number,
    ticketId: number | null,
    attendeeName: string,
    attendeeEmail?: string
  ): Promise<Attendee> {
    const qr_code_value = this.generateQRCode();

    const [attendee] = await db('event_attendees')
      .insert({
        event_id: eventId,
        registration_id: registrationId,
        ticket_id: ticketId,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        qr_code_value,
        checkin_status: 'not_checked_in',
      })
      .returning('*');

    return attendee;
  }

  // Get attendees list with filters
  async getAttendeesByEventId(params: AttendeeListParams): Promise<{ attendees: Attendee[]; total: number; page: number; limit: number }> {
    const { event_id, checkin_status, search, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    let query = db('event_attendees as a')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .leftJoin('event_checkin_devices as d', 'a.checkin_device_id', 'd.id')
      .select(
        'a.*',
        't.name as ticket_name',
        'd.device_name'
      )
      .where('a.event_id', event_id)
      .andWhere('a.is_deleted', false);

    // Filter by checkin status
    if (checkin_status && checkin_status !== 'all') {
      query = query.andWhere('a.checkin_status', checkin_status);
    }

    // Search by name or email
    if (search) {
      query = query.andWhere(function() {
        this.where('a.attendee_name', 'ilike', `%${search}%`)
          .orWhere('a.attendee_email', 'ilike', `%${search}%`)
          .orWhere('a.qr_code_value', 'ilike', `%${search}%`);
      });
    }

    // Count total
    const countQuery = query.clone().clearSelect().count('a.id as count').first();
    const countResult = await countQuery;
    const total = parseInt((countResult as any)?.count || '0', 10);

    // Get paginated results
    const attendees = await query
      .orderBy('a.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { attendees, total, page, limit };
  }

  // Get attendee by ID
  async getAttendeeById(eventId: number, attendeeId: number): Promise<Attendee | null> {
    const attendee = await db('event_attendees as a')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .leftJoin('event_checkin_devices as d', 'a.checkin_device_id', 'd.id')
      .select('a.*', 't.name as ticket_name', 'd.device_name')
      .where('a.id', attendeeId)
      .andWhere('a.event_id', eventId)
      .andWhere('a.is_deleted', false)
      .first();

    return attendee || null;
  }

  // Get attendee by QR code
  async getAttendeeByQRCode(qrCode: string): Promise<Attendee | null> {
    const attendee = await db('event_attendees as a')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .select('a.*', 't.name as ticket_name')
      .where('a.qr_code_value', qrCode)
      .andWhere('a.is_deleted', false)
      .first();

    return attendee || null;
  }

  // QR Check-in (main check-in flow)
  async qrCheckin(input: QRCheckinInput): Promise<{ success: boolean; message: string; attendee?: Attendee }> {
    const { event_id, qr_code, device_id, device_name, location } = input;

    // Find attendee by QR code
    const attendee = await this.getAttendeeByQRCode(qr_code);

    if (!attendee) {
      return { success: false, message: 'Invalid QR code' };
    }

    // Verify event matches (compare as integers)
    if (parseInt(attendee.event_id.toString(), 10) !== parseInt(event_id.toString(), 10)) {
      return { success: false, message: 'QR code does not belong to this event' };
    }

    // Check if already checked in
    if (attendee.checkin_status === 'checked_in') {
      return { success: false, message: 'Attendee already checked in' };
    }

    // Get or create device
    let deviceId = device_id;
    if (!deviceId && device_name) {
      deviceId = await this.getOrCreateDevice(event_id, device_name, location);
    }

    // Perform check-in (atomic)
    const [updated] = await db('event_attendees')
      .where('id', attendee.id)
      .update({
        checkin_status: 'checked_in',
        checkin_time: db.fn.now(),
        checkin_source: 'scanner',
        checkin_location: location || null,
        checkin_device_id: deviceId || null,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Create check-in log
    await db('event_checkin_logs').insert({
      event_id,
      attendee_id: attendee.id,
      device_id: deviceId || null,
      location: location || null,
      action: 'checkin',
      metadata: JSON.stringify({ source: 'scanner', qr_code }),
    });

    // Update device stats
    if (deviceId) {
      await db('event_checkin_devices')
        .where('id', deviceId)
        .update({
          total_scans: db.raw('total_scans + 1'),
          last_seen_at: db.fn.now(),
          status: 'online',
          updated_at: db.fn.now(),
        });
    }

    // Log activity
    await db('event_activity_logs').insert({
      event_id,
      actor_type: 'system',
      action_type: 'attendee_checkin',
      description: `${attendee.attendee_name} checked in via scanner`,
      metadata: JSON.stringify({ attendee_id: attendee.id, location }),
    });

    return { success: true, message: 'Check-in successful', attendee: updated };
  }

  // Manual Check-in (admin)
  async manualCheckin(eventId: number, attendeeId: number, location?: string): Promise<{ success: boolean; message: string; attendee?: Attendee }> {
    const attendee = await this.getAttendeeById(eventId, attendeeId);

    if (!attendee) {
      return { success: false, message: 'Attendee not found' };
    }

    if (attendee.checkin_status === 'checked_in') {
      return { success: false, message: 'Attendee already checked in' };
    }

    // Perform check-in
    const [updated] = await db('event_attendees')
      .where('id', attendeeId)
      .andWhere('event_id', eventId)
      .update({
        checkin_status: 'checked_in',
        checkin_time: db.fn.now(),
        checkin_source: 'admin',
        checkin_location: location || null,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Create check-in log
    await db('event_checkin_logs').insert({
      event_id: eventId,
      attendee_id: attendeeId,
      location: location || null,
      action: 'checkin',
      metadata: JSON.stringify({ source: 'admin' }),
    });

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'admin',
      action_type: 'manual_checkin',
      description: `${attendee.attendee_name} manually checked in by admin`,
      metadata: JSON.stringify({ attendee_id: attendeeId }),
    });

    return { success: true, message: 'Manual check-in successful', attendee: updated };
  }

  // Undo Check-in
  async undoCheckin(eventId: number, attendeeId: number): Promise<{ success: boolean; message: string; attendee?: Attendee }> {
    const attendee = await this.getAttendeeById(eventId, attendeeId);

    if (!attendee) {
      return { success: false, message: 'Attendee not found' };
    }

    if (attendee.checkin_status !== 'checked_in') {
      return { success: false, message: 'Attendee is not checked in' };
    }

    // Undo check-in
    const [updated] = await db('event_attendees')
      .where('id', attendeeId)
      .andWhere('event_id', eventId)
      .update({
        checkin_status: 'not_checked_in',
        checkin_time: null,
        checkin_source: null,
        checkin_location: null,
        checkin_device_id: null,
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Create undo log
    await db('event_checkin_logs').insert({
      event_id: eventId,
      attendee_id: attendeeId,
      action: 'undo',
      metadata: JSON.stringify({ previous_status: 'checked_in' }),
    });

    // Log activity
    await db('event_activity_logs').insert({
      event_id: eventId,
      actor_type: 'admin',
      action_type: 'undo_checkin',
      description: `Check-in undone for ${attendee.attendee_name}`,
      metadata: JSON.stringify({ attendee_id: attendeeId }),
    });

    return { success: true, message: 'Check-in undone successfully', attendee: updated };
  }

  // Get live check-in metrics
  async getCheckinMetrics(eventId: number): Promise<CheckinMetrics> {
    // Get counts
    const counts = await db('event_attendees')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE checkin_status = 'checked_in') as checked_in"),
        db.raw("COUNT(*) FILTER (WHERE checkin_status = 'not_checked_in') as not_checked_in"),
        db.raw("COUNT(*) FILTER (WHERE checkin_status = 'no_show') as no_show")
      )
      .first();

    const total = parseInt(counts?.total || '0', 10);
    const checkedIn = parseInt(counts?.checked_in || '0', 10);
    const notCheckedIn = parseInt(counts?.not_checked_in || '0', 10);
    const noShow = parseInt(counts?.no_show || '0', 10);

    // Get last check-in
    const lastCheckin = await db('event_attendees')
      .where('event_id', eventId)
      .andWhere('checkin_status', 'checked_in')
      .orderBy('checkin_time', 'desc')
      .first();

    // Calculate peak check-in time (hour with most check-ins)
    const peakTime = await db('event_attendees')
      .where('event_id', eventId)
      .andWhere('checkin_status', 'checked_in')
      .whereNotNull('checkin_time')
      .select(db.raw("date_trunc('hour', checkin_time) as hour"))
      .groupBy(db.raw("date_trunc('hour', checkin_time)"))
      .orderBy(db.raw('COUNT(*)'), 'desc')
      .first();

    let peakCheckinTime: string | undefined;
    if (peakTime?.hour) {
      const date = new Date(peakTime.hour);
      const nextHour = new Date(date.getTime() + 60 * 60 * 1000);
      peakCheckinTime = `${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${nextHour.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    // Calculate last check-in ago
    let lastCheckinAgo: string | undefined;
    if (lastCheckin?.checkin_time) {
      const diff = Date.now() - new Date(lastCheckin.checkin_time).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) lastCheckinAgo = 'Just now';
      else if (mins < 60) lastCheckinAgo = `${mins} mins ago`;
      else lastCheckinAgo = `${Math.floor(mins / 60)} hours ago`;
    }

    return {
      total_registrations: total,
      total_checked_in: checkedIn,
      total_not_checked_in: notCheckedIn,
      no_show_count: noShow,
      no_show_rate: total > 0 ? (noShow / total) * 100 : 0,
      checkin_percentage: total > 0 ? (checkedIn / total) * 100 : 0,
      peak_checkin_time: peakCheckinTime,
      last_checkin_time: lastCheckin?.checkin_time,
      last_checkin_ago: lastCheckinAgo,
    };
  }

  // Get active devices
  async getActiveDevices(eventId: number): Promise<CheckinDevice[]> {
    const devices = await db('event_checkin_devices')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .orderBy('last_seen_at', 'desc');

    return devices;
  }

  // Get or create device
  async getOrCreateDevice(eventId: number, deviceName: string, location?: string): Promise<number> {
    let device = await db('event_checkin_devices')
      .where('event_id', eventId)
      .andWhere('device_name', deviceName)
      .first();

    if (!device) {
      [device] = await db('event_checkin_devices')
        .insert({
          event_id: eventId,
          device_name: deviceName,
          device_type: 'scanner',
          location: location || null,
          status: 'online',
        })
        .returning('*');
    }

    return device.id;
  }

  // Update device status
  async updateDeviceStatus(deviceId: number, status: string, batteryLevel?: number): Promise<CheckinDevice> {
    const [updated] = await db('event_checkin_devices')
      .where('id', deviceId)
      .update({
        status,
        battery_level: batteryLevel,
        last_seen_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*');

    return updated;
  }

  // Get location stats
  async getLocationStats(eventId: number): Promise<LocationStats[]> {
    const locations = await db('event_checkin_logs')
      .where('event_id', eventId)
      .whereNotNull('location')
      .andWhere('action', 'checkin')
      .select(
        'location',
        db.raw('COUNT(*) as checkin_count'),
        db.raw('MAX(timestamp) as last_checkin')
      )
      .groupBy('location')
      .orderBy('checkin_count', 'desc');

    return locations.map((loc: any) => {
      let lastCheckinAgo: string | undefined;
      if (loc.last_checkin) {
        const diff = Date.now() - new Date(loc.last_checkin).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) lastCheckinAgo = 'Just now';
        else if (mins < 60) lastCheckinAgo = `${mins}m ago`;
        else lastCheckinAgo = `${Math.floor(mins / 60)}h ago`;
      }

      return {
        location: loc.location,
        checkin_count: parseInt(loc.checkin_count, 10),
        last_checkin: loc.last_checkin,
        last_checkin_ago: lastCheckinAgo,
      };
    });
  }

  // Sync attendees from registrations (creates attendee records for new registrations)
  async syncAttendeesFromRegistrations(eventId: number): Promise<number> {
    // Get registrations that don't have attendee records
    const registrations = await db('event_registrations as r')
      .leftJoin('event_attendees as a', 'r.id', 'a.registration_id')
      .whereNull('a.id')
      .andWhere('r.event_id', eventId)
      .andWhere('r.is_deleted', false)
      .andWhere('r.status', 'completed')
      .select('r.*');

    let created = 0;
    for (const reg of registrations) {
      await this.createAttendeeFromRegistration(
        eventId,
        reg.id,
        reg.ticket_id,
        reg.registrant_name || 'Unknown',
        reg.registrant_email
      );
      created++;
    }

    return created;
  }

  // Create attendee manually (for manual addition)
  async createAttendee(eventId: number, attendeeName: string, attendeeEmail?: string, ticketId?: number): Promise<Attendee> {
    const qr_code_value = this.generateQRCode();

    const [attendee] = await db('event_attendees')
      .insert({
        event_id: eventId,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail || null,
        ticket_id: ticketId || null,
        qr_code_value,
        checkin_status: 'not_checked_in',
      })
      .returning('*');

    return attendee;
  }
}
