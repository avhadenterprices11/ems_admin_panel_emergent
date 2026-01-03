import { Request, Response } from 'express';
import { CommunicationSettingsService, UpdateSettingsInput } from '../services/communication-settings.service';

const settingsService = new CommunicationSettingsService();

export class CommunicationSettingsController {
  // Get settings for an event
  async getSettings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const settings = await settingsService.getSettings(eventId);
      return res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ message: 'Failed to fetch settings' });
    }
  }

  // Update settings
  async updateSettings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const {
        default_sender_name,
        reply_to_email,
        sms_sender_id,
        email_enabled,
        sms_enabled,
        quiet_hours_start,
        quiet_hours_end,
        opt_out_enabled,
        track_opens,
        track_clicks,
        unsubscribe_page_url,
      } = req.body;

      // Validate email format if provided
      if (reply_to_email && !isValidEmail(reply_to_email)) {
        return res.status(400).json({ message: 'Invalid reply-to email format' });
      }

      // Validate quiet hours format if provided
      if (quiet_hours_start && !isValidTimeFormat(quiet_hours_start)) {
        return res.status(400).json({ message: 'Invalid quiet hours start time format (use HH:MM)' });
      }
      if (quiet_hours_end && !isValidTimeFormat(quiet_hours_end)) {
        return res.status(400).json({ message: 'Invalid quiet hours end time format (use HH:MM)' });
      }

      const input: UpdateSettingsInput = {
        default_sender_name,
        reply_to_email,
        sms_sender_id,
        email_enabled,
        sms_enabled,
        quiet_hours_start,
        quiet_hours_end,
        opt_out_enabled,
        track_opens,
        track_clicks,
        unsubscribe_page_url,
      };

      const settings = await settingsService.updateSettings(eventId, input);
      return res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return res.status(500).json({ message: 'Failed to update settings' });
    }
  }

  // Validate settings before campaign send
  async validateSettings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { channel } = req.body;
      if (!channel || !['email', 'sms'].includes(channel)) {
        return res.status(400).json({ message: 'Channel must be "email" or "sms"' });
      }

      const result = await settingsService.validateSettings(eventId, channel);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error validating settings:', error);
      return res.status(500).json({ message: 'Failed to validate settings' });
    }
  }

  // Check quiet hours status
  async getQuietHoursStatus(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const result = await settingsService.isInQuietHours(eventId);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error checking quiet hours:', error);
      return res.status(500).json({ message: 'Failed to check quiet hours' });
    }
  }

  // Reset settings to default
  async resetSettings(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const settings = await settingsService.resetSettings(eventId);
      return res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error resetting settings:', error);
      return res.status(500).json({ message: 'Failed to reset settings' });
    }
  }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}
