import { Request, Response } from 'express';
import { EventSettingsService, UpdateEventSettingsDTO } from '../services/event-settings.service';

const eventSettingsService = new EventSettingsService();

export class EventSettingsController {
  /**
   * GET /api/events/:eventId/settings
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const settings = await eventSettingsService.getEventSettings(eventId);
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error fetching event settings:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch event settings' });
    }
  }

  /**
   * PUT /api/events/:eventId/settings
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const updateData: UpdateEventSettingsDTO = {};
      const {
        // Tax & Fees
        pass_fees_to_attendees,
        charge_tax,
        tax_type,
        tax_rate,
        // Refund Policy
        refund_policy,
        refund_deadline_days,
        refund_percentage,
        // Ticket Sales Rules
        allow_transfers,
        allow_cancellations,
        lock_changes_after_event_start,
        // Ticket Visibility Rules
        hide_sold_out_tickets,
        auto_hide_past_tickets,
        // Registration Approval
        approval_mode,
        pending_approval_expiry_hours,
        // Confirmation & Invoices
        auto_send_confirmation,
        attach_invoice,
        show_tax_breakdown,
        // Capacity Rules
        stop_sales_when_full,
        allow_admin_overselling,
        auto_enable_waitlist,
      } = req.body;

      // Tax & Fees
      if (pass_fees_to_attendees !== undefined) updateData.pass_fees_to_attendees = pass_fees_to_attendees;
      if (charge_tax !== undefined) updateData.charge_tax = charge_tax;
      if (tax_type !== undefined) updateData.tax_type = tax_type;
      if (tax_rate !== undefined) updateData.tax_rate = parseFloat(tax_rate);
      
      // Refund Policy
      if (refund_policy !== undefined) updateData.refund_policy = refund_policy;
      if (refund_deadline_days !== undefined) updateData.refund_deadline_days = parseInt(refund_deadline_days);
      if (refund_percentage !== undefined) updateData.refund_percentage = parseFloat(refund_percentage);
      
      // Ticket Sales Rules
      if (allow_transfers !== undefined) updateData.allow_transfers = allow_transfers;
      if (allow_cancellations !== undefined) updateData.allow_cancellations = allow_cancellations;
      if (lock_changes_after_event_start !== undefined) updateData.lock_changes_after_event_start = lock_changes_after_event_start;
      
      // Ticket Visibility Rules
      if (hide_sold_out_tickets !== undefined) updateData.hide_sold_out_tickets = hide_sold_out_tickets;
      if (auto_hide_past_tickets !== undefined) updateData.auto_hide_past_tickets = auto_hide_past_tickets;
      
      // Registration Approval
      if (approval_mode !== undefined) updateData.approval_mode = approval_mode;
      if (pending_approval_expiry_hours !== undefined) updateData.pending_approval_expiry_hours = parseInt(pending_approval_expiry_hours);
      
      // Confirmation & Invoices
      if (auto_send_confirmation !== undefined) updateData.auto_send_confirmation = auto_send_confirmation;
      if (attach_invoice !== undefined) updateData.attach_invoice = attach_invoice;
      if (show_tax_breakdown !== undefined) updateData.show_tax_breakdown = show_tax_breakdown;
      
      // Capacity Rules
      if (stop_sales_when_full !== undefined) updateData.stop_sales_when_full = stop_sales_when_full;
      if (allow_admin_overselling !== undefined) updateData.allow_admin_overselling = allow_admin_overselling;
      if (auto_enable_waitlist !== undefined) updateData.auto_enable_waitlist = auto_enable_waitlist;

      const settings = await eventSettingsService.updateEventSettings(eventId, updateData);
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error updating event settings:', error);
      res.status(500).json({ message: error.message || 'Failed to update event settings' });
    }
  }
}
