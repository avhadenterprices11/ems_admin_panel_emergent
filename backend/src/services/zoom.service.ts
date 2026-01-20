import axios from 'axios';

export interface ZoomMeetingResponse {
  join_url: string;
  meeting_id: string;
  password: string;
  start_url: string;
  provider_payload: any;
}

export class ZoomService {
  private clientId: string;
  private clientSecret: string;
  private accountId: string;

  constructor() {
    this.clientId = process.env.ZOOM_CLIENT_ID || '';
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET || '';
    this.accountId = process.env.ZOOM_ACCOUNT_ID || '';
  }

  /**
   * Check if Zoom credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.accountId);
  }

  /**
   * Get OAuth access token using Server-to-Server OAuth
   */
  private async getAccessToken(): Promise<string> {
    const tokenResponse = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'account_credentials',
          account_id: this.accountId,
        },
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      }
    );

    return tokenResponse.data.access_token;
  }

  /**
   * Create a Zoom meeting and return full details
   */
  async createMeeting(eventData: {
    topic: string;
    start_time: string;  // ISO format date string
    duration: number;    // Duration in minutes
    timezone: string;    // IANA timezone string
    agenda?: string;
  }): Promise<ZoomMeetingResponse> {
    if (!this.isConfigured()) {
      throw new Error('Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET environment variables.');
    }

    try {
      const accessToken = await this.getAccessToken();

      // Create meeting
      const meetingResponse = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: eventData.topic,
          type: 2, // Scheduled meeting
          start_time: eventData.start_time,
          duration: eventData.duration,
          timezone: eventData.timezone,
          agenda: eventData.agenda || '',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: true,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 2, // No registration required
            audio: 'both',
            auto_recording: 'none',
            waiting_room: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = meetingResponse.data;

      return {
        join_url: data.join_url,
        meeting_id: String(data.id),
        password: data.password || '',
        start_url: data.start_url,
        provider_payload: data,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Zoom API error:', errorMessage, error.response?.data);
      throw new Error(`Failed to create Zoom meeting: ${errorMessage}`);
    }
  }

  /**
   * Delete a Zoom meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Zoom credentials not configured');
    }

    try {
      const accessToken = await this.getAccessToken();

      await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error: any) {
      console.error('Zoom delete meeting error:', error.response?.data || error.message);
      throw new Error('Failed to delete Zoom meeting');
    }
  }
}
