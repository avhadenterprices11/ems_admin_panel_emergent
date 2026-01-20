import { ZoomService, ZoomMeetingResponse } from './zoom.service';
import { GoogleMeetService, GoogleMeetResponse } from './google-meet.service';

export interface MeetingRequest {
  platform: 'zoom' | 'google-meet';
  topic: string;
  description?: string;
  start_time: string;      // ISO format
  end_time: string;        // ISO format
  timezone: string;        // IANA timezone
}

export interface MeetingResult {
  platform: string;
  meeting_url: string;
  meeting_id: string | null;
  meeting_password: string | null;
  provider_payload: any;
}

export class MeetingService {
  private zoomService: ZoomService;
  private googleMeetService: GoogleMeetService;

  constructor() {
    this.zoomService = new ZoomService();
    this.googleMeetService = new GoogleMeetService();
  }

  /**
   * Get status of meeting integrations
   */
  getIntegrationStatus(): { zoom: boolean; googleMeet: boolean } {
    return {
      zoom: this.zoomService.isConfigured(),
      googleMeet: this.googleMeetService.isConfigured(),
    };
  }

  /**
   * Create a meeting on the specified platform
   */
  async createMeeting(request: MeetingRequest): Promise<MeetingResult> {
    const { platform, topic, description, start_time, end_time, timezone } = request;

    if (platform === 'zoom') {
      // Calculate duration in minutes for Zoom
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      const durationMinutes = Math.max(
        30, // Minimum 30 minutes
        Math.round((endDate.getTime() - startDate.getTime()) / 60000)
      );

      const result: ZoomMeetingResponse = await this.zoomService.createMeeting({
        topic,
        start_time,
        duration: durationMinutes,
        timezone,
        agenda: description,
      });

      return {
        platform: 'zoom',
        meeting_url: result.join_url,
        meeting_id: result.meeting_id,
        meeting_password: result.password,
        provider_payload: result.provider_payload,
      };
    } else if (platform === 'google-meet') {
      const result: GoogleMeetResponse = await this.googleMeetService.createMeetingLink({
        summary: topic,
        description,
        start: start_time,
        end: end_time,
        timezone,
      });

      return {
        platform: 'google-meet',
        meeting_url: result.meet_link,
        meeting_id: result.calendar_event_id,
        meeting_password: null,
        provider_payload: result.provider_payload,
      };
    } else {
      throw new Error(`Unsupported meeting platform: ${platform}`);
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(platform: string, meetingId: string): Promise<void> {
    if (platform === 'zoom') {
      await this.zoomService.deleteMeeting(meetingId);
    } else if (platform === 'google-meet') {
      await this.googleMeetService.deleteCalendarEvent(meetingId);
    }
  }
}
