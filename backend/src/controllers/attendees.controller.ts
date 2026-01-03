import { Request, Response } from 'express';
import { AttendeesService, QRCheckinInput } from '../services/attendees.service';

const attendeesService = new AttendeesService();

export class AttendeesController {
  // Get attendees list
  async getAttendees(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { checkin_status, search, page, limit } = req.query;

      const result = await attendeesService.getAttendeesByEventId({
        event_id: eventId,
        checkin_status: checkin_status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching attendees:', error);
      return res.status(500).json({ message: 'Failed to fetch attendees' });
    }
  }

  // Get single attendee
  async getAttendeeById(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const attendeeId = parseInt(req.params.attendeeId, 10);

      if (isNaN(eventId) || isNaN(attendeeId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const attendee = await attendeesService.getAttendeeById(eventId, attendeeId);

      if (!attendee) {
        return res.status(404).json({ message: 'Attendee not found' });
      }

      return res.status(200).json(attendee);
    } catch (error: any) {
      console.error('Error fetching attendee:', error);
      return res.status(500).json({ message: 'Failed to fetch attendee' });
    }
  }

  // Get check-in metrics
  async getCheckinMetrics(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const metrics = await attendeesService.getCheckinMetrics(eventId);
      return res.status(200).json(metrics);
    } catch (error: any) {
      console.error('Error fetching check-in metrics:', error);
      return res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  }

  // QR Check-in
  async qrCheckin(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { qr_code, device_id, device_name, location } = req.body;

      if (!qr_code) {
        return res.status(400).json({ message: 'QR code is required' });
      }

      const input: QRCheckinInput = {
        event_id: eventId,
        qr_code,
        device_id: device_id ? parseInt(device_id, 10) : undefined,
        device_name,
        location,
      };

      const result = await attendeesService.qrCheckin(input);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error processing QR check-in:', error);
      return res.status(500).json({ message: 'Failed to process check-in' });
    }
  }

  // Manual Check-in
  async manualCheckin(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const attendeeId = parseInt(req.params.attendeeId, 10);

      if (isNaN(eventId) || isNaN(attendeeId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const { location } = req.body;

      const result = await attendeesService.manualCheckin(eventId, attendeeId, location);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error processing manual check-in:', error);
      return res.status(500).json({ message: 'Failed to process check-in' });
    }
  }

  // Undo Check-in
  async undoCheckin(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const attendeeId = parseInt(req.params.attendeeId, 10);

      if (isNaN(eventId) || isNaN(attendeeId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const result = await attendeesService.undoCheckin(eventId, attendeeId);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error undoing check-in:', error);
      return res.status(500).json({ message: 'Failed to undo check-in' });
    }
  }

  // Get active devices
  async getActiveDevices(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const devices = await attendeesService.getActiveDevices(eventId);
      return res.status(200).json(devices);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      return res.status(500).json({ message: 'Failed to fetch devices' });
    }
  }

  // Get location stats
  async getLocationStats(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const locations = await attendeesService.getLocationStats(eventId);
      return res.status(200).json(locations);
    } catch (error: any) {
      console.error('Error fetching location stats:', error);
      return res.status(500).json({ message: 'Failed to fetch location stats' });
    }
  }

  // Sync attendees from registrations
  async syncAttendees(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const count = await attendeesService.syncAttendeesFromRegistrations(eventId);
      return res.status(200).json({ message: `Synced ${count} attendees from registrations`, count });
    } catch (error: any) {
      console.error('Error syncing attendees:', error);
      return res.status(500).json({ message: 'Failed to sync attendees' });
    }
  }

  // Update device status
  async updateDeviceStatus(req: Request, res: Response) {
    try {
      const deviceId = parseInt(req.params.deviceId, 10);
      if (isNaN(deviceId)) {
        return res.status(400).json({ message: 'Invalid device ID' });
      }

      const { status, battery_level } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const device = await attendeesService.updateDeviceStatus(deviceId, status, battery_level);
      return res.status(200).json(device);
    } catch (error: any) {
      console.error('Error updating device status:', error);
      return res.status(500).json({ message: 'Failed to update device status' });
    }
  }

  // Create attendee manually
  async createAttendee(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { attendee_name, attendee_email, ticket_id } = req.body;

      if (!attendee_name || !attendee_name.trim()) {
        return res.status(400).json({ message: 'Attendee name is required' });
      }

      const attendee = await attendeesService.createAttendee(
        eventId,
        attendee_name.trim(),
        attendee_email?.trim(),
        ticket_id ? parseInt(ticket_id, 10) : undefined
      );

      return res.status(201).json(attendee);
    } catch (error: any) {
      console.error('Error creating attendee:', error);
      return res.status(500).json({ message: 'Failed to create attendee' });
    }
  }
}
