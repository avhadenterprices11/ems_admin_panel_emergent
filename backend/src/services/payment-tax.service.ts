import db from '../database/db';

export interface PaymentTaxSettings {
  id: number;
  event_id: number | null;
  currency: string;
  stripe_enabled: boolean;
  razorpay_enabled: boolean;
  offline_enabled: boolean;
  tax_enabled: boolean;
  tax_name: string;
  tax_percentage: number;
  legal_entity_name: string | null;
  billing_address: string | null;
  tax_id: string | null;
  updated_at: Date;
  updated_by: string | null;
  created_at: Date;
}

export interface UpdatePaymentTaxInput {
  currency?: string;
  stripe_enabled?: boolean;
  razorpay_enabled?: boolean;
  offline_enabled?: boolean;
  tax_enabled?: boolean;
  tax_name?: string;
  tax_percentage?: number;
  legal_entity_name?: string | null;
  billing_address?: string | null;
  tax_id?: string | null;
  updated_by?: string;
}

const DEFAULT_SETTINGS = {
  currency: 'USD',
  stripe_enabled: true,
  razorpay_enabled: false,
  offline_enabled: true,
  tax_enabled: false,
  tax_name: 'VAT',
  tax_percentage: 0,
  legal_entity_name: null,
  billing_address: null,
  tax_id: null,
};

const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'JPY', 'CHF', 'AED'];

export class PaymentTaxService {
  /**
   * Get global default settings (event_id = null)
   */
  async getGlobalSettings(): Promise<PaymentTaxSettings | null> {
    return db('payment_tax_settings').whereNull('event_id').first();
  }

  /**
   * Get payment/tax settings for an event
   * Falls back to global settings if event-specific not found
   */
  async getEventSettings(eventId: number): Promise<PaymentTaxSettings> {
    // Check if event exists
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      throw new Error('Event not found');
    }

    // Try to get event-specific settings
    let settings = await db('payment_tax_settings').where('event_id', eventId).first();
    
    if (settings) {
      return settings;
    }

    // Fall back to global settings
    const globalSettings = await this.getGlobalSettings();
    
    if (globalSettings) {
      // Return global settings but with the event_id context
      return {
        ...globalSettings,
        id: 0, // Indicate this is from global
        event_id: eventId,
      };
    }

