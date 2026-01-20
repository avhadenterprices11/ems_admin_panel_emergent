import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

export interface GoogleMeetResponse {
  meet_link: string;
  calendar_event_id: string;
  provider_payload: any;
}

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

  /**
   * Check if Google credentials are configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    );
  }

  /**
   * Create a Google Calendar event with Google Meet link
   */
  async createMeetingLink(eventData: {
    summary: string;       // Event title
    description?: string;
    start: string;         // ISO format date string
    end: string;           // ISO format date string
    timezone: string;      // IANA timezone string
  }): Promise<GoogleMeetResponse> {
    if (!this.isConfigured()) {
      throw new Error('Google API credentials not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables.');
    }

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
            requestId: uuidv4(),
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
        throw new Error('Failed to generate Google Meet link - no hangoutLink in response');
      }

      return {
        meet_link: meetLink,
        calendar_event_id: response.data.id || '',
        provider_payload: response.data,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      console.error('Google Meet API error:', errorMessage, error.response?.data);
      throw new Error(`Failed to create Google Meet link: ${errorMessage}`);
    }
  }

  /**
   * Delete a Google Calendar event (and its associated Meet link)
   */
  async deleteCalendarEvent(eventId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Google API credentials not configured');
    }

    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error: any) {
      console.error('Google Calendar delete error:', error.message);
      throw new Error('Failed to delete Google Calendar event');
    }
  }
}
