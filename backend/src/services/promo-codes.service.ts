import db from '../database/db';

export interface PromoCode {
  id: number;
  event_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
  applicable_to: string;
  applicable_items?: number[];
  usage_limit?: number;
  usage_count: number;
  valid_from?: Date;
  valid_until?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface CreatePromoCodeDTO {
  event_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
  applicable_to?: string;
  applicable_items?: number[];
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface UpdatePromoCodeDTO {
  code?: string;
  discount_type?: string;
  discount_value?: number;
  max_discount_amount?: number;
  min_order_value?: number;
  applicable_to?: string;
  applicable_items?: number[];
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export class PromoCodesService {
  /**
   * Get all promo codes for an event
   */
  async getPromoCodesByEventId(eventId: number): Promise<PromoCode[]> {
    const promoCodes = await db<PromoCode>('promo_codes')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .orderBy('created_at', 'desc');
    
    return promoCodes.map(this.parsePromoCode);
  }

  /**
   * Get a single promo code by ID
   */
  async getPromoCodeById(promoId: number): Promise<PromoCode | null> {
    const promo = await db<PromoCode>('promo_codes')
      .where('id', promoId)
      .where('is_deleted', false)
      .first();
    return promo ? this.parsePromoCode(promo) : null;
  }

  /**
   * Get promo code by code string
   */
  async getPromoCodeByCode(eventId: number, code: string): Promise<PromoCode | null> {
    const promo = await db<PromoCode>('promo_codes')
      .where('event_id', eventId)
      .where('code', code.toUpperCase())
      .where('is_deleted', false)
      .first();
    return promo ? this.parsePromoCode(promo) : null;
  }

  /**
   * Create a new promo code
   */
  async createPromoCode(data: CreatePromoCodeDTO): Promise<PromoCode> {
    // Validate event exists
    const event = await db('events')
      .where('id', data.event_id)
      .where('deleted_at', null)
      .first();
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if code already exists for this event
    const existingCode = await this.getPromoCodeByCode(data.event_id, data.code);
    if (existingCode) {
      throw new Error('Promo code already exists for this event');
    }

    const promoData = {
      event_id: data.event_id,
      code: data.code.toUpperCase(),
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_discount_amount: data.max_discount_amount || null,
      min_order_value: data.min_order_value || null,
      applicable_to: data.applicable_to || 'all',
      applicable_items: data.applicable_items ? JSON.stringify(data.applicable_items) : null,
      usage_limit: data.usage_limit || null,
      usage_count: 0,
      valid_from: data.valid_from || null,
      valid_until: data.valid_until || null,
      is_active: data.is_active !== false,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    const [promo] = await db<PromoCode>('promo_codes')
      .insert(promoData)
      .returning('*');

    await this.logActivity(data.event_id, 'promo_created', `Promo code "${data.code}" created`);

    return this.parsePromoCode(promo);
  }

  /**
   * Update a promo code
   */
  async updatePromoCode(promoId: number, data: UpdatePromoCodeDTO): Promise<PromoCode | null> {
    const existingPromo = await this.getPromoCodeById(promoId);
    if (!existingPromo) {
      return null;
    }

    // Check if new code conflicts with existing
    if (data.code && data.code.toUpperCase() !== existingPromo.code) {
      const conflicting = await this.getPromoCodeByCode(existingPromo.event_id, data.code);
      if (conflicting) {
        throw new Error('Promo code already exists for this event');
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.code !== undefined) updateData.code = data.code.toUpperCase();
    if (data.discount_type !== undefined) updateData.discount_type = data.discount_type;
    if (data.discount_value !== undefined) updateData.discount_value = data.discount_value;
    if (data.max_discount_amount !== undefined) updateData.max_discount_amount = data.max_discount_amount;
    if (data.min_order_value !== undefined) updateData.min_order_value = data.min_order_value;
    if (data.applicable_to !== undefined) updateData.applicable_to = data.applicable_to;
    if (data.applicable_items !== undefined) updateData.applicable_items = JSON.stringify(data.applicable_items);
    if (data.usage_limit !== undefined) updateData.usage_limit = data.usage_limit;
    if (data.valid_from !== undefined) updateData.valid_from = data.valid_from;
    if (data.valid_until !== undefined) updateData.valid_until = data.valid_until;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const [updatedPromo] = await db<PromoCode>('promo_codes')
      .where('id', promoId)
      .where('is_deleted', false)
      .update(updateData)
      .returning('*');

    await this.logActivity(existingPromo.event_id, 'promo_updated', `Promo code "${existingPromo.code}" updated`);

    return updatedPromo ? this.parsePromoCode(updatedPromo) : null;
  }

  /**
   * Delete a promo code (soft delete)
   */
  async deletePromoCode(promoId: number): Promise<boolean> {
    const promo = await this.getPromoCodeById(promoId);
    if (!promo) {
      return false;
    }

    const updated = await db<PromoCode>('promo_codes')
      .where('id', promoId)
      .where('is_deleted', false)
      .update({ is_deleted: true, updated_at: new Date() });

    await this.logActivity(promo.event_id, 'promo_deleted', `Promo code "${promo.code}" deleted`);

    return updated > 0;
  }

  /**
   * Toggle promo code active status
   */
  async togglePromoCodeStatus(promoId: number): Promise<PromoCode | null> {
    const promo = await this.getPromoCodeById(promoId);
    if (!promo) {
      return null;
    }

    const [updatedPromo] = await db<PromoCode>('promo_codes')
      .where('id', promoId)
      .update({
        is_active: !promo.is_active,
        updated_at: new Date(),
      })
      .returning('*');

    const action = updatedPromo.is_active ? 'enabled' : 'disabled';
    await this.logActivity(promo.event_id, `promo_${action}`, `Promo code "${promo.code}" ${action}`);

    return updatedPromo ? this.parsePromoCode(updatedPromo) : null;
  }

  private parsePromoCode(promo: any): PromoCode {
    return {
      ...promo,
      applicable_items: typeof promo.applicable_items === 'string' 
        ? JSON.parse(promo.applicable_items) 
        : promo.applicable_items,
    };
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
