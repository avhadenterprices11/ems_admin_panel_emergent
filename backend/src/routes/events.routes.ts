import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { EventOverviewController } from '../controllers/event-overview.controller';
import { TicketsController } from '../controllers/tickets.controller';
import { AddonsController } from '../controllers/addons.controller';
import { PromoCodesController } from '../controllers/promo-codes.controller';
import { EventSettingsController } from '../controllers/event-settings.controller';
import { RegistrationsController } from '../controllers/registrations.controller';
import { AttendeesController } from '../controllers/attendees.controller';
import { CampaignsController } from '../controllers/campaigns.controller';
import { TemplatesController } from '../controllers/templates.controller';
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
const registrationsController = new RegistrationsController();
const attendeesController = new AttendeesController();
const campaignsController = new CampaignsController();
const templatesController = new TemplatesController();

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

// Event Detail - Add-ons Tab APIs
router.get('/:eventId/addons', (req, res) => addonsController.getAddons(req, res));
router.post('/:eventId/addons', (req, res) => addonsController.createAddon(req, res));
router.get('/:eventId/addons/:addonId', (req, res) => addonsController.getAddonById(req, res));
router.put('/:eventId/addons/:addonId', (req, res) => addonsController.updateAddon(req, res));
router.delete('/:eventId/addons/:addonId', (req, res) => addonsController.deleteAddon(req, res));
router.post('/:eventId/addons/:addonId/toggle', (req, res) => addonsController.toggleStatus(req, res));

// Event Detail - Promo Codes Tab APIs
router.get('/:eventId/promo-codes', (req, res) => promoCodesController.getPromoCodes(req, res));
router.post('/:eventId/promo-codes', (req, res) => promoCodesController.createPromoCode(req, res));
router.get('/:eventId/promo-codes/:promoId', (req, res) => promoCodesController.getPromoCodeById(req, res));
router.put('/:eventId/promo-codes/:promoId', (req, res) => promoCodesController.updatePromoCode(req, res));
router.delete('/:eventId/promo-codes/:promoId', (req, res) => promoCodesController.deletePromoCode(req, res));
router.post('/:eventId/promo-codes/:promoId/toggle', (req, res) => promoCodesController.toggleStatus(req, res));

// Event Detail - Settings Tab APIs
router.get('/:eventId/settings', (req, res) => eventSettingsController.getSettings(req, res));
router.put('/:eventId/settings', (req, res) => eventSettingsController.updateSettings(req, res));

// Event Detail - Registrations Tab APIs
router.get('/:eventId/registrations', (req, res) => registrationsController.getRegistrations(req, res));
router.get('/:eventId/registrations/stats', (req, res) => registrationsController.getRegistrationStats(req, res));
router.post('/:eventId/registrations', (req, res) => registrationsController.createRegistration(req, res));
router.get('/:eventId/registrations/:registrationId', (req, res) => registrationsController.getRegistrationById(req, res));
router.put('/:eventId/registrations/:registrationId', (req, res) => registrationsController.updateRegistration(req, res));
router.delete('/:eventId/registrations/:registrationId', (req, res) => registrationsController.deleteRegistration(req, res));
router.post('/:eventId/registrations/:registrationId/status', (req, res) => registrationsController.updateRegistrationStatus(req, res));
router.post('/:eventId/registrations/:registrationId/payment-status', (req, res) => registrationsController.updatePaymentStatus(req, res));

// Event Detail - Attendees & Check-in Tab APIs
router.get('/:eventId/attendees', (req, res) => attendeesController.getAttendees(req, res));
router.get('/:eventId/attendees/metrics', (req, res) => attendeesController.getCheckinMetrics(req, res));
router.get('/:eventId/attendees/devices', (req, res) => attendeesController.getActiveDevices(req, res));
router.get('/:eventId/attendees/locations', (req, res) => attendeesController.getLocationStats(req, res));
router.post('/:eventId/attendees', (req, res) => attendeesController.createAttendee(req, res));
router.post('/:eventId/attendees/sync', (req, res) => attendeesController.syncAttendees(req, res));
router.post('/:eventId/attendees/qr-checkin', (req, res) => attendeesController.qrCheckin(req, res));
router.get('/:eventId/attendees/:attendeeId', (req, res) => attendeesController.getAttendeeById(req, res));
router.post('/:eventId/attendees/:attendeeId/checkin', (req, res) => attendeesController.manualCheckin(req, res));
router.post('/:eventId/attendees/:attendeeId/undo-checkin', (req, res) => attendeesController.undoCheckin(req, res));
router.put('/devices/:deviceId/status', (req, res) => attendeesController.updateDeviceStatus(req, res));

export default router;
