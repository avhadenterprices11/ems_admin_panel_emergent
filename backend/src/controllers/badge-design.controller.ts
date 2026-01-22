import { Request, Response } from 'express';
import { BadgeDesignService, CreateBadgeDesignInput, UpdateBadgeDesignInput } from '../services/badge-design.service';

const badgeDesignService = new BadgeDesignService();

export class BadgeDesignController {
  // Get all badge designs for an event
  async getBadgeDesigns(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const designs = await badgeDesignService.getBadgeDesigns(eventId);
      return res.status(200).json(designs);
    } catch (error: any) {
      console.error('Error fetching badge designs:', error);
      return res.status(500).json({ message: 'Failed to fetch badge designs' });
    }
  }

  // Get single badge design
  async getBadgeDesignById(req: Request, res: Response) {
    try {
      const designId = parseInt(req.params.designId, 10);
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      const design = await badgeDesignService.getBadgeDesignById(designId);
      if (!design) {
        return res.status(404).json({ message: 'Badge design not found' });
      }

      return res.status(200).json(design);
    } catch (error: any) {
      console.error('Error fetching badge design:', error);
      return res.status(500).json({ message: 'Failed to fetch badge design' });
    }
  }

  // Get the appropriate design for a ticket type
  async getDesignForTicket(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const ticketTypeId = req.query.ticket_type_id ? parseInt(req.query.ticket_type_id as string, 10) : undefined;

      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const design = await badgeDesignService.getDesignForTicket(eventId, ticketTypeId);
      if (!design) {
        // Return default config if no design found
        return res.status(200).json({
          id: null,
          name: 'Default',
          design_config: {
            visible_fields: ['full_name', 'ticket_type', 'company', 'job_title', 'qr_code'],
            field_positions: {},
            font_size_scale: 1.0,
            primary_color: '#0f172b',
            secondary_color: '#3b82f6',
            background_color: '#ffffff',
            logo_url: null,
            show_punch_hole: true,
            qr_code_size: 80
          }
        });
      }

      return res.status(200).json(design);
    } catch (error: any) {
      console.error('Error fetching design for ticket:', error);
      return res.status(500).json({ message: 'Failed to fetch design' });
    }
  }

  // Create badge design
  async createBadgeDesign(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const input: CreateBadgeDesignInput = {
        event_id: eventId,
        ticket_type_id: req.body.ticket_type_id || null,
        name: req.body.name,
        is_event_default: req.body.is_event_default || false,
        badge_size: req.body.badge_size,
        custom_width: req.body.custom_width,
        custom_height: req.body.custom_height,
        orientation: req.body.orientation,
        design_config: req.body.design_config,
        is_active: req.body.is_active
      };

      if (!input.name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const design = await badgeDesignService.createBadgeDesign(input);
      return res.status(201).json(design);
    } catch (error: any) {
      console.error('Error creating badge design:', error);
      return res.status(500).json({ message: 'Failed to create badge design' });
    }
  }

  // Update badge design
  async updateBadgeDesign(req: Request, res: Response) {
    try {
      const designId = parseInt(req.params.designId, 10);
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      const input: UpdateBadgeDesignInput = {
        name: req.body.name,
        is_event_default: req.body.is_event_default,
        badge_size: req.body.badge_size,
        custom_width: req.body.custom_width,
        custom_height: req.body.custom_height,
        orientation: req.body.orientation,
        design_config: req.body.design_config,
        is_active: req.body.is_active
      };

      const design = await badgeDesignService.updateBadgeDesign(designId, input);
      if (!design) {
        return res.status(404).json({ message: 'Badge design not found' });
      }

      return res.status(200).json(design);
    } catch (error: any) {
      console.error('Error updating badge design:', error);
      return res.status(500).json({ message: 'Failed to update badge design' });
    }
  }

  // Delete badge design
  async deleteBadgeDesign(req: Request, res: Response) {
    try {
      const designId = parseInt(req.params.designId, 10);
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      const success = await badgeDesignService.deleteBadgeDesign(designId);
      if (!success) {
        return res.status(400).json({ message: 'Cannot delete this design (may be global default)' });
      }

      return res.status(200).json({ message: 'Badge design deleted' });
    } catch (error: any) {
      console.error('Error deleting badge design:', error);
      return res.status(500).json({ message: 'Failed to delete badge design' });
    }
  }

  // Duplicate badge design
  async duplicateBadgeDesign(req: Request, res: Response) {
    try {
      const designId = parseInt(req.params.designId, 10);
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }

      const newName = req.body.name;
      const design = await badgeDesignService.duplicateBadgeDesign(designId, newName);
      if (!design) {
        return res.status(404).json({ message: 'Badge design not found' });
      }

      return res.status(201).json(design);
    } catch (error: any) {
      console.error('Error duplicating badge design:', error);
      return res.status(500).json({ message: 'Failed to duplicate badge design' });
    }
  }
}
