import { Request, Response } from 'express';
import { MeetingService } from '../services/meeting.service';

export class MeetingController {
  private meetingService: MeetingService;

  constructor() {
    this.meetingService = new MeetingService();
  }

  /**
   * GET /api/meetings/status
   * Check which meeting integrations are configured
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.meetingService.getIntegrationStatus();
      res.status(200).json(status);
    } catch (error: any) {
      console.error('Error getting meeting status:', error);
      res.status(500).json({ message: 'Failed to get meeting integration status' });
    }
  }

  /**
   * POST /api/meetings/generate
   * Generate a meeting link for a virtual event
   */
  async generateMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { platform, topic, description, start_time, end_time, timezone } = req.body;

      // Validate required fields
      if (!platform) {
        res.status(400).json({ message: 'Meeting platform is required' });
        return;
      }
      if (!['zoom', 'google-meet'].includes(platform)) {
        res.status(400).json({ message: 'Invalid meeting platform. Must be "zoom" or "google-meet"' });
        return;
      }
      if (!topic) {
        res.status(400).json({ message: 'Meeting topic is required' });
        return;
      }
      if (!start_time) {
        res.status(400).json({ message: 'Start time is required' });
        return;
      }
      if (!end_time) {
        res.status(400).json({ message: 'End time is required' });
        return;
      }
      if (!timezone) {
        res.status(400).json({ message: 'Timezone is required' });
        return;
      }

      // Check if the platform is configured
      const integrationStatus = this.meetingService.getIntegrationStatus();
      if (platform === 'zoom' && !integrationStatus.zoom) {
        res.status(400).json({ 
          message: 'Zoom integration is not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET environment variables.',
          configured: false
        });
        return;
      }
      if (platform === 'google-meet' && !integrationStatus.googleMeet) {
        res.status(400).json({ 
          message: 'Google Meet integration is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables.',
          configured: false
        });
        return;
      }

      // Validate dates
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
        return;
      }
      if (endDate <= startDate) {
        res.status(400).json({ message: 'End time must be after start time' });
        return;
      }

      const result = await this.meetingService.createMeeting({
        platform,
        topic,
        description,
        start_time,
        end_time,
        timezone,
      });

      res.status(201).json({
        success: true,
        meeting_url: result.meeting_url,
        meeting_id: result.meeting_id,
        meeting_password: result.meeting_password,
        platform: result.platform,
        provider_payload: result.provider_payload,
      });
    } catch (error: any) {
      console.error('Error generating meeting:', error);
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to generate meeting link',
      });
    }
  }

  /**
   * DELETE /api/meetings/:platform/:meetingId
   * Delete a meeting
   */
  async deleteMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { platform, meetingId } = req.params;

      if (!platform || !meetingId) {
        res.status(400).json({ message: 'Platform and meeting ID are required' });
        return;
      }

      await this.meetingService.deleteMeeting(platform, meetingId);
      res.status(200).json({ success: true, message: 'Meeting deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      res.status(500).json({ message: error.message || 'Failed to delete meeting' });
    }
  }
}
