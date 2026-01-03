import { apiClient } from './config';

export interface EventsListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tab?: string;
  type?: string;
  location?: string;
  owner?: string;
  status?: string;
  registrationStatus?: string;
  attendanceMin?: number;
  attendanceMax?: number;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface EventMetricsParams {
  startDateFrom?: string;
  startDateTo?: string;
  tab?: string;
}

export interface OverviewMetrics {
  totalRegistrations: number;
  registrationsChange: number;
  grossRevenue: number;
  revenueChange: number;
  pageViews: number;
  pageViewsChange: number;
  conversionRate: number;
  conversionRateChange: number;
}

export interface FunnelData {
  pageViews: number;
  addToCart: number;
  checkoutStarted: number;
  completedRegistration: number;
}

export interface TicketInventory {
  id: number;
  name: string;
  sold: number;
  total: number;
  status: string;
}

export interface AttentionAlert {
  type: 'warning' | 'error' | 'info';
  text: string;
  category: string;
}

export interface ActivityLog {
  id: number;
  actorType: string;
  actorId: number | null;
  actionType: string;
  description: string;
  createdAt: string;
  metadata: any;
}

// Ticket interfaces
export interface Ticket {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  capacity?: number;
  sold_count: number;
  status: string;
  ticket_type: string;
  category: string;
  min_per_order: number;
  max_per_order: number;
  is_visible: boolean;
  is_on_sale: boolean;
  internal_notes?: string;
  sales_start_at?: string;
  sales_end_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface TicketStats {
  totalSales: number;
  ticketsSold: number;
  totalCapacity: number;
  addonRevenue: number;
  avgOrderValue: number;
}

export interface CreateTicketInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  capacity?: number;
  category?: string;
  min_per_order?: number;
  max_per_order?: number;
  is_visible?: boolean;
  is_on_sale?: boolean;
  internal_notes?: string;
  sales_start_at?: string;
  sales_end_at?: string;
}

export interface UpdateTicketInput {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  capacity?: number;
  category?: string;
  min_per_order?: number;
  max_per_order?: number;
  is_visible?: boolean;
  is_on_sale?: boolean;
  internal_notes?: string;
  sales_start_at?: string;
  sales_end_at?: string;
  status?: string;
}

