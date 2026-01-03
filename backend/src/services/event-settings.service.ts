import db from '../database/db';

export interface EventSettings {
  id: number;
  event_id: number;
  // Tax & Fees
  pass_fees_to_attendees: boolean;
  charge_tax: boolean;
  tax_type?: string;
  tax_rate?: number;
  // Refund Policy
  refund_policy: string;
  refund_deadline_days?: number;
  refund_percentage?: number;
  // Ticket Sales Rules
  allow_transfers: boolean;
  allow_cancellations: boolean;
  lock_changes_after_event_start: boolean;
  // Ticket Visibility Rules
  hide_sold_out_tickets: boolean;
  auto_hide_past_tickets: boolean;
  // Registration Approval
  approval_mode: string;
  pending_approval_expiry_hours?: number;
  // Confirmation & Invoices
  auto_send_confirmation: boolean;
  attach_invoice: boolean;
  show_tax_breakdown: boolean;
  // Capacity Rules
  stop_sales_when_full: boolean;
  allow_admin_overselling: boolean;
  auto_enable_waitlist: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateEventSettingsDTO {
  // Tax & Fees
  pass_fees_to_attendees?: boolean;
  charge_tax?: boolean;
  tax_type?: string;
  tax_rate?: number;
  // Refund Policy
  refund_policy?: string;
  refund_deadline_days?: number;
  refund_percentage?: number;
  // Ticket Sales Rules
  allow_transfers?: boolean;
  allow_cancellations?: boolean;
  lock_changes_after_event_start?: boolean;
  // Ticket Visibility Rules
  hide_sold_out_tickets?: boolean;
  auto_hide_past_tickets?: boolean;
  // Registration Approval
  approval_mode?: string;
  pending_approval_expiry_hours?: number;
  // Confirmation & Invoices
  auto_send_confirmation?: boolean;
  attach_invoice?: boolean;
  show_tax_breakdown?: boolean;
  // Capacity Rules
  stop_sales_when_full?: boolean;
  allow_admin_overselling?: boolean;
  auto_enable_waitlist?: boolean;
}

export class EventSettingsService {
  /**
   * Get event settings by event ID
   */
  async getEventSettings(eventId: number): Promise<EventSettings> {
    let settings = await db<EventSettings>('event_settings')
      .where('event_id', eventId)
      .first();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.createDefaultSettings(eventId);
    }

    return settings;
  }

  /**
   * Create default settings for an event
   */
  async createDefaultSettings(eventId: number): Promise<EventSettings> {
    // Validate event exists
    const event = await db('events')
      .where('id', eventId)
      .where('deleted_at', null)
      .first();
    
    if (!event) {
      throw new Error('Event not found');
    }

    const defaultSettings = {
      event_id: eventId,
      // Tax & Fees
      pass_fees_to_attendees: false,
      charge_tax: false,
      tax_type: null,
      tax_rate: null,
      // Refund Policy
      refund_policy: 'no_refunds',
      refund_deadline_days: null,
      refund_percentage: null,
      // Ticket Sales Rules
      allow_transfers: false,
      allow_cancellations: false,
      lock_changes_after_event_start: true,
      // Ticket Visibility Rules
      hide_sold_out_tickets: false,
      auto_hide_past_tickets: true,
      // Registration Approval
      approval_mode: 'auto',
      pending_approval_expiry_hours: null,
      // Confirmation & Invoices
      auto_send_confirmation: true,
      attach_invoice: false,
      show_tax_breakdown: false,
      // Capacity Rules
      stop_sales_when_full: true,
      allow_admin_overselling: false,
      auto_enable_waitlist: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [settings] = await db<EventSettings>('event_settings')
      .insert(defaultSettings)
      .returning('*');

    return settings;
  }

  /**
   * Update event settings
   */
  async updateEventSettings(eventId: number, data: UpdateEventSettingsDTO): Promise<EventSettings> {
    // Ensure settings exist
    let settings = await this.getEventSettings(eventId);

    const updateData: any = {
      updated_at: new Date(),
    };

    // Tax & Fees
    if (data.pass_fees_to_attendees !== undefined) updateData.pass_fees_to_attendees = data.pass_fees_to_attendees;
    if (data.charge_tax !== undefined) updateData.charge_tax = data.charge_tax;
    if (data.tax_type !== undefined) updateData.tax_type = data.tax_type;
    if (data.tax_rate !== undefined) updateData.tax_rate = data.tax_rate;
    
    // Refund Policy
    if (data.refund_policy !== undefined) updateData.refund_policy = data.refund_policy;
    if (data.refund_deadline_days !== undefined) updateData.refund_deadline_days = data.refund_deadline_days;
    if (data.refund_percentage !== undefined) updateData.refund_percentage = data.refund_percentage;
    
    // Ticket Sales Rules
    if (data.allow_transfers !== undefined) updateData.allow_transfers = data.allow_transfers;
    if (data.allow_cancellations !== undefined) updateData.allow_cancellations = data.allow_cancellations;
    if (data.lock_changes_after_event_start !== undefined) updateData.lock_changes_after_event_start = data.lock_changes_after_event_start;
    
    // Ticket Visibility Rules
    if (data.hide_sold_out_tickets !== undefined) updateData.hide_sold_out_tickets = data.hide_sold_out_tickets;
    if (data.auto_hide_past_tickets !== undefined) updateData.auto_hide_past_tickets = data.auto_hide_past_tickets;
    
    // Registration Approval
    if (data.approval_mode !== undefined) updateData.approval_mode = data.approval_mode;
    if (data.pending_approval_expiry_hours !== undefined) updateData.pending_approval_expiry_hours = data.pending_approval_expiry_hours;
    
    // Confirmation & Invoices
    if (data.auto_send_confirmation !== undefined) updateData.auto_send_confirmation = data.auto_send_confirmation;
    if (data.attach_invoice !== undefined) updateData.attach_invoice = data.attach_invoice;
    if (data.show_tax_breakdown !== undefined) updateData.show_tax_breakdown = data.show_tax_breakdown;
    
    // Capacity Rules
    if (data.stop_sales_when_full !== undefined) updateData.stop_sales_when_full = data.stop_sales_when_full;
    if (data.allow_admin_overselling !== undefined) updateData.allow_admin_overselling = data.allow_admin_overselling;
    if (data.auto_enable_waitlist !== undefined) updateData.auto_enable_waitlist = data.auto_enable_waitlist;

    const [updatedSettings] = await db<EventSettings>('event_settings')
      .where('event_id', eventId)
      .update(updateData)
      .returning('*');

    // Log activity
    await this.logActivity(eventId, 'settings_updated', 'Event settings updated');

    return updatedSettings;
  }

  private async logActivity(eventId: number, actionType: string, description: string): Promise<void> {
    try {
      await db('event_activity_logs').insert({
        event_id: eventId,
        actor_type: 'admin',
        action_type: actionType,
        description,
        created_at: new Date(),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
