import { Request, Response } from 'express';
import { AddonsService, CreateAddonDTO, UpdateAddonDTO } from '../services/addons.service';

const addonsService = new AddonsService();

export class AddonsController {
  /**
   * GET /api/events/:eventId/addons
   */
  async getAddons(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const addons = await addonsService.getAddonsByEventId(eventId);
      res.status(200).json(addons);
    } catch (error) {
      console.error('Error fetching addons:', error);
      res.status(500).json({ message: 'Failed to fetch add-ons' });
    }
  }

  /**
   * GET /api/events/:eventId/addons/:addonId
   */
  async getAddonById(req: Request, res: Response): Promise<void> {
    try {
      const addonId = parseInt(req.params.addonId);
      if (isNaN(addonId)) {
        res.status(400).json({ message: 'Invalid addon ID' });
        return;
      }

      const addon = await addonsService.getAddonById(addonId);
      if (!addon) {
        res.status(404).json({ message: 'Add-on not found' });
        return;
      }

      res.status(200).json(addon);
    } catch (error) {
      console.error('Error fetching addon:', error);
      res.status(500).json({ message: 'Failed to fetch add-on' });
    }
  }

  /**
   * POST /api/events/:eventId/addons
   */
  async createAddon(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const { name, description, addon_type, price, currency, unlimited_quantity, quantity_limit, per_order_limit, is_active, is_visible } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Add-on name is required' });
        return;
      }

      if (price === undefined || price < 0) {
        res.status(400).json({ message: 'Valid price is required' });
        return;
      }

      const addonData: CreateAddonDTO = {
        event_id: eventId,
        name,
        description,
        addon_type,
        price: parseFloat(price),
        currency,
        unlimited_quantity,
        quantity_limit: quantity_limit ? parseInt(quantity_limit) : undefined,
        per_order_limit: per_order_limit ? parseInt(per_order_limit) : undefined,
        is_active,
        is_visible,
      };

      const addon = await addonsService.createAddon(addonData);
      res.status(201).json(addon);
    } catch (error: any) {
      console.error('Error creating addon:', error);
      res.status(500).json({ message: error.message || 'Failed to create add-on' });
    }
  }

  /**
   * PUT /api/events/:eventId/addons/:addonId
   */
  async updateAddon(req: Request, res: Response): Promise<void> {
    try {
      const addonId = parseInt(req.params.addonId);
      if (isNaN(addonId)) {
        res.status(400).json({ message: 'Invalid addon ID' });
        return;
      }

      const updateData: UpdateAddonDTO = {};
      const { name, description, addon_type, price, currency, unlimited_quantity, quantity_limit, per_order_limit, is_active, is_visible } = req.body;

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (addon_type !== undefined) updateData.addon_type = addon_type;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (currency !== undefined) updateData.currency = currency;
      if (unlimited_quantity !== undefined) updateData.unlimited_quantity = unlimited_quantity;
      if (quantity_limit !== undefined) updateData.quantity_limit = parseInt(quantity_limit);
      if (per_order_limit !== undefined) updateData.per_order_limit = parseInt(per_order_limit);
      if (is_active !== undefined) updateData.is_active = is_active;
      if (is_visible !== undefined) updateData.is_visible = is_visible;

      const addon = await addonsService.updateAddon(addonId, updateData);
      if (!addon) {
        res.status(404).json({ message: 'Add-on not found' });
        return;
      }

      res.status(200).json(addon);
    } catch (error: any) {
      console.error('Error updating addon:', error);
      res.status(500).json({ message: error.message || 'Failed to update add-on' });
    }
  }

  /**
   * DELETE /api/events/:eventId/addons/:addonId
   */
  async deleteAddon(req: Request, res: Response): Promise<void> {
    try {
      const addonId = parseInt(req.params.addonId);
      if (isNaN(addonId)) {
        res.status(400).json({ message: 'Invalid addon ID' });
        return;
      }

      const success = await addonsService.deleteAddon(addonId);
      if (!success) {
        res.status(404).json({ message: 'Add-on not found' });
        return;
      }

      res.status(200).json({ message: 'Add-on deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting addon:', error);
      res.status(400).json({ message: error.message || 'Failed to delete add-on' });
    }
  }

  /**
   * POST /api/events/:eventId/addons/:addonId/toggle
   */
  async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const addonId = parseInt(req.params.addonId);
      if (isNaN(addonId)) {
        res.status(400).json({ message: 'Invalid addon ID' });
        return;
      }

      const addon = await addonsService.toggleAddonStatus(addonId);
      if (!addon) {
        res.status(404).json({ message: 'Add-on not found' });
        return;
      }

      res.status(200).json(addon);
    } catch (error: any) {
      console.error('Error toggling addon status:', error);
      res.status(500).json({ message: error.message || 'Failed to toggle add-on status' });
    }
  }
}
