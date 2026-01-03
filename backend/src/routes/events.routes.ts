import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { EventOverviewController } from '../controllers/event-overview.controller';
import { TicketsController } from '../controllers/tickets.controller';
import { AddonsController } from '../controllers/addons.controller';
import { PromoCodesController } from '../controllers/promo-codes.controller';
import { EventSettingsController } from '../controllers/event-settings.controller';
import { validateDTO } from '../utils/validation.utils';
import { EventListQueryDTO, BulkActionDTO, EventMetricsQueryDTO } from '../dtos/events.dto';
import { CreateEventDTO } from '../dtos/create-event.dto';

const router = Router();
const eventsController = new EventsController();
const eventOverviewController = new EventOverviewController();
const ticketsController = new TicketsController();
const addonsController = new AddonsController();
const promoCodesController = new PromoCodesController();
const eventSettingsController = new EventSettingsController();

router.post('/', validateDTO(CreateEventDTO), (req, res) => eventsController.create(req, res));

router.get('/', (req, res) => eventsController.list(req, res));

router.get('/metrics', (req, res) => eventsController.getMetrics(req, res));

router.post('/bulk-archive', validateDTO(BulkActionDTO), (req, res) => eventsController.bulkArchive(req, res));

router.post('/bulk-delete', validateDTO(BulkActionDTO), (req, res) => eventsController.bulkDelete(req, res));

// Event Detail - Overview Tab APIs
router.get('/:eventId', (req, res) => eventOverviewController.getEventById(req, res));
router.get('/:eventId/overview/metrics', (req, res) => eventOverviewController.getMetrics(req, res));
router.get('/:eventId/overview/funnel', (req, res) => eventOverviewController.getFunnel(req, res));
router.get('/:eventId/overview/tickets', (req, res) => eventOverviewController.getTicketInventory(req, res));
router.get('/:eventId/overview/alerts', (req, res) => eventOverviewController.getAlerts(req, res));
router.get('/:eventId/overview/activity', (req, res) => eventOverviewController.getActivityTimeline(req, res));

// Event Detail - Tickets Tab APIs (CRUD)
router.get('/:eventId/tickets', (req, res) => ticketsController.getTickets(req, res));
router.get('/:eventId/tickets/stats', (req, res) => ticketsController.getTicketStats(req, res));
router.post('/:eventId/tickets', (req, res) => ticketsController.createTicket(req, res));
router.get('/:eventId/tickets/:ticketId', (req, res) => ticketsController.getTicketById(req, res));
router.put('/:eventId/tickets/:ticketId', (req, res) => ticketsController.updateTicket(req, res));
router.delete('/:eventId/tickets/:ticketId', (req, res) => ticketsController.deleteTicket(req, res));
router.post('/:eventId/tickets/:ticketId/toggle-sales', (req, res) => ticketsController.toggleSales(req, res));
router.post('/:eventId/tickets/:ticketId/end-sales', (req, res) => ticketsController.endSales(req, res));
router.post('/:eventId/tickets/:ticketId/duplicate', (req, res) => ticketsController.duplicateTicket(req, res));

export default router;
