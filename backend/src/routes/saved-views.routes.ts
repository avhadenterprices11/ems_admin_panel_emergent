import { Router } from 'express';
import { SavedViewsController } from '../controllers/saved-views.controller';
import { validateDTO } from '../utils/validation.utils';
import { CreateSavedViewDTO, RenameSavedViewDTO } from '../dtos/saved-views.dto';

const router = Router();
const savedViewsController = new SavedViewsController();

router.get('/', (req, res) => savedViewsController.list(req, res));

router.post('/', validateDTO(CreateSavedViewDTO), (req, res) => savedViewsController.create(req, res));

router.put('/:id', validateDTO(RenameSavedViewDTO), (req, res) => savedViewsController.rename(req, res));

router.delete('/:id', (req, res) => savedViewsController.delete(req, res));

export default router;
