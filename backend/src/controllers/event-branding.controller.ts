import { Request, Response } from 'express';
import { EventBrandingService } from '../services/event-branding.service';

export class EventBrandingController {
  private brandingService: EventBrandingService;

  constructor() {
    this.brandingService = new EventBrandingService();
  }

  /**
   * GET /api/events/:eventId/branding
   */
  async getBranding(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const branding = await this.brandingService.getBranding(eventId);
      res.status(200).json(branding);
    } catch (error: any) {
      console.error('Error getting branding:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
      } else {
        res.status(500).json({ message: 'Failed to get branding settings' });
      }
    }
  }

  /**
   * PUT /api/events/:eventId/branding
   */
  async updateBranding(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const {
        light_logo_url,
        dark_logo_url,
        cover_image_url,
        primary_color,
        secondary_color,
        font_family,
      } = req.body;

      // Validate colors if provided
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (primary_color && !hexColorRegex.test(primary_color)) {
        res.status(400).json({ message: 'Invalid primary color format. Use hex format (e.g., #0f172b)' });
        return;
      }
      if (secondary_color && !hexColorRegex.test(secondary_color)) {
        res.status(400).json({ message: 'Invalid secondary color format. Use hex format (e.g., #3b82f6)' });
        return;
      }

      // Validate font family if provided
      const validFonts = ['inter', 'roboto', 'poppins', 'open-sans', 'lato', 'montserrat'];
      if (font_family && !validFonts.includes(font_family)) {
        res.status(400).json({ message: `Invalid font family. Choose from: ${validFonts.join(', ')}` });
        return;
      }

      // Get user from auth if available
      const updatedBy = (req as any).user?.email || 'system';

      const branding = await this.brandingService.updateBranding(eventId, {
        light_logo_url,
        dark_logo_url,
        cover_image_url,
        primary_color,
        secondary_color,
        font_family,
        updated_by: updatedBy,
      });

      res.status(200).json(branding);
    } catch (error: any) {
      console.error('Error updating branding:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
      } else {
        res.status(500).json({ message: 'Failed to update branding settings' });
      }
    }
  }

  /**
   * POST /api/events/:eventId/branding/reset
   */
  async resetBranding(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Get user from auth if available
      const updatedBy = (req as any).user?.email || 'system';

      const branding = await this.brandingService.resetBranding(eventId, updatedBy);
      res.status(200).json(branding);
    } catch (error: any) {
      console.error('Error resetting branding:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: 'Event not found' });
      } else {
        res.status(500).json({ message: 'Failed to reset branding settings' });
      }
    }
  }
}
