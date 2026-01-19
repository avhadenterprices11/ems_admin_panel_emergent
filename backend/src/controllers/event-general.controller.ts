import { Request, Response } from 'express';
import { EventGeneralService, UpdateEventGeneralDetailsDTO } from '../services/event-general.service';
import { MasterDataService } from '../services/master-data.service';

const eventGeneralService = new EventGeneralService();
const masterDataService = new MasterDataService();

export class EventGeneralController {
  /**
   * GET /api/events/:eventId/general
   * Get event general details including tags, co-hosts, media
   */
  async getGeneralDetails(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const details = await eventGeneralService.getEventGeneralDetails(eventId);
      res.status(200).json(details);
    } catch (error: any) {
      console.error('Error fetching event general details:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to fetch event general details' });
      }
    }
  }

  /**
   * PUT /api/events/:eventId/general
   * Update event general details
   */
  async updateGeneralDetails(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const updateData: UpdateEventGeneralDetailsDTO = req.body;
      const details = await eventGeneralService.updateEventGeneralDetails(eventId, updateData);
      res.status(200).json(details);
    } catch (error: any) {
      console.error('Error updating event general details:', error);
      if (error.message === 'Event not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to update event general details' });
      }
    }
  }

  /**
   * POST /api/events/:eventId/media
   * Add media to event
   */
  async addMedia(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const { file_key, url, file_type, media_type, size, original_name } = req.body;
      
      if (!file_key || !url || !file_type || !media_type) {
        res.status(400).json({ message: 'Missing required fields: file_key, url, file_type, media_type' });
        return;
      }

      const media = await masterDataService.addEventMedia(eventId, {
        file_key,
        url,
        file_type,
        media_type,
        size,
        original_name,
      });
      
      res.status(201).json(media);
    } catch (error: any) {
      console.error('Error adding event media:', error);
      res.status(500).json({ message: error.message || 'Failed to add event media' });
    }
  }

  /**
   * DELETE /api/events/:eventId/media/:mediaId
   * Remove media from event
   */
  async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      const mediaId = parseInt(req.params.mediaId);
      if (isNaN(mediaId)) {
        res.status(400).json({ message: 'Invalid media ID' });
        return;
      }

      await masterDataService.deleteEventMedia(mediaId);
      res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting event media:', error);
      res.status(500).json({ message: error.message || 'Failed to delete event media' });
    }
  }

  /**
   * GET /api/events/:eventId/media
   * Get all media for an event
   */
  async getMedia(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const mediaType = req.query.type as string | undefined;
      const media = await masterDataService.getEventMedia(eventId, mediaType);
      res.status(200).json(media);
    } catch (error: any) {
      console.error('Error fetching event media:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch event media' });
    }
  }
}