// Add-on interfaces
export interface Addon {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  addon_type: string;
  price: number;
  currency: string;
  unlimited_quantity: boolean;
  quantity_limit?: number;
  quantity_sold: number;
  per_order_limit?: number;
  is_active: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateAddonInput {
  name: string;
  description?: string;
  addon_type?: string;
  price: number;
  currency?: string;
  unlimited_quantity?: boolean;
  quantity_limit?: number;
  per_order_limit?: number;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface UpdateAddonInput {
  name?: string;
  description?: string;
  addon_type?: string;
  price?: number;
  currency?: string;
  unlimited_quantity?: boolean;
  quantity_limit?: number;
  per_order_limit?: number;
  is_active?: boolean;
  is_visible?: boolean;
}

// Promo Code interfaces
export interface PromoCode {
  id: number;
  event_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
  applicable_to: string;
  applicable_items?: number[];
  usage_limit?: number;
  usage_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreatePromoCodeInput {
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
  applicable_to?: string;
  applicable_items?: number[];
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface UpdatePromoCodeInput {
  code?: string;
  discount_type?: string;
  discount_value?: number;
  max_discount_amount?: number;
  min_order_value?: number;
  applicable_to?: string;
  applicable_items?: number[];
  usage_limit?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

// Event Settings interfaces
export interface EventSettings {
  id: number;
  event_id: number;
  pass_fees_to_attendees: boolean;
  charge_tax: boolean;
  tax_type?: string;
  tax_rate?: number;
  refund_policy: string;
  refund_deadline_days?: number;
  refund_percentage?: number;
  allow_transfers: boolean;
  allow_cancellations: boolean;
  lock_changes_after_event_start: boolean;
  hide_sold_out_tickets: boolean;
  auto_hide_past_tickets: boolean;
  approval_mode: string;
  pending_approval_expiry_hours?: number;
  auto_send_confirmation: boolean;
  attach_invoice: boolean;
  show_tax_breakdown: boolean;
  stop_sales_when_full: boolean;
  allow_admin_overselling: boolean;
  auto_enable_waitlist: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateEventSettingsInput {
  pass_fees_to_attendees?: boolean;
  charge_tax?: boolean;
  tax_type?: string;
  tax_rate?: number;
  refund_policy?: string;
  refund_deadline_days?: number;
  refund_percentage?: number;
  allow_transfers?: boolean;
  allow_cancellations?: boolean;
  lock_changes_after_event_start?: boolean;
  hide_sold_out_tickets?: boolean;
  auto_hide_past_tickets?: boolean;
  approval_mode?: string;
  pending_approval_expiry_hours?: number;
  auto_send_confirmation?: boolean;
  attach_invoice?: boolean;
  show_tax_breakdown?: boolean;
  stop_sales_when_full?: boolean;
  allow_admin_overselling?: boolean;
  auto_enable_waitlist?: boolean;
}

// Registration interfaces
export interface Registration {
  id: number;
  event_id: number;
  user_id?: number;
  registrant_name?: string;
  registrant_email?: string;
  registrant_phone?: string;
  ticket_id?: number;
  quantity: number;
  status: string;
  registration_source: string;
  payment_status?: string;
  payment_method?: string;
  total_amount: number;
  currency: string;
  registration_code?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  ticket_name?: string;
}

export interface RegistrationListParams {
  status?: string;
  payment_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegistrationListResponse {
  registrations: Registration[];
  total: number;
  page: number;
  limit: number;
}

export interface RegistrationStats {
  total: number;
  pending: number;
  incomplete: number;
  cancelled: number;
  approved: number;
}

export interface CreateRegistrationInput {
  registrant_name: string;
  registrant_email: string;
  registrant_phone?: string;
  ticket_id?: number;
  quantity?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  total_amount?: number;
}

export interface UpdateRegistrationInput {
  registrant_name?: string;
  registrant_email?: string;
  registrant_phone?: string;
  ticket_id?: number;
  quantity?: number;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  total_amount?: number;
}

// Attendees & Check-in interfaces
export interface Attendee {
  id: number;
  event_id: number;
  registration_id?: number;
  ticket_id?: number;
  attendee_name: string;
  attendee_email?: string;
  qr_code_value: string;
  checkin_status: string;
  checkin_time?: string;
  checkin_source?: string;
  checkin_location?: string;
  checkin_device_id?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  ticket_name?: string;
  device_name?: string;
}

export interface AttendeeListParams {
  checkin_status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AttendeeListResponse {
  attendees: Attendee[];
  total: number;
  page: number;
  limit: number;
}

export interface CheckinMetrics {
  total_registrations: number;
  total_checked_in: number;
  total_not_checked_in: number;
  no_show_count: number;
  no_show_rate: number;
  checkin_percentage: number;
  peak_checkin_time?: string;
  last_checkin_time?: string;
  last_checkin_ago?: string;
}

export interface CheckinDevice {
  id: number;
  event_id: number;
  device_name: string;
  device_type?: string;
  location?: string;
  total_scans: number;
  last_seen_at?: string;
  battery_level?: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface LocationStats {
  location: string;
  checkin_count: number;
  last_checkin?: string;
  last_checkin_ago?: string;
}

export interface QRCheckinInput {
  qr_code: string;
  device_id?: number;
  device_name?: string;
  location?: string;
}

export interface CheckinResult {
  success: boolean;
  message: string;
  attendee?: Attendee;
}

// Communications - Campaign interfaces
export interface Campaign {
  id: number;
  event_id: number;
  name: string;
  channel: 'email' | 'sms';
  campaign_type: 'one-time' | 'trigger-based';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  template_id?: number;
  subject?: string;
  content?: string;
  audience_rule?: AudienceRule;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CampaignStats {
  totalCampaigns: number;
  sentCampaigns: number;
  scheduledCampaigns: number;
  draftCampaigns: number;
  totalRecipients: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export interface AudienceRule {
  type: 'all' | 'vip' | 'not_checked_in' | 'checked_in' | 'ticket_type' | 'custom';
  ticket_ids?: number[];
  custom_filter?: any;
}

export interface AudienceSegment {
  name: string;
  type: string;
  count: number;
}

export interface CreateCampaignInput {
  name: string;
  channel: 'email' | 'sms';
  campaign_type?: 'one-time' | 'trigger-based';
  template_id?: number;
  subject?: string;
  content?: string;
  audience_rule?: AudienceRule;
  scheduled_at?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  channel?: 'email' | 'sms';
  campaign_type?: 'one-time' | 'trigger-based';
  template_id?: number;
  subject?: string;
  content?: string;
  audience_rule?: AudienceRule;
  scheduled_at?: string;
  status?: string;
}

// Communications - Template interfaces
export interface MessageTemplate {
  id: number;
  event_id: number;
  name: string;
  channel: 'email' | 'sms';
  subject?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateTemplateInput {
  name: string;
  channel: 'email' | 'sms';
  subject?: string;
  content: string;
}

export interface UpdateTemplateInput {
  name?: string;
  channel?: 'email' | 'sms';
  subject?: string;
  content?: string;
}

export interface VariableCategory {
  category: string;
  variables: { name: string; code: string }[];
}

export const eventsAPI = {
  getEvents: async (params: EventsListParams) => {
    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  getMetrics: async (params: EventMetricsParams) => {
    const response = await apiClient.get('/events/metrics', { params });
    return response.data;
  },

  createEvent: async (eventData: any) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  // Get single event by ID
  getEventById: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },

  // Event Overview APIs
  getOverviewMetrics: async (eventId: number | string, params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get(`/events/${eventId}/overview/metrics`, { params });
    return response.data as OverviewMetrics;
  },

  getRegistrationFunnel: async (eventId: number | string, params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get(`/events/${eventId}/overview/funnel`, { params });
    return response.data as FunnelData;
  },

  getTicketInventory: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/overview/tickets`);
    return response.data as TicketInventory[];
  },

  getAttentionAlerts: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/overview/alerts`);
    return response.data as AttentionAlert[];
  },

  getActivityTimeline: async (eventId: number | string, limit?: number) => {
    const response = await apiClient.get(`/events/${eventId}/overview/activity`, { params: { limit } });
    return response.data as ActivityLog[];
  },

  uploadFile: async (file: File, folder: string = 'events') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const response = await apiClient.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  uploadMultipleFiles: async (files: File[], folder: string = 'events') => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);
    const response = await apiClient.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  },

  bulkArchive: async (eventIds: string[]) => {
    const response = await apiClient.post('/events/bulk-archive', { eventIds });
    return response.data;
  },

  bulkDelete: async (eventIds: string[]) => {
    const response = await apiClient.post('/events/bulk-delete', { eventIds });
    return response.data;
  },

  // Tickets Tab APIs (CRUD)
  getTickets: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/tickets`);
    return response.data as Ticket[];
  },

  getTicketStats: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/tickets/stats`);
    return response.data as TicketStats;
  },

  getTicketById: async (eventId: number | string, ticketId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/tickets/${ticketId}`);
    return response.data as Ticket;
  },

  createTicket: async (eventId: number | string, ticketData: CreateTicketInput) => {
    const response = await apiClient.post(`/events/${eventId}/tickets`, ticketData);
    return response.data as Ticket;
  },

  updateTicket: async (eventId: number | string, ticketId: number | string, ticketData: UpdateTicketInput) => {
    const response = await apiClient.put(`/events/${eventId}/tickets/${ticketId}`, ticketData);
    return response.data as Ticket;
  },

  deleteTicket: async (eventId: number | string, ticketId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/tickets/${ticketId}`);
    return response.data;
  },

  toggleTicketSales: async (eventId: number | string, ticketId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/tickets/${ticketId}/toggle-sales`);
    return response.data as Ticket;
  },

  endTicketSales: async (eventId: number | string, ticketId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/tickets/${ticketId}/end-sales`);
    return response.data as Ticket;
  },

  duplicateTicket: async (eventId: number | string, ticketId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/tickets/${ticketId}/duplicate`);
    return response.data as Ticket;
  },

  // Add-ons Tab APIs
  getAddons: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/addons`);
    return response.data as Addon[];
  },

  getAddonById: async (eventId: number | string, addonId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/addons/${addonId}`);
    return response.data as Addon;
  },

  createAddon: async (eventId: number | string, addonData: CreateAddonInput) => {
    const response = await apiClient.post(`/events/${eventId}/addons`, addonData);
    return response.data as Addon;
  },

  updateAddon: async (eventId: number | string, addonId: number | string, addonData: UpdateAddonInput) => {
    const response = await apiClient.put(`/events/${eventId}/addons/${addonId}`, addonData);
    return response.data as Addon;
  },

  deleteAddon: async (eventId: number | string, addonId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/addons/${addonId}`);
    return response.data;
  },

  toggleAddonStatus: async (eventId: number | string, addonId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/addons/${addonId}/toggle`);
    return response.data as Addon;
  },

  // Promo Codes Tab APIs
  getPromoCodes: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/promo-codes`);
    return response.data as PromoCode[];
  },

  getPromoCodeById: async (eventId: number | string, promoId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/promo-codes/${promoId}`);
    return response.data as PromoCode;
  },

  createPromoCode: async (eventId: number | string, promoData: CreatePromoCodeInput) => {
    const response = await apiClient.post(`/events/${eventId}/promo-codes`, promoData);
    return response.data as PromoCode;
  },

  updatePromoCode: async (eventId: number | string, promoId: number | string, promoData: UpdatePromoCodeInput) => {
    const response = await apiClient.put(`/events/${eventId}/promo-codes/${promoId}`, promoData);
    return response.data as PromoCode;
  },

  deletePromoCode: async (eventId: number | string, promoId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/promo-codes/${promoId}`);
    return response.data;
  },

