import db from '../database/db';

export interface EventAddon {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  addon_type: string;
  price: number;
  currency: string;
  unlimited_quantity: boolean;
  quantity_limit?: number;
  quantity_sold: number;
  per_order_limit?: number;
  is_active: boolean;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export interface CreateAddonDTO {
  event_id: number;
  name: string;
  description?: string;
  addon_type?: string;
  price: number;
  currency?: string;
  unlimited_quantity?: boolean;
  quantity_limit?: number;
  per_order_limit?: number;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface UpdateAddonDTO {
  name?: string;
  description?: string;
  addon_type?: string;
  price?: number;
  currency?: string;
  unlimited_quantity?: boolean;
  quantity_limit?: number;
  per_order_limit?: number;
  is_active?: boolean;
  is_visible?: boolean;
}

export class AddonsService {
  /**
   * Get all add-ons for an event
   */
  async getAddonsByEventId(eventId: number): Promise<EventAddon[]> {
    return await db<EventAddon>('event_addons')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .orderBy('created_at', 'asc');
  }

  /**
   * Get a single add-on by ID
   */
  async getAddonById(addonId: number): Promise<EventAddon | null> {
    const addon = await db<EventAddon>('event_addons')
      .where('id', addonId)
      .where('is_deleted', false)
      .first();
    return addon || null;
  }

  /**
   * Create a new add-on
   */
  async createAddon(data: CreateAddonDTO): Promise<EventAddon> {
    // Validate event exists
    const event = await db('events')
      .where('id', data.event_id)
      .where('deleted_at', null)
      .first();
    
    if (!event) {
      throw new Error('Event not found');
    }

    const addonData = {
      event_id: data.event_id,
      name: data.name,
      description: data.description || null,
      addon_type: data.addon_type || 'general',
      price: data.price,
      currency: data.currency || 'USD',
      unlimited_quantity: data.unlimited_quantity || false,
      quantity_limit: data.unlimited_quantity ? null : (data.quantity_limit || null),
      quantity_sold: 0,
      per_order_limit: data.per_order_limit || null,
      is_active: data.is_active !== false,
      is_visible: data.is_visible !== false,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    const [addon] = await db<EventAddon>('event_addons')
      .insert(addonData)
      .returning('*');

    // Log activity
    await this.logActivity(data.event_id, 'addon_created', `Add-on "${data.name}" created`);

    return addon;
  }

  /**
   * Update an add-on
   */
  async updateAddon(addonId: number, data: UpdateAddonDTO): Promise<EventAddon | null> {
    const existingAddon = await this.getAddonById(addonId);
    if (!existingAddon) {
      return null;
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.addon_type !== undefined) updateData.addon_type = data.addon_type;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.unlimited_quantity !== undefined) {
      updateData.unlimited_quantity = data.unlimited_quantity;
      if (data.unlimited_quantity) {
        updateData.quantity_limit = null;
      }
    }
    if (data.quantity_limit !== undefined) updateData.quantity_limit = data.quantity_limit;
    if (data.per_order_limit !== undefined) updateData.per_order_limit = data.per_order_limit;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;

    const [updatedAddon] = await db<EventAddon>('event_addons')
      .where('id', addonId)
      .where('is_deleted', false)
      .update(updateData)
      .returning('*');

    await this.logActivity(existingAddon.event_id, 'addon_updated', `Add-on "${existingAddon.name}" updated`);

    return updatedAddon || null;
  }

  /**
   * Delete an add-on (soft delete)
   */
  async deleteAddon(addonId: number): Promise<boolean> {
    const addon = await this.getAddonById(addonId);
    if (!addon) {
      return false;
    }

    // Check if addon has sales
    if (addon.quantity_sold > 0) {
      throw new Error('Cannot delete add-on with existing sales');
    }

    const updated = await db<EventAddon>('event_addons')
      .where('id', addonId)
      .where('is_deleted', false)
      .update({ is_deleted: true, updated_at: new Date() });

    await this.logActivity(addon.event_id, 'addon_deleted', `Add-on "${addon.name}" deleted`);

    return updated > 0;
  }

  /**
   * Toggle add-on active status
   */
  async toggleAddonStatus(addonId: number): Promise<EventAddon | null> {
    const addon = await this.getAddonById(addonId);
    if (!addon) {
      return null;
    }

    const [updatedAddon] = await db<EventAddon>('event_addons')
      .where('id', addonId)
      .update({
        is_active: !addon.is_active,
        updated_at: new Date(),
      })
      .returning('*');

    const action = updatedAddon.is_active ? 'enabled' : 'disabled';
    await this.logActivity(addon.event_id, `addon_${action}`, `Add-on "${addon.name}" ${action}`);

    return updatedAddon || null;
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
