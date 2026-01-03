import { Request, Response } from 'express';
import { PromoCodesService, CreatePromoCodeDTO, UpdatePromoCodeDTO } from '../services/promo-codes.service';

const promoCodesService = new PromoCodesService();

export class PromoCodesController {
  /**
   * GET /api/events/:eventId/promo-codes
   */
  async getPromoCodes(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const promoCodes = await promoCodesService.getPromoCodesByEventId(eventId);
      res.status(200).json(promoCodes);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      res.status(500).json({ message: 'Failed to fetch promo codes' });
    }
  }

  /**
   * GET /api/events/:eventId/promo-codes/:promoId
   */
  async getPromoCodeById(req: Request, res: Response): Promise<void> {
    try {
      const promoId = parseInt(req.params.promoId);
      if (isNaN(promoId)) {
        res.status(400).json({ message: 'Invalid promo code ID' });
        return;
      }

      const promo = await promoCodesService.getPromoCodeById(promoId);
      if (!promo) {
        res.status(404).json({ message: 'Promo code not found' });
        return;
      }

      res.status(200).json(promo);
    } catch (error) {
      console.error('Error fetching promo code:', error);
      res.status(500).json({ message: 'Failed to fetch promo code' });
    }
  }

  /**
   * POST /api/events/:eventId/promo-codes
   */
  async createPromoCode(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const { code, discount_type, discount_value, max_discount_amount, min_order_value, applicable_to, applicable_items, usage_limit, valid_from, valid_until, is_active } = req.body;

      if (!code) {
        res.status(400).json({ message: 'Promo code is required' });
        return;
      }

      if (!discount_type || !['percentage', 'fixed'].includes(discount_type)) {
        res.status(400).json({ message: 'Valid discount type (percentage or fixed) is required' });
        return;
      }

      if (discount_value === undefined || discount_value <= 0) {
        res.status(400).json({ message: 'Valid discount value is required' });
        return;
      }

      if (discount_type === 'percentage' && discount_value > 100) {
        res.status(400).json({ message: 'Percentage discount cannot exceed 100' });
        return;
      }

      const promoData: CreatePromoCodeDTO = {
        event_id: eventId,
        code,
        discount_type,
        discount_value: parseFloat(discount_value),
        max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : undefined,
        min_order_value: min_order_value ? parseFloat(min_order_value) : undefined,
        applicable_to,
        applicable_items,
        usage_limit: usage_limit ? parseInt(usage_limit) : undefined,
        valid_from,
        valid_until,
        is_active,
      };

      const promo = await promoCodesService.createPromoCode(promoData);
      res.status(201).json(promo);
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      res.status(400).json({ message: error.message || 'Failed to create promo code' });
    }
  }

  /**
   * PUT /api/events/:eventId/promo-codes/:promoId
   */
  async updatePromoCode(req: Request, res: Response): Promise<void> {
    try {
      const promoId = parseInt(req.params.promoId);
      if (isNaN(promoId)) {
        res.status(400).json({ message: 'Invalid promo code ID' });
        return;
      }

      const updateData: UpdatePromoCodeDTO = {};
      const { code, discount_type, discount_value, max_discount_amount, min_order_value, applicable_to, applicable_items, usage_limit, valid_from, valid_until, is_active } = req.body;

      if (code !== undefined) updateData.code = code;
      if (discount_type !== undefined) updateData.discount_type = discount_type;
      if (discount_value !== undefined) updateData.discount_value = parseFloat(discount_value);
      if (max_discount_amount !== undefined) updateData.max_discount_amount = parseFloat(max_discount_amount);
      if (min_order_value !== undefined) updateData.min_order_value = parseFloat(min_order_value);
      if (applicable_to !== undefined) updateData.applicable_to = applicable_to;
      if (applicable_items !== undefined) updateData.applicable_items = applicable_items;
      if (usage_limit !== undefined) updateData.usage_limit = parseInt(usage_limit);
      if (valid_from !== undefined) updateData.valid_from = valid_from;
      if (valid_until !== undefined) updateData.valid_until = valid_until;
      if (is_active !== undefined) updateData.is_active = is_active;

      const promo = await promoCodesService.updatePromoCode(promoId, updateData);
      if (!promo) {
        res.status(404).json({ message: 'Promo code not found' });
        return;
      }

      res.status(200).json(promo);
    } catch (error: any) {
      console.error('Error updating promo code:', error);
      res.status(400).json({ message: error.message || 'Failed to update promo code' });
    }
  }

  /**
   * DELETE /api/events/:eventId/promo-codes/:promoId
   */
  async deletePromoCode(req: Request, res: Response): Promise<void> {
    try {
      const promoId = parseInt(req.params.promoId);
      if (isNaN(promoId)) {
        res.status(400).json({ message: 'Invalid promo code ID' });
        return;
      }

      const success = await promoCodesService.deletePromoCode(promoId);
      if (!success) {
        res.status(404).json({ message: 'Promo code not found' });
        return;
      }

      res.status(200).json({ message: 'Promo code deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting promo code:', error);
      res.status(500).json({ message: error.message || 'Failed to delete promo code' });
    }
  }

  /**
   * POST /api/events/:eventId/promo-codes/:promoId/toggle
   */
  async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const promoId = parseInt(req.params.promoId);
      if (isNaN(promoId)) {
        res.status(400).json({ message: 'Invalid promo code ID' });
        return;
      }

      const promo = await promoCodesService.togglePromoCodeStatus(promoId);
      if (!promo) {
        res.status(404).json({ message: 'Promo code not found' });
        return;
      }

      res.status(200).json(promo);
    } catch (error: any) {
      console.error('Error toggling promo code status:', error);
      res.status(500).json({ message: error.message || 'Failed to toggle promo code status' });
    }
  }
}
