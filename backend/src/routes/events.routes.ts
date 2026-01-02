import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { validateDTO } from '../utils/validation.utils';
import { EventListQueryDTO, BulkActionDTO, EventMetricsQueryDTO } from '../dtos/events.dto';
import { CreateEventDTO } from '../dtos/create-event.dto';

const router = Router();
const eventsController = new EventsController();

router.post('/', validateDTO(CreateEventDTO), (req, res) => eventsController.create(req, res));

router.get('/', (req, res) => eventsController.list(req, res));

router.get('/metrics', (req, res) => eventsController.getMetrics(req, res));

router.post('/bulk-archive', validateDTO(BulkActionDTO), (req, res) => eventsController.bulkArchive(req, res));

router.post('/bulk-delete', validateDTO(BulkActionDTO), (req, res) => eventsController.bulkDelete(req, res));

export default router;
