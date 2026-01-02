import { google } from 'googleapis';

export class GoogleMeetService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials if refresh token is available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }
  }

  async createMeetingLink(eventData: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    timezone: string;
  }): Promise<string> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: eventData.summary,
        description: eventData.description || '',
        start: {
          dateTime: eventData.start,
          timeZone: eventData.timezone,
        },
        end: {
          dateTime: eventData.end,
          timeZone: eventData.timezone,
        },
        conferenceData: {
          createRequest: {
            requestId: `event-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        attendees: [],
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.hangoutLink;
      
      if (!meetLink) {
        throw new Error('Failed to generate Google Meet link');
      }

      return meetLink;
    } catch (error: any) {
      console.error('Google Meet API error:', error.message);
      throw new Error('Failed to create Google Meet link');
    }
  }
}
