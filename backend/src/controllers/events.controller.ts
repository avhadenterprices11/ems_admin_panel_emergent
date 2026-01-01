import { Request, Response } from 'express';
import { EventsService } from '../services/events.service';
import { EventListQueryDTO, BulkActionDTO, EventMetricsQueryDTO } from '../dtos/events.dto';

export class EventsController {
  private eventsService: EventsService;

  constructor() {
    this.eventsService = new EventsService();
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any as EventListQueryDTO;
      const result = await this.eventsService.getEventsList(query);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any as EventMetricsQueryDTO;
      const metrics = await this.eventsService.calculateMetrics(query);
      res.status(200).json(metrics);
    } catch (error) {
      console.error('Error calculating metrics:', error);
      res.status(500).json({ message: 'Failed to calculate metrics' });
    }
  }

  async bulkArchive(req: Request, res: Response): Promise<void> {
    try {
      const { eventIds } = req.body as BulkActionDTO;
      const archivedCount = await this.eventsService.bulkArchiveEvents(eventIds);
      res.status(200).json({ success: true, archivedCount });
    } catch (error) {
      console.error('Error archiving events:', error);
      res.status(500).json({ message: 'Failed to archive events' });
    }
  }

  async bulkDelete(req: Request, res: Response): Promise<void> {
    try {
      const { eventIds } = req.body as BulkActionDTO;
      const deletedCount = await this.eventsService.bulkDeleteEvents(eventIds);
      res.status(200).json({ success: true, deletedCount });
    } catch (error) {
      console.error('Error deleting events:', error);
      res.status(500).json({ message: 'Failed to delete events' });
    }
  }
}
