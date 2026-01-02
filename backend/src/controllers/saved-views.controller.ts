import { Request, Response } from 'express';
import { SavedViewsService } from '../services/saved-views.service';
import { CreateSavedViewDTO, RenameSavedViewDTO } from '../dtos/saved-views.dto';

export class SavedViewsController {
  private savedViewsService: SavedViewsService;

  constructor() {
    this.savedViewsService = new SavedViewsService();
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const { module, user_id } = req.query as { module: string; user_id?: string };
      
      if (!module) {
        res.status(400).json({ message: 'Module parameter is required' });
        return;
      }

      const views = await this.savedViewsService.getUserViews(module, user_id);
      res.status(200).json({ data: views });
    } catch (error) {
      console.error('Error fetching saved views:', error);
      res.status(500).json({ message: 'Failed to fetch saved views' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateSavedViewDTO;
      const view = await this.savedViewsService.createView(data);
      res.status(201).json(view);
    } catch (error) {
      console.error('Error creating saved view:', error);
      res.status(500).json({ message: 'Failed to create saved view' });
    }
  }

  async rename(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body as RenameSavedViewDTO;
      
      const view = await this.savedViewsService.renameView(id, name);
      
      if (!view) {
        res.status(404).json({ message: 'Saved view not found' });
        return;
      }

      res.status(200).json(view);
    } catch (error) {
      console.error('Error renaming saved view:', error);
      res.status(500).json({ message: 'Failed to rename saved view' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.savedViewsService.deleteView(id);
      
      if (!success) {
        res.status(404).json({ message: 'Saved view not found' });
        return;
      }

      res.status(200).json({ message: 'Saved view deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved view:', error);
      res.status(500).json({ message: 'Failed to delete saved view' });
    }
  }
}
