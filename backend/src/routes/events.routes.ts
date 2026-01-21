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
import { AudienceSegmentsController } from '../controllers/audience-segments.controller';
import { CommunicationSettingsController } from '../controllers/communication-settings.controller';
import { ReportsController } from '../controllers/reports.controller';
import { EventGeneralController } from '../controllers/event-general.controller';
import { EventBrandingController } from '../controllers/event-branding.controller';
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
const audienceSegmentsController = new AudienceSegmentsController();
const communicationSettingsController = new CommunicationSettingsController();
const reportsController = new ReportsController();
const eventGeneralController = new EventGeneralController();
const eventBrandingController = new EventBrandingController();

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

// Event Detail - General Details APIs (Settings Tab)
router.get('/:eventId/general', (req, res) => eventGeneralController.getGeneralDetails(req, res));
router.put('/:eventId/general', (req, res) => eventGeneralController.updateGeneralDetails(req, res));
router.get('/:eventId/media', (req, res) => eventGeneralController.getMedia(req, res));
router.post('/:eventId/media', (req, res) => eventGeneralController.addMedia(req, res));
router.delete('/:eventId/media/:mediaId', (req, res) => eventGeneralController.deleteMedia(req, res));

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

// Event Detail - Communications Tab - Campaigns APIs
router.get('/:eventId/campaigns', (req, res) => campaignsController.getCampaigns(req, res));
router.get('/:eventId/campaigns/stats', (req, res) => campaignsController.getCampaignStats(req, res));
router.get('/:eventId/campaigns/audience-segments', (req, res) => campaignsController.getAudienceSegments(req, res));
router.post('/:eventId/campaigns/preview-audience', (req, res) => campaignsController.previewAudience(req, res));
router.post('/:eventId/campaigns', (req, res) => campaignsController.createCampaign(req, res));
router.get('/:eventId/campaigns/:campaignId', (req, res) => campaignsController.getCampaignById(req, res));
router.put('/:eventId/campaigns/:campaignId', (req, res) => campaignsController.updateCampaign(req, res));
router.delete('/:eventId/campaigns/:campaignId', (req, res) => campaignsController.deleteCampaign(req, res));
router.post('/:eventId/campaigns/:campaignId/duplicate', (req, res) => campaignsController.duplicateCampaign(req, res));
router.post('/:eventId/campaigns/:campaignId/send', (req, res) => campaignsController.sendCampaign(req, res));
router.post('/:eventId/campaigns/:campaignId/schedule', (req, res) => campaignsController.scheduleCampaign(req, res));
router.post('/:eventId/campaigns/:campaignId/pause', (req, res) => campaignsController.pauseCampaign(req, res));
router.post('/:eventId/campaigns/:campaignId/resume', (req, res) => campaignsController.resumeCampaign(req, res));
router.get('/:eventId/campaigns/:campaignId/recipients', (req, res) => campaignsController.getCampaignRecipients(req, res));

// Event Detail - Communications Tab - Templates APIs
router.get('/:eventId/templates', (req, res) => templatesController.getTemplates(req, res));
router.get('/:eventId/templates/variables', (req, res) => templatesController.getVariables(req, res));
router.post('/:eventId/templates', (req, res) => templatesController.createTemplate(req, res));
router.get('/:eventId/templates/:templateId', (req, res) => templatesController.getTemplateById(req, res));
router.put('/:eventId/templates/:templateId', (req, res) => templatesController.updateTemplate(req, res));
router.delete('/:eventId/templates/:templateId', (req, res) => templatesController.deleteTemplate(req, res));
router.post('/:eventId/templates/:templateId/duplicate', (req, res) => templatesController.duplicateTemplate(req, res));

// Event Detail - Communications Tab - Audience Segments APIs
router.get('/:eventId/segments', (req, res) => audienceSegmentsController.getSegments(req, res));
router.get('/:eventId/segments/filter-fields', (req, res) => audienceSegmentsController.getFilterFields(req, res));
router.post('/:eventId/segments/preview', (req, res) => audienceSegmentsController.previewSegment(req, res));
router.post('/:eventId/segments', (req, res) => audienceSegmentsController.createSegment(req, res));
router.get('/:eventId/segments/:segmentId', (req, res) => audienceSegmentsController.getSegmentById(req, res));
router.put('/:eventId/segments/:segmentId', (req, res) => audienceSegmentsController.updateSegment(req, res));
router.delete('/:eventId/segments/:segmentId', (req, res) => audienceSegmentsController.deleteSegment(req, res));
router.get('/:eventId/segments/:segmentId/members', (req, res) => audienceSegmentsController.getSegmentMembers(req, res));
router.post('/:eventId/segments/:segmentId/refresh', (req, res) => audienceSegmentsController.refreshSegment(req, res));

// Event Detail - Communications Tab - Communication Settings APIs
router.get('/:eventId/communication-settings', (req, res) => communicationSettingsController.getSettings(req, res));
router.put('/:eventId/communication-settings', (req, res) => communicationSettingsController.updateSettings(req, res));
router.post('/:eventId/communication-settings/validate', (req, res) => communicationSettingsController.validateSettings(req, res));
router.get('/:eventId/communication-settings/quiet-hours', (req, res) => communicationSettingsController.getQuietHoursStatus(req, res));
router.post('/:eventId/communication-settings/reset', (req, res) => communicationSettingsController.resetSettings(req, res));

// Event Detail - Reports Tab APIs
router.get('/:eventId/reports', (req, res) => reportsController.getReports(req, res));
router.get('/:eventId/reports/data-sources', (req, res) => reportsController.getDataSources(req, res));
router.get('/:eventId/reports/standard', (req, res) => reportsController.getStandardReports(req, res));
router.post('/:eventId/reports', (req, res) => reportsController.createReport(req, res));
router.get('/:eventId/reports/:reportId', (req, res) => reportsController.getReportById(req, res));
router.put('/:eventId/reports/:reportId', (req, res) => reportsController.updateReport(req, res));
router.delete('/:eventId/reports/:reportId', (req, res) => reportsController.deleteReport(req, res));
router.post('/:eventId/reports/:reportId/run', (req, res) => reportsController.runReport(req, res));
router.get('/:eventId/reports/:reportId/export', (req, res) => reportsController.exportReportCSV(req, res));
router.get('/:eventId/reports/:reportId/runs', (req, res) => reportsController.getReportRuns(req, res));
router.post('/:eventId/reports/standard/:standardReportId/run', (req, res) => reportsController.runStandardReport(req, res));

// Event Detail - Settings Tab - Branding APIs
router.get('/:eventId/branding', (req, res) => eventBrandingController.getBranding(req, res));
router.put('/:eventId/branding', (req, res) => eventBrandingController.updateBranding(req, res));
router.post('/:eventId/branding/reset', (req, res) => eventBrandingController.resetBranding(req, res));

export default router;
