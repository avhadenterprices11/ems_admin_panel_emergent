import axios from 'axios';

export class ZoomService {
  private apiKey: string;
  private apiSecret: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY || '';
    this.apiSecret = process.env.ZOOM_API_SECRET || '';
    this.clientId = process.env.ZOOM_CLIENT_ID || '';
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET || '';
  }

  async createMeeting(eventData: {
    topic: string;
    start_time: string;
    duration: number;
    timezone: string;
    agenda?: string;
  }): Promise<string> {
    try {
      // Get OAuth token
      const tokenResponse = await axios.post(
        'https://zoom.us/oauth/token',
        null,
        {
          params: {
            grant_type: 'account_credentials',
            account_id: process.env.ZOOM_ACCOUNT_ID,
          },
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

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
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 2, // No registration required
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return meetingResponse.data.join_url;
    } catch (error: any) {
      console.error('Zoom API error:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }
}