  togglePromoCodeStatus: async (eventId: number | string, promoId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/promo-codes/${promoId}/toggle`);
    return response.data as PromoCode;
  },

  // Event Settings Tab APIs
  getEventSettings: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/settings`);
    return response.data as EventSettings;
  },

  updateEventSettings: async (eventId: number | string, settingsData: UpdateEventSettingsInput) => {
    const response = await apiClient.put(`/events/${eventId}/settings`, settingsData);
    return response.data as EventSettings;
  },

  // Registrations Tab APIs
  getRegistrations: async (eventId: number | string, params?: RegistrationListParams) => {
    const response = await apiClient.get(`/events/${eventId}/registrations`, { params });
    return response.data as RegistrationListResponse;
  },

  getRegistrationStats: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/registrations/stats`);
    return response.data as RegistrationStats;
  },

  getRegistrationById: async (eventId: number | string, registrationId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/registrations/${registrationId}`);
    return response.data as Registration;
  },

  createRegistration: async (eventId: number | string, registrationData: CreateRegistrationInput) => {
    const response = await apiClient.post(`/events/${eventId}/registrations`, registrationData);
    return response.data as Registration;
  },

  updateRegistration: async (eventId: number | string, registrationId: number | string, registrationData: UpdateRegistrationInput) => {
    const response = await apiClient.put(`/events/${eventId}/registrations/${registrationId}`, registrationData);
    return response.data as Registration;
  },

  updateRegistrationStatus: async (eventId: number | string, registrationId: number | string, status: string) => {
    const response = await apiClient.post(`/events/${eventId}/registrations/${registrationId}/status`, { status });
    return response.data as Registration;
  },

  updateRegistrationPaymentStatus: async (eventId: number | string, registrationId: number | string, payment_status: string) => {
    const response = await apiClient.post(`/events/${eventId}/registrations/${registrationId}/payment-status`, { payment_status });
    return response.data as Registration;
  },

  deleteRegistration: async (eventId: number | string, registrationId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/registrations/${registrationId}`);
    return response.data;
  },

  // Attendees & Check-in Tab APIs
  getAttendees: async (eventId: number | string, params?: AttendeeListParams) => {
    const response = await apiClient.get(`/events/${eventId}/attendees`, { params });
    return response.data as AttendeeListResponse;
  },

  getAttendeeById: async (eventId: number | string, attendeeId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/attendees/${attendeeId}`);
    return response.data as Attendee;
  },

  getCheckinMetrics: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/attendees/metrics`);
    return response.data as CheckinMetrics;
  },

  getActiveDevices: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/attendees/devices`);
    return response.data as CheckinDevice[];
  },

  getLocationStats: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/attendees/locations`);
    return response.data as LocationStats[];
  },

  createAttendee: async (eventId: number | string, attendee_name: string, attendee_email?: string, ticket_id?: number) => {
    const response = await apiClient.post(`/events/${eventId}/attendees`, { attendee_name, attendee_email, ticket_id });
    return response.data as Attendee;
  },

  syncAttendees: async (eventId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/attendees/sync`);
    return response.data as { message: string; count: number };
  },

  qrCheckin: async (eventId: number | string, input: QRCheckinInput) => {
    const response = await apiClient.post(`/events/${eventId}/attendees/qr-checkin`, input);
    return response.data as CheckinResult;
  },

  manualCheckin: async (eventId: number | string, attendeeId: number | string, location?: string) => {
    const response = await apiClient.post(`/events/${eventId}/attendees/${attendeeId}/checkin`, { location });
    return response.data as CheckinResult;
  },

  undoCheckin: async (eventId: number | string, attendeeId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/attendees/${attendeeId}/undo-checkin`);
    return response.data as CheckinResult;
  },

  updateDeviceStatus: async (deviceId: number | string, status: string, battery_level?: number) => {
    const response = await apiClient.put(`/events/devices/${deviceId}/status`, { status, battery_level });
    return response.data as CheckinDevice;
  },

  // Communications - Campaigns APIs
  getCampaigns: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/campaigns`);
    return response.data as Campaign[];
  },

  getCampaignStats: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/campaigns/stats`);
    return response.data as CampaignStats;
  },

  getCampaignById: async (eventId: number | string, campaignId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/campaigns/${campaignId}`);
    return response.data as Campaign;
  },

  createCampaign: async (eventId: number | string, data: CreateCampaignInput) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns`, data);
    return response.data as Campaign;
  },

  updateCampaign: async (eventId: number | string, campaignId: number | string, data: UpdateCampaignInput) => {
    const response = await apiClient.put(`/events/${eventId}/campaigns/${campaignId}`, data);
    return response.data as Campaign;
  },

  deleteCampaign: async (eventId: number | string, campaignId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/campaigns/${campaignId}`);
    return response.data;
  },

  duplicateCampaign: async (eventId: number | string, campaignId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns/${campaignId}/duplicate`);
    return response.data as Campaign;
  },

  sendCampaign: async (eventId: number | string, campaignId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns/${campaignId}/send`);
    return response.data as { success: boolean; message: string; recipientCount: number };
  },

  scheduleCampaign: async (eventId: number | string, campaignId: number | string, scheduled_at: string) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns/${campaignId}/schedule`, { scheduled_at });
    return response.data as Campaign;
  },

  pauseCampaign: async (eventId: number | string, campaignId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns/${campaignId}/pause`);
    return response.data as Campaign;
  },

  resumeCampaign: async (eventId: number | string, campaignId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns/${campaignId}/resume`);
    return response.data as Campaign;
  },

  getAudienceSegments: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/campaigns/audience-segments`);
    return response.data as AudienceSegment[];
  },

  previewAudience: async (eventId: number | string, audience_rule: AudienceRule) => {
    const response = await apiClient.post(`/events/${eventId}/campaigns/preview-audience`, { audience_rule });
    return response.data as { count: number };
  },

  // Communications - Templates APIs
  getTemplates: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/templates`);
    return response.data as MessageTemplate[];
  },

  getTemplateById: async (eventId: number | string, templateId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/templates/${templateId}`);
    return response.data as MessageTemplate;
  },

  createTemplate: async (eventId: number | string, data: CreateTemplateInput) => {
    const response = await apiClient.post(`/events/${eventId}/templates`, data);
    return response.data as MessageTemplate;
  },

  updateTemplate: async (eventId: number | string, templateId: number | string, data: UpdateTemplateInput) => {
    const response = await apiClient.put(`/events/${eventId}/templates/${templateId}`, data);
    return response.data as MessageTemplate;
  },

  deleteTemplate: async (eventId: number | string, templateId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/templates/${templateId}`);
    return response.data;
  },

  duplicateTemplate: async (eventId: number | string, templateId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/templates/${templateId}/duplicate`);
    return response.data as MessageTemplate;
  },

  getTemplateVariables: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/templates/variables`);
    return response.data as VariableCategory[];
  },

  // Communications - Audience Segments APIs
  getSegments: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/segments`);
    return response.data as AudienceSegment[];
  },

  getSegmentById: async (eventId: number | string, segmentId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/segments/${segmentId}`);
    return response.data as AudienceSegment;
  },

  createSegment: async (eventId: number | string, data: CreateSegmentInput) => {
    const response = await apiClient.post(`/events/${eventId}/segments`, data);
    return response.data as AudienceSegment;
  },

  updateSegment: async (eventId: number | string, segmentId: number | string, data: UpdateSegmentInput) => {
    const response = await apiClient.put(`/events/${eventId}/segments/${segmentId}`, data);
    return response.data as AudienceSegment;
  },

  deleteSegment: async (eventId: number | string, segmentId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/segments/${segmentId}`);
    return response.data;
  },

  previewSegment: async (eventId: number | string, rules_json: SegmentRule[], match_type: 'ALL' | 'ANY', limit?: number) => {
    const response = await apiClient.post(`/events/${eventId}/segments/preview`, { rules_json, match_type, limit });
    return response.data as { members: SegmentMember[]; total: number };
  },

  getSegmentMembers: async (eventId: number | string, segmentId: number | string, page?: number, limit?: number) => {
    const response = await apiClient.get(`/events/${eventId}/segments/${segmentId}/members`, { params: { page, limit } });
    return response.data as { members: SegmentMember[]; total: number };
  },

  refreshSegment: async (eventId: number | string, segmentId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/segments/${segmentId}/refresh`);
    return response.data as AudienceSegment;
  },

  getFilterFields: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/segments/filter-fields`);
    return response.data as FilterField[];
  },

  // Communications - Settings APIs
  getCommunicationSettings: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/communication-settings`);
    return response.data as CommunicationSettings;
  },

  updateCommunicationSettings: async (eventId: number | string, data: UpdateCommunicationSettingsInput) => {
    const response = await apiClient.put(`/events/${eventId}/communication-settings`, data);
    return response.data as CommunicationSettings;
  },

  validateCommunicationSettings: async (eventId: number | string, channel: 'email' | 'sms') => {
    const response = await apiClient.post(`/events/${eventId}/communication-settings/validate`, { channel });
    return response.data as { valid: boolean; errors: string[]; warnings: string[] };
  },

  getQuietHoursStatus: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/communication-settings/quiet-hours`);
    return response.data as { inQuietHours: boolean; startTime?: string; endTime?: string };
  },

  resetCommunicationSettings: async (eventId: number | string) => {
    const response = await apiClient.post(`/events/${eventId}/communication-settings/reset`);
    return response.data as CommunicationSettings;
  },
};

export const savedViewsAPI = {
  getViews: async (module: string) => {
    const response = await apiClient.get('/saved-views', { params: { module } });
    return response.data;
  },

  createView: async (name: string, module: string, configuration: any) => {
    const response = await apiClient.post('/saved-views', { name, module, configuration });
    return response.data;
  },

  renameView: async (id: number, name: string) => {
    const response = await apiClient.put(`/saved-views/${id}`, { name });
    return response.data;
  },

  deleteView: async (id: number) => {
    const response = await apiClient.delete(`/saved-views/${id}`);
    return response.data;
  },
};
