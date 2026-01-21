import db from '../database/db';

export interface EventBranding {
  id: number;
  event_id: number;
  light_logo_url: string | null;
  dark_logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  updated_at: Date;
  updated_by: string | null;
  created_at: Date;
}

export interface UpdateBrandingInput {
  light_logo_url?: string | null;
  dark_logo_url?: string | null;
  cover_image_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  updated_by?: string;
}

const DEFAULT_BRANDING = {
  light_logo_url: null,
  dark_logo_url: null,
  cover_image_url: null,
  primary_color: '#0f172b',
  secondary_color: '#3b82f6',
  font_family: 'inter',
};

export class EventBrandingService {
  /**
   * Get branding for an event. Creates default if doesn't exist.
   */
  async getBranding(eventId: number): Promise<EventBranding> {
    // Check if event exists
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      throw new Error('Event not found');
    }

    // Get existing branding or create default
    let branding = await db('event_branding').where('event_id', eventId).first();
    
    if (!branding) {
      // Create default branding for this event
      const [newBranding] = await db('event_branding')
        .insert({
          event_id: eventId,
          ...DEFAULT_BRANDING,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      branding = newBranding;
    }

    return branding;
  }

  /**
   * Update branding for an event
   */
  async updateBranding(eventId: number, data: UpdateBrandingInput): Promise<EventBranding> {
    // Check if event exists
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      throw new Error('Event not found');
    }

    // Get or create branding
    let branding = await db('event_branding').where('event_id', eventId).first();
    
    if (!branding) {
      // Create new branding with provided data
      const [newBranding] = await db('event_branding')
        .insert({
          event_id: eventId,
          ...DEFAULT_BRANDING,
          ...data,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      return newBranding;
    }

    // Update existing branding
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.light_logo_url !== undefined) updateData.light_logo_url = data.light_logo_url;
    if (data.dark_logo_url !== undefined) updateData.dark_logo_url = data.dark_logo_url;
    if (data.cover_image_url !== undefined) updateData.cover_image_url = data.cover_image_url;
    if (data.primary_color !== undefined) updateData.primary_color = data.primary_color;
    if (data.secondary_color !== undefined) updateData.secondary_color = data.secondary_color;
    if (data.font_family !== undefined) updateData.font_family = data.font_family;
    if (data.updated_by !== undefined) updateData.updated_by = data.updated_by;

    const [updated] = await db('event_branding')
      .where('event_id', eventId)
      .update(updateData)
      .returning('*');

    return updated;
  }

  /**
   * Reset branding to defaults for an event
   */
  async resetBranding(eventId: number, updatedBy?: string): Promise<EventBranding> {
    // Check if event exists
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      throw new Error('Event not found');
    }

    // Get or create branding
    let branding = await db('event_branding').where('event_id', eventId).first();
    
    if (!branding) {
      // Create default branding
      const [newBranding] = await db('event_branding')
        .insert({
          event_id: eventId,
          ...DEFAULT_BRANDING,
          updated_by: updatedBy || null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      return newBranding;
    }

    // Reset to defaults
    const [updated] = await db('event_branding')
      .where('event_id', eventId)
      .update({
        ...DEFAULT_BRANDING,
        updated_by: updatedBy || null,
        updated_at: new Date(),
      })
      .returning('*');

    return updated;
  }
}
