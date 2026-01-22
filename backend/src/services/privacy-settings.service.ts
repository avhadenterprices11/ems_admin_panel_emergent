import db from '../database/db';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PrivacySettings {
  id: number;
  event_id: number | null;
  gdpr_consent_enabled: boolean;
  privacy_policy_url: string | null;
  custom_consent_text: string | null;
  data_retention_days: string; // '90', '180', '365', 'forever'
  dpa_signed: boolean;
  dpa_signed_at: string | null;
  cookie_consent_enabled: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Virtual field to indicate if this is inherited from global
  is_global_default?: boolean;
}

export interface UpsertPrivacySettingsInput {
  event_id?: number | null;
  gdpr_consent_enabled?: boolean;
  privacy_policy_url?: string | null;
  custom_consent_text?: string | null;
  data_retention_days?: string;
  dpa_signed?: boolean;
  cookie_consent_enabled?: boolean;
}

// ============================================================================
// PRIVACY SETTINGS SERVICE
// ============================================================================

export class PrivacySettingsService {
  /**
   * Get privacy settings with resolution: event-specific → global default
   * @param eventId - Optional event ID for event-specific settings
   * @returns The resolved settings (event-level or global default)
   */
  async getSettings(eventId?: number | null): Promise<PrivacySettings | null> {
    // Try event-specific settings first
    if (eventId) {
      const eventSettings = await db('privacy_settings')
        .where('event_id', eventId)
        .where('is_deleted', false)
        .first();

      if (eventSettings) {
        return { ...eventSettings, is_global_default: false };
      }
    }

    // Fall back to global default (event_id = null)
    const globalSettings = await db('privacy_settings')
      .whereNull('event_id')
      .where('is_deleted', false)
      .first();

    if (globalSettings) {
      return { ...globalSettings, is_global_default: true };
    }

    return null;
  }

  /**
   * Get event-specific settings only (without fallback)
   * Used to check if event has custom settings
   */
  async getEventSettings(eventId: number): Promise<PrivacySettings | null> {
    const settings = await db('privacy_settings')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .first();

    return settings ? { ...settings, is_global_default: false } : null;
  }

  /**
   * Get global default settings
   */
  async getGlobalSettings(): Promise<PrivacySettings | null> {
    const settings = await db('privacy_settings')
      .whereNull('event_id')
      .where('is_deleted', false)
      .first();

    return settings ? { ...settings, is_global_default: true } : null;
  }

  /**
   * Create or update privacy settings for an event
   */
  async upsertEventSettings(eventId: number, input: UpsertPrivacySettingsInput): Promise<PrivacySettings> {
    // Check if event-specific settings exist (including soft-deleted ones due to unique constraint)
    const existing = await db('privacy_settings')
      .where('event_id', eventId)
      .first();

    // Get global defaults to use as base for new/restored records
    const globalDefaults = await this.getGlobalSettings();

    if (existing) {
      // Update existing record (restore if soft-deleted)
      const updateData: any = { 
        updated_at: db.fn.now(),
        is_deleted: false  // Restore if it was soft-deleted
      };
      
      if (input.gdpr_consent_enabled !== undefined) {
        updateData.gdpr_consent_enabled = input.gdpr_consent_enabled;
      }
      if (input.privacy_policy_url !== undefined) {
        updateData.privacy_policy_url = input.privacy_policy_url;
      }
      if (input.custom_consent_text !== undefined) {
        updateData.custom_consent_text = input.custom_consent_text;
      }
      if (input.data_retention_days !== undefined) {
        updateData.data_retention_days = input.data_retention_days;
      }
      if (input.dpa_signed !== undefined) {
        updateData.dpa_signed = input.dpa_signed;
        if (input.dpa_signed) {
          updateData.dpa_signed_at = db.fn.now();
        }
      }
      if (input.cookie_consent_enabled !== undefined) {
        updateData.cookie_consent_enabled = input.cookie_consent_enabled;
      }

      const [updated] = await db('privacy_settings')
        .where('id', existing.id)
        .update(updateData)
        .returning('*');

      return { ...updated, is_global_default: false };
    }

    // Create new event-specific settings (only if no record exists at all)
    const [created] = await db('privacy_settings')
      .insert({
        event_id: eventId,
        gdpr_consent_enabled: input.gdpr_consent_enabled ?? globalDefaults?.gdpr_consent_enabled ?? false,
        privacy_policy_url: input.privacy_policy_url ?? globalDefaults?.privacy_policy_url ?? null,
        custom_consent_text: input.custom_consent_text ?? globalDefaults?.custom_consent_text ?? null,
        data_retention_days: input.data_retention_days ?? globalDefaults?.data_retention_days ?? '365',
        dpa_signed: input.dpa_signed ?? false,
        dpa_signed_at: input.dpa_signed ? db.fn.now() : null,
        cookie_consent_enabled: input.cookie_consent_enabled ?? globalDefaults?.cookie_consent_enabled ?? false
      })
      .returning('*');

    return { ...created, is_global_default: false };
  }

