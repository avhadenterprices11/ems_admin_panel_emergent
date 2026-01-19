import { Request, Response } from 'express';
import { MasterDataService } from '../services/master-data.service';

const masterDataService = new MasterDataService();

export class MasterDataController {
  // ============ CATEGORIES ============
  
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const categories = await masterDataService.getCategories(includeInactive);
      res.status(200).json(categories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch categories' });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ message: 'Category name is required' });
        return;
      }

      const category = await masterDataService.createCategory({ name: name.trim(), description });
      res.status(201).json(category);
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to create category' });
      }
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid category ID' });
        return;
      }

      const category = await masterDataService.updateCategory(id, req.body);
      res.status(200).json(category);
    } catch (error: any) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: error.message || 'Failed to update category' });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid category ID' });
        return;
      }

      await masterDataService.deleteCategory(id);
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: error.message || 'Failed to delete category' });
    }
  }

  // ============ TAGS ============
  
  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const includeInactive = req.query.include_inactive === 'true';
      const tags = await masterDataService.getTags(search, includeInactive);
      res.status(200).json(tags);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch tags' });
    }
  }

  async createTag(req: Request, res: Response): Promise<void> {
    try {
      const { name, color } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ message: 'Tag name is required' });
        return;
      }

      const tag = await masterDataService.createTag({ name: name.trim(), color });
      res.status(201).json(tag);
    } catch (error: any) {
      console.error('Error creating tag:', error);
      if (error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message || 'Failed to create tag' });
      }
    }
  }

  async updateTag(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid tag ID' });
        return;
      }

      const tag = await masterDataService.updateTag(id, req.body);
      res.status(200).json(tag);
    } catch (error: any) {
      console.error('Error updating tag:', error);
      res.status(500).json({ message: error.message || 'Failed to update tag' });
    }
  }

  async deleteTag(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid tag ID' });
        return;
      }

      await masterDataService.deleteTag(id);
      res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ message: error.message || 'Failed to delete tag' });
    }
  }

  // ============ USERS (for dropdowns) ============
  
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await masterDataService.getUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch users' });
    }
  }
}
