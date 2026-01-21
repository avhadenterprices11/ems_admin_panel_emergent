import { Request, Response } from 'express';
import { PaymentTaxService } from '../services/payment-tax.service';

export class PaymentTaxController {
  private paymentTaxService: PaymentTaxService;

  constructor() {
    this.paymentTaxService = new PaymentTaxService();
  }

  /**
   * GET /api/events/:eventId/payment-tax
   * Get payment/tax settings for an event (falls back to global defaults)
   */
  async getEventSettings(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const settings = await this.paymentTaxService.getEventSettings(eventId);
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error getting payment/tax settings:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
      } else {
        res.status(500).json({ message: 'Failed to get payment/tax settings' });
      }
    }
  }

  /**
   * PUT /api/events/:eventId/payment-tax
   * Update payment/tax settings for an event
   */
  async updateEventSettings(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const {
        currency,
        stripe_enabled,
        razorpay_enabled,
        offline_enabled,
        tax_enabled,
        tax_name,
        tax_percentage,
        legal_entity_name,
        billing_address,
        tax_id,
      } = req.body;

      // Get user from auth if available
      const updatedBy = (req as any).user?.email || 'system';

      const settings = await this.paymentTaxService.updateEventSettings(eventId, {
        currency,
        stripe_enabled,
        razorpay_enabled,
        offline_enabled,
        tax_enabled,
        tax_name,
        tax_percentage,
        legal_entity_name,
        billing_address,
        tax_id,
        updated_by: updatedBy,
      });

      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error updating payment/tax settings:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
      } else if (error.message.includes('Invalid currency') || error.message.includes('Tax percentage')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to update payment/tax settings' });
      }
    }
  }

  /**
   * POST /api/events/:eventId/payment-tax/reset
   * Reset event settings to global defaults
   */
  async resetEventSettings(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const settings = await this.paymentTaxService.resetEventSettings(eventId);
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error resetting payment/tax settings:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
      } else {
        res.status(500).json({ message: 'Failed to reset payment/tax settings' });
      }
    }
  }

  /**
   * GET /api/settings/payment-tax (for future global settings UI)
   * Get global default settings
   */
  async getGlobalSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.paymentTaxService.getGlobalSettings();
      if (!settings) {
        res.status(404).json({ message: 'Global settings not found' });
        return;
      }
      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error getting global payment/tax settings:', error);
      res.status(500).json({ message: 'Failed to get global payment/tax settings' });
    }
  }

  /**
   * PUT /api/settings/payment-tax (for future global settings UI)
   * Update global default settings
   */
  async updateGlobalSettings(req: Request, res: Response): Promise<void> {
    try {
      const {
        currency,
        stripe_enabled,
        razorpay_enabled,
        offline_enabled,
        tax_enabled,
        tax_name,
        tax_percentage,
        legal_entity_name,
        billing_address,
        tax_id,
      } = req.body;

      // Get user from auth if available
      const updatedBy = (req as any).user?.email || 'system';

      const settings = await this.paymentTaxService.updateGlobalSettings({
        currency,
        stripe_enabled,
        razorpay_enabled,
        offline_enabled,
        tax_enabled,
        tax_name,
        tax_percentage,
        legal_entity_name,
        billing_address,
        tax_id,
        updated_by: updatedBy,
      });

      res.status(200).json(settings);
    } catch (error: any) {
      console.error('Error updating global payment/tax settings:', error);
      if (error.message.includes('Invalid currency') || error.message.includes('Tax percentage')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to update global payment/tax settings' });
      }
    }
  }
}
