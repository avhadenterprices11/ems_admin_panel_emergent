import { Router } from 'express';
import { MasterDataController } from '../controllers/master-data.controller';

const router = Router();
const masterDataController = new MasterDataController();

// Categories
router.get('/categories', (req, res) => masterDataController.getCategories(req, res));
router.post('/categories', (req, res) => masterDataController.createCategory(req, res));
router.put('/categories/:id', (req, res) => masterDataController.updateCategory(req, res));
router.delete('/categories/:id', (req, res) => masterDataController.deleteCategory(req, res));

// Tags
router.get('/tags', (req, res) => masterDataController.getTags(req, res));
router.post('/tags', (req, res) => masterDataController.createTag(req, res));
router.put('/tags/:id', (req, res) => masterDataController.updateTag(req, res));
router.delete('/tags/:id', (req, res) => masterDataController.deleteTag(req, res));

// Users (for dropdowns)
router.get('/users', (req, res) => masterDataController.getUsers(req, res));

export default router;