    // No global settings either - return defaults
    return {
      id: 0,
      event_id: eventId,
      ...DEFAULT_SETTINGS,
      updated_at: new Date(),
      updated_by: null,
      created_at: new Date(),
    };
  }

  /**
   * Update payment/tax settings for an event (creates if doesn't exist)
   */
  async updateEventSettings(eventId: number, data: UpdatePaymentTaxInput): Promise<PaymentTaxSettings> {
    // Check if event exists
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      throw new Error('Event not found');
    }

    // Validate currency if provided
    if (data.currency && !VALID_CURRENCIES.includes(data.currency)) {
      throw new Error(`Invalid currency. Valid options: ${VALID_CURRENCIES.join(', ')}`);
    }

    // Validate tax percentage if provided
    if (data.tax_percentage !== undefined) {
      if (data.tax_percentage < 0 || data.tax_percentage > 100) {
        throw new Error('Tax percentage must be between 0 and 100');
      }
    }

    // Check if event-specific settings exist
    let settings = await db('payment_tax_settings').where('event_id', eventId).first();

    if (!settings) {
      // Get global settings to use as base for new event settings
      const globalSettings = await this.getGlobalSettings();
      const baseSettings = globalSettings || DEFAULT_SETTINGS;

      // Create new event-specific settings
      const newSettings = {
        event_id: eventId,
        currency: data.currency ?? baseSettings.currency,
        stripe_enabled: data.stripe_enabled ?? baseSettings.stripe_enabled,
        razorpay_enabled: data.razorpay_enabled ?? baseSettings.razorpay_enabled,
        offline_enabled: data.offline_enabled ?? baseSettings.offline_enabled,
        tax_enabled: data.tax_enabled ?? baseSettings.tax_enabled,
        tax_name: data.tax_name ?? baseSettings.tax_name,
        tax_percentage: data.tax_percentage ?? baseSettings.tax_percentage,
        legal_entity_name: data.legal_entity_name ?? baseSettings.legal_entity_name,
        billing_address: data.billing_address ?? baseSettings.billing_address,
        tax_id: data.tax_id ?? baseSettings.tax_id,
        updated_by: data.updated_by || null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [created] = await db('payment_tax_settings')
        .insert(newSettings)
        .returning('*');
      
      return created;
    }

    // Update existing event-specific settings
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.stripe_enabled !== undefined) updateData.stripe_enabled = data.stripe_enabled;
    if (data.razorpay_enabled !== undefined) updateData.razorpay_enabled = data.razorpay_enabled;
    if (data.offline_enabled !== undefined) updateData.offline_enabled = data.offline_enabled;
    if (data.tax_enabled !== undefined) updateData.tax_enabled = data.tax_enabled;
    if (data.tax_name !== undefined) updateData.tax_name = data.tax_name;
    if (data.tax_percentage !== undefined) updateData.tax_percentage = data.tax_percentage;
    if (data.legal_entity_name !== undefined) updateData.legal_entity_name = data.legal_entity_name;
    if (data.billing_address !== undefined) updateData.billing_address = data.billing_address;
    if (data.tax_id !== undefined) updateData.tax_id = data.tax_id;
    if (data.updated_by !== undefined) updateData.updated_by = data.updated_by;

    const [updated] = await db('payment_tax_settings')
      .where('event_id', eventId)
      .update(updateData)
      .returning('*');

    return updated;
  }

  /**
   * Update global default settings (for future use)
   */
  async updateGlobalSettings(data: UpdatePaymentTaxInput): Promise<PaymentTaxSettings> {
    // Validate currency if provided
    if (data.currency && !VALID_CURRENCIES.includes(data.currency)) {
      throw new Error(`Invalid currency. Valid options: ${VALID_CURRENCIES.join(', ')}`);
    }

    // Validate tax percentage if provided
    if (data.tax_percentage !== undefined) {
      if (data.tax_percentage < 0 || data.tax_percentage > 100) {
        throw new Error('Tax percentage must be between 0 and 100');
      }
    }

    let globalSettings = await this.getGlobalSettings();

    if (!globalSettings) {
      // Create global settings
      const newSettings = {
        event_id: null,
        ...DEFAULT_SETTINGS,
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [created] = await db('payment_tax_settings')
        .insert(newSettings)
        .returning('*');
      
      return created;
    }

    // Update existing global settings
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.stripe_enabled !== undefined) updateData.stripe_enabled = data.stripe_enabled;
    if (data.razorpay_enabled !== undefined) updateData.razorpay_enabled = data.razorpay_enabled;
    if (data.offline_enabled !== undefined) updateData.offline_enabled = data.offline_enabled;
    if (data.tax_enabled !== undefined) updateData.tax_enabled = data.tax_enabled;
    if (data.tax_name !== undefined) updateData.tax_name = data.tax_name;
    if (data.tax_percentage !== undefined) updateData.tax_percentage = data.tax_percentage;
    if (data.legal_entity_name !== undefined) updateData.legal_entity_name = data.legal_entity_name;
    if (data.billing_address !== undefined) updateData.billing_address = data.billing_address;
    if (data.tax_id !== undefined) updateData.tax_id = data.tax_id;
    if (data.updated_by !== undefined) updateData.updated_by = data.updated_by;

    const [updated] = await db('payment_tax_settings')
      .whereNull('event_id')
      .update(updateData)
      .returning('*');

    return updated;
  }

  /**
   * Reset event settings to global defaults (deletes event-specific record)
   */
  async resetEventSettings(eventId: number): Promise<PaymentTaxSettings> {
    // Check if event exists
    const event = await db('events').where('id', eventId).first();
    if (!event) {
      throw new Error('Event not found');
    }

    // Delete event-specific settings if exists
    await db('payment_tax_settings').where('event_id', eventId).delete();

    // Return global settings (or defaults)
    return this.getEventSettings(eventId);
  }
}