  /**
   * Update global default settings
   */
  async updateGlobalSettings(input: UpsertPrivacySettingsInput): Promise<PrivacySettings> {
    const existing = await db('privacy_settings')
      .whereNull('event_id')
      .where('is_deleted', false)
      .first();

    const updateData: any = { updated_at: db.fn.now() };
    
    if (input.gdpr_consent_enabled !== undefined) {
      updateData.gdpr_consent_enabled = input.gdpr_consent_enabled;
    }
    if (input.privacy_policy_url !== undefined) {
      updateData.privacy_policy_url = input.privacy_policy_url;
    }
    if (input.custom_consent_text !== undefined) {
      updateData.custom_consent_text = input.custom_consent_text;
    }
    if (input.data_retention_days !== undefined) {
      updateData.data_retention_days = input.data_retention_days;
    }
    if (input.dpa_signed !== undefined) {
      updateData.dpa_signed = input.dpa_signed;
      if (input.dpa_signed) {
        updateData.dpa_signed_at = db.fn.now();
      }
    }
    if (input.cookie_consent_enabled !== undefined) {
      updateData.cookie_consent_enabled = input.cookie_consent_enabled;
    }

    if (existing) {
      const [updated] = await db('privacy_settings')
        .where('id', existing.id)
        .update(updateData)
        .returning('*');

      return { ...updated, is_global_default: true };
    }

    // Create global if doesn't exist
    const [created] = await db('privacy_settings')
      .insert({
        event_id: null,
        gdpr_consent_enabled: input.gdpr_consent_enabled ?? false,
        privacy_policy_url: input.privacy_policy_url ?? null,
        custom_consent_text: input.custom_consent_text ?? null,
        data_retention_days: input.data_retention_days ?? '365',
        dpa_signed: input.dpa_signed ?? false,
        cookie_consent_enabled: input.cookie_consent_enabled ?? false
      })
      .returning('*');

    return { ...created, is_global_default: true };
  }

  /**
   * Reset event settings to use global defaults
   */
  async resetToGlobal(eventId: number): Promise<PrivacySettings | null> {
    await db('privacy_settings')
      .where('event_id', eventId)
      .update({ is_deleted: true, updated_at: db.fn.now() });

    return this.getGlobalSettings();
  }

  /**
   * Check if GDPR consent is required for an event
   */
  async isGdprRequired(eventId?: number): Promise<boolean> {
    const settings = await this.getSettings(eventId);
    return settings?.gdpr_consent_enabled ?? false;
  }

  /**
   * Get privacy policy URL for an event
   */
  async getPrivacyPolicyUrl(eventId?: number): Promise<string | null> {
    const settings = await this.getSettings(eventId);
    return settings?.privacy_policy_url ?? null;
  }

  /**
   * Get data retention days for an event
   */
  async getDataRetentionDays(eventId?: number): Promise<string> {
    const settings = await this.getSettings(eventId);
    return settings?.data_retention_days ?? '365';
  }
}

// ============================================================================
// DATA EXPORT SERVICE
// ============================================================================

export class DataExportService {
  /**
   * Export full event data as CSV
   */
  async exportEventDataCSV(eventId: number): Promise<{ filename: string; data: string }> {
    // Fetch all registrations
    const registrations = await db('event_registrations')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .select('*');

    // Fetch all attendees
    const attendees = await db('event_attendees')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .select('*');

    // Fetch all issued tickets
    const tickets = await db('issued_tickets')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .select('*');

    // Fetch all bookings
    const bookings = await db('bookings')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .select('*');

    // Build CSV content
    const lines: string[] = [];

    // Registrations section
    lines.push('=== REGISTRATIONS ===');
    if (registrations.length > 0) {
      const regHeaders = Object.keys(registrations[0]).filter(k => !k.includes('password'));
      lines.push(regHeaders.join(','));
      registrations.forEach(reg => {
        const values = regHeaders.map(h => {
          const val = reg[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
          return String(val).replace(/,/g, ';').replace(/\n/g, ' ');
        });
        lines.push(values.join(','));
      });
    } else {
      lines.push('No registrations found');
    }

    lines.push('');
    lines.push('=== ATTENDEES ===');
    if (attendees.length > 0) {
      const attHeaders = Object.keys(attendees[0]);
      lines.push(attHeaders.join(','));
      attendees.forEach(att => {
        const values = attHeaders.map(h => {
          const val = att[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
          return String(val).replace(/,/g, ';').replace(/\n/g, ' ');
        });
        lines.push(values.join(','));
      });
    } else {
      lines.push('No attendees found');
    }

    lines.push('');
    lines.push('=== ISSUED TICKETS ===');
    if (tickets.length > 0) {
      const ticketHeaders = Object.keys(tickets[0]);
      lines.push(ticketHeaders.join(','));
      tickets.forEach(ticket => {
        const values = ticketHeaders.map(h => {
          const val = ticket[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
          return String(val).replace(/,/g, ';').replace(/\n/g, ' ');
        });
        lines.push(values.join(','));
      });
    } else {
      lines.push('No issued tickets found');
    }

    lines.push('');
    lines.push('=== BOOKINGS ===');
    if (bookings.length > 0) {
      const bookingHeaders = Object.keys(bookings[0]);
      lines.push(bookingHeaders.join(','));
      bookings.forEach(booking => {
        const values = bookingHeaders.map(h => {
          const val = booking[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
          return String(val).replace(/,/g, ';').replace(/\n/g, ' ');
        });
        lines.push(values.join(','));
      });
    } else {
      lines.push('No bookings found');
    }

    const csv = lines.join('\n');
    const filename = `event_${eventId}_data_export_${new Date().toISOString().split('T')[0]}.csv`;

    return { filename, data: csv };
  }
}
