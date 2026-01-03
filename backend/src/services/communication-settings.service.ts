import db from '../database/db';

export interface CommunicationSettings {
  id: number;
  event_id: number;
  default_sender_name?: string;
  reply_to_email?: string;
  sms_sender_id?: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  opt_out_enabled: boolean;
  track_opens: boolean;
  track_clicks: boolean;
  unsubscribe_page_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsInput {
  default_sender_name?: string;
  reply_to_email?: string;
  sms_sender_id?: string;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  opt_out_enabled?: boolean;
  track_opens?: boolean;
  track_clicks?: boolean;
  unsubscribe_page_url?: string;
}

export interface SettingsValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class CommunicationSettingsService {
  // Get settings for an event (creates default if not exists)
  async getSettings(eventId: number): Promise<CommunicationSettings> {
    let settings = await db('communication_settings')
      .where('event_id', eventId)
      .first();

    if (!settings) {
      // Create default settings
      [settings] = await db('communication_settings')
        .insert({
          event_id: eventId,
          email_enabled: true,
          sms_enabled: false,
          opt_out_enabled: true,
          track_opens: true,
          track_clicks: true,
        })
        .returning('*');
    }

    return settings;
  }

  // Update settings
  async updateSettings(eventId: number, input: UpdateSettingsInput): Promise<CommunicationSettings> {
    // Ensure settings exist
    await this.getSettings(eventId);

    const updateData: any = { updated_at: db.fn.now() };

    if (input.default_sender_name !== undefined) updateData.default_sender_name = input.default_sender_name;
    if (input.reply_to_email !== undefined) updateData.reply_to_email = input.reply_to_email;
    if (input.sms_sender_id !== undefined) updateData.sms_sender_id = input.sms_sender_id;
    if (input.email_enabled !== undefined) updateData.email_enabled = input.email_enabled;
    if (input.sms_enabled !== undefined) updateData.sms_enabled = input.sms_enabled;
    if (input.quiet_hours_start !== undefined) updateData.quiet_hours_start = input.quiet_hours_start || null;
    if (input.quiet_hours_end !== undefined) updateData.quiet_hours_end = input.quiet_hours_end || null;
    if (input.opt_out_enabled !== undefined) updateData.opt_out_enabled = input.opt_out_enabled;
    if (input.track_opens !== undefined) updateData.track_opens = input.track_opens;
    if (input.track_clicks !== undefined) updateData.track_clicks = input.track_clicks;
    if (input.unsubscribe_page_url !== undefined) updateData.unsubscribe_page_url = input.unsubscribe_page_url;

    const [updated] = await db('communication_settings')
      .where('event_id', eventId)
      .update(updateData)
      .returning('*');

    return updated;
  }

  // Validate settings before campaign send
  async validateSettings(eventId: number, channel: 'email' | 'sms'): Promise<SettingsValidationResult> {
    const settings = await this.getSettings(eventId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (channel === 'email') {
      if (!settings.email_enabled) {
        errors.push('Email channel is disabled for this event');
      }
      if (!settings.default_sender_name) {
        warnings.push('No default sender name configured');
      }
      if (!settings.reply_to_email) {
        warnings.push('No reply-to email configured');
      }
    }

    if (channel === 'sms') {
      if (!settings.sms_enabled) {
        errors.push('SMS channel is disabled for this event');
      }
      if (!settings.sms_sender_id) {
        warnings.push('No SMS sender ID configured');
      }
    }

    // Check quiet hours
    if (settings.quiet_hours_start && settings.quiet_hours_end) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= settings.quiet_hours_start && currentTime <= settings.quiet_hours_end) {
        warnings.push(`Campaign will be delayed due to quiet hours (${settings.quiet_hours_start} - ${settings.quiet_hours_end})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Check if recipient should be excluded (opt-out handling)
  async shouldExcludeRecipient(eventId: number, attendeeEmail: string): Promise<boolean> {
    const settings = await this.getSettings(eventId);
    
    if (!settings.opt_out_enabled) {
      return false;
    }

    // Check if attendee has unsubscribed
    // This would typically check an unsubscribe table
    // For now, we'll return false as the unsubscribe tracking is not yet implemented
    // TODO: Implement unsubscribe tracking table
    return false;
  }

  // Get current quiet hours status
  async isInQuietHours(eventId: number): Promise<{ inQuietHours: boolean; startTime?: string; endTime?: string }> {
    const settings = await this.getSettings(eventId);

    if (!settings.quiet_hours_start || !settings.quiet_hours_end) {
      return { inQuietHours: false };
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const inQuietHours = currentTime >= settings.quiet_hours_start && currentTime <= settings.quiet_hours_end;

    return {
      inQuietHours,
      startTime: settings.quiet_hours_start,
      endTime: settings.quiet_hours_end,
    };
  }

  // Reset settings to default
  async resetSettings(eventId: number): Promise<CommunicationSettings> {
    const [updated] = await db('communication_settings')
      .where('event_id', eventId)
      .update({
        default_sender_name: null,
        reply_to_email: null,
        sms_sender_id: null,
        email_enabled: true,
        sms_enabled: false,
        quiet_hours_start: null,
        quiet_hours_end: null,
        opt_out_enabled: true,
        track_opens: true,
        track_clicks: true,
        unsubscribe_page_url: null,
        updated_at: db.fn.now(),
      })
      .returning('*');

    return updated;
  }
}
