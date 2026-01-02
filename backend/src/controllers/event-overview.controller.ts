import { Request, Response } from 'express';
import { EventOverviewService } from '../services/event-overview.service';

const eventOverviewService = new EventOverviewService();

export class EventOverviewController {
  /**
   * GET /api/events/:eventId/overview/metrics
   * Get overview summary metrics for an event
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const { startDate, endDate } = req.query;

      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Check if event exists
      const event = await eventOverviewService.getEventById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      const metrics = await eventOverviewService.getOverviewMetrics(
        eventId,
        startDate as string,
        endDate as string
      );

      res.status(200).json(metrics);
    } catch (error) {
      console.error('Error fetching overview metrics:', error);
      res.status(500).json({ message: 'Failed to fetch overview metrics' });
    }
  }

  /**
   * GET /api/events/:eventId/overview/funnel
   * Get registration funnel data for an event
   */
  async getFunnel(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const { startDate, endDate } = req.query;

      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Check if event exists
      const event = await eventOverviewService.getEventById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      const funnel = await eventOverviewService.getRegistrationFunnel(
        eventId,
        startDate as string,
        endDate as string
      );

      res.status(200).json(funnel);
    } catch (error) {
      console.error('Error fetching registration funnel:', error);
      res.status(500).json({ message: 'Failed to fetch registration funnel' });
    }
  }

  /**
   * GET /api/events/:eventId/overview/tickets
   * Get ticket inventory health for an event
   */
  async getTicketInventory(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);

      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Check if event exists
      const event = await eventOverviewService.getEventById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      const tickets = await eventOverviewService.getTicketInventory(eventId);

      res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching ticket inventory:', error);
      res.status(500).json({ message: 'Failed to fetch ticket inventory' });
    }
  }

  /**
   * GET /api/events/:eventId/overview/alerts
   * Get attention needed alerts for an event
   */
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);

      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Check if event exists
      const event = await eventOverviewService.getEventById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      const alerts = await eventOverviewService.getAttentionAlerts(eventId);

      res.status(200).json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  }

  /**
   * GET /api/events/:eventId/overview/activity
   * Get event activity timeline
   */
  async getActivityTimeline(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      const limit = parseInt(req.query.limit as string) || 20;

      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      // Check if event exists
      const event = await eventOverviewService.getEventById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      const activity = await eventOverviewService.getActivityTimeline(eventId, limit);

      res.status(200).json(activity);
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      res.status(500).json({ message: 'Failed to fetch activity timeline' });
    }
  }

  /**
   * GET /api/events/:eventId
   * Get event details by ID
   */
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);

      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Invalid event ID' });
        return;
      }

      const event = await eventOverviewService.getEventById(eventId);
      
      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      // Parse JSON fields
      const parsedEvent = {
        ...event,
        gallery_images: typeof event.gallery_images === 'string' ? JSON.parse(event.gallery_images) : event.gallery_images,
        co_hosts: typeof event.co_hosts === 'string' ? JSON.parse(event.co_hosts) : event.co_hosts,
        tags: typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags,
        partners: typeof event.partners === 'string' ? JSON.parse(event.partners) : event.partners,
        sponsors: typeof event.sponsors === 'string' ? JSON.parse(event.sponsors) : event.sponsors,
        agenda: typeof event.agenda === 'string' ? JSON.parse(event.agenda) : event.agenda,
        email_config: typeof event.email_config === 'string' ? JSON.parse(event.email_config) : event.email_config,
      };

      res.status(200).json(parsedEvent);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  }
}
