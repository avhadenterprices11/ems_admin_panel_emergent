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

// Audience Segments interfaces
export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface AudienceSegment {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  match_type: 'ALL' | 'ANY';
  rules_json: SegmentRule[];
  estimated_count: number;
  is_active: boolean;
  last_evaluated_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateSegmentInput {
  name: string;
  description?: string;
  match_type: 'ALL' | 'ANY';
  rules_json: SegmentRule[];
  is_active?: boolean;
}

export interface UpdateSegmentInput {
  name?: string;
  description?: string;
  match_type?: 'ALL' | 'ANY';
  rules_json?: SegmentRule[];
  is_active?: boolean;
}

export interface SegmentMember {
  attendee_id: number;
  attendee_name: string;
  attendee_email?: string;
  ticket_name?: string;
  checkin_status: string;
  registration_status?: string;
}

export interface FilterField {
  field: string;
  label: string;
  type: string;
  operators: string[];
}

// Communication Settings interfaces
export interface CommunicationSettings {
  id: number;
  event_id: number;
  default_sender_name?: string;
  reply_to_email?: string;
  sms_sender_id?: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  opt_out_enabled: boolean;
  track_opens: boolean;
  track_clicks: boolean;
  unsubscribe_page_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateCommunicationSettingsInput {
  default_sender_name?: string;
  reply_to_email?: string;
  sms_sender_id?: string;
  email_enabled?: boolean;
  sms_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  opt_out_enabled?: boolean;
  track_opens?: boolean;
  track_clicks?: boolean;
  unsubscribe_page_url?: string;
}

// Reports interfaces
export interface Report {
  id: number;
  event_id?: number;
  name: string;
  description?: string;
  category?: string;
  data_scope: string;
  visualization_type: string;
  config_json?: any;
  visibility: string;
  schedule_enabled: boolean;
  schedule_frequency?: string;
  schedule_recipients?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ReportField {
  id: string;
  name: string;
  column: string;
  type: string;
}

export interface ReportDataSource {
  id: string;
  name: string;
  table: string;
  alias: string;
  fields: ReportField[];
}

export interface StandardReport {
  id: string;
  name: string;
  description: string;
  category: string;
  visualization: string;
}

export interface ReportRun {
  id: number;
  report_id: number;
  executed_at: string;
  status: string;
  result_snapshot_json?: any;
  row_count: number;
  execution_time_ms?: number;
  error_message?: string;
  executed_by?: number;
}

export interface ReportRunResult {
  success: boolean;
  data: Record<string, any>[];
  total: number;
  execution_time_ms: number;
  run_id: number;
}

export interface CreateReportInput {
  name: string;
  description?: string;
  category?: string;
  data_scope?: string;
  visualization_type?: string;
  config_json?: any;
  visibility?: string;
  schedule_enabled?: boolean;
  schedule_frequency?: string;
  schedule_recipients?: string;
  selected_fields?: string[];
  filters?: { field: string; operator: string; value?: string; logic_operator?: string }[];
  group_by?: string;
}

export interface UpdateReportInput {
  name?: string;
  description?: string;
  category?: string;
  data_scope?: string;
  visualization_type?: string;
  config_json?: any;
  visibility?: string;
  schedule_enabled?: boolean;
  schedule_frequency?: string;
  schedule_recipients?: string;
}

// Master Data Interfaces
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  is_active: boolean;
}

export interface UserBasic {
  id: number;
  name: string;
  email: string;
}

export interface EventMedia {
  id: number;
  event_id: number;
  file_key: string;
  url: string;
  file_type: string;
  media_type: string;
  size?: number;
  original_name?: string;
  sort_order: number;
}

// Event General Details Interfaces
export interface EventGeneralDetails {
  id: number;
  event_code: string;
  name: string;
  description?: string;
  category_id?: number;
  category?: { id: number; name: string; slug: string };
  type: string;
  event_type?: string;
  visibility: string;
  check_in_mode?: string;
  owner: string;
  co_hosts?: { id: number; user_id: number; role: string; name: string; email: string }[];
  tags?: Tag[];
  start_date: string;
  end_date: string;
  all_day: boolean;
  timezone?: string;
  reg_start_at?: string;
  reg_end_at?: string;
  capacity?: number;
  waitlist_enabled: boolean;
  mode?: string;
  venue_id?: string;
  venue_name?: string;
  location?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  meeting_url?: string;
  banner_image_url?: string;
  promo_video_url?: string;
  gallery_images?: any[];
  event_media?: EventMedia[];
  accessibility_notes?: string;
  emergency_contact?: string;
  agenda?: any[];
}

export interface UpdateEventGeneralDetailsInput {
  name?: string;
  description?: string;
  category_id?: number;
  type?: string;
  event_type?: string;
  visibility?: string;
  check_in_mode?: string;
  owner?: string;
  tag_ids?: number[];
  cohost_ids?: number[];
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  timezone?: string;
  reg_start_at?: string;
  reg_end_at?: string;
  capacity?: number;
  waitlist_enabled?: boolean;
  mode?: string;
  venue_id?: string;
  venue_name?: string;
  location?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  meeting_url?: string;
  virtual_platform?: string;
  banner_image_url?: string;
  promo_video_url?: string;
  gallery_images?: any[];
  accessibility_notes?: string;
  emergency_contact?: string;
  agenda?: any[];
  partners?: any[];
  sponsors?: any[];
  internal_notes?: string;
  lifecycle_status?: string;
  meta_title?: string;
  meta_description?: string;
  url_slug?: string;
}

// Event Branding Interfaces
export interface EventBranding {
  id: number;
  event_id: number;
  light_logo_url: string | null;
  dark_logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  updated_at: string;
  updated_by: string | null;
  created_at: string;
}

export interface UpdateEventBrandingInput {
  light_logo_url?: string | null;
  dark_logo_url?: string | null;
  cover_image_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

// Payment & Tax Settings Interfaces
export interface PaymentTaxSettings {
  id: number;
  event_id: number | null;
  currency: string;
  stripe_enabled: boolean;
  razorpay_enabled: boolean;
  offline_enabled: boolean;
  tax_enabled: boolean;
  tax_name: string;
  tax_percentage: number;
  legal_entity_name: string | null;
  billing_address: string | null;
  tax_id: string | null;
  updated_at: string;
  updated_by: string | null;
  created_at: string;
}

export interface UpdatePaymentTaxInput {
  currency?: string;
  stripe_enabled?: boolean;
  razorpay_enabled?: boolean;
  offline_enabled?: boolean;
  tax_enabled?: boolean;
  tax_name?: string;
  tax_percentage?: number;
  legal_entity_name?: string | null;
  billing_address?: string | null;
  tax_id?: string | null;
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

  // Reports APIs
  getReports: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/reports`);
    return response.data as Report[];
  },

  getReportById: async (eventId: number | string, reportId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/reports/${reportId}`);
    return response.data as Report;
  },

  createReport: async (eventId: number | string, data: CreateReportInput) => {
    const response = await apiClient.post(`/events/${eventId}/reports`, data);
    return response.data as Report;
  },

  updateReport: async (eventId: number | string, reportId: number | string, data: UpdateReportInput) => {
    const response = await apiClient.put(`/events/${eventId}/reports/${reportId}`, data);
    return response.data as Report;
  },

  deleteReport: async (eventId: number | string, reportId: number | string) => {
    const response = await apiClient.delete(`/events/${eventId}/reports/${reportId}`);
    return response.data;
  },

  runReport: async (eventId: number | string, reportId: number | string, options?: { date_from?: string; date_to?: string; limit?: number; offset?: number }) => {
    const response = await apiClient.post(`/events/${eventId}/reports/${reportId}/run`, {}, { params: options });
    return response.data as ReportRunResult;
  },

  exportReportCSV: async (eventId: number | string, reportId: number | string, options?: { date_from?: string; date_to?: string }) => {
    const response = await apiClient.get(`/events/${eventId}/reports/${reportId}/export`, { 
      params: options,
      responseType: 'blob'
    });
    return response.data;
  },

  getReportRuns: async (eventId: number | string, reportId: number | string, limit?: number) => {
    const response = await apiClient.get(`/events/${eventId}/reports/${reportId}/runs`, { params: { limit } });
    return response.data as ReportRun[];
  },

  getDataSources: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/reports/data-sources`);
    return response.data as ReportDataSource[];
  },

  getStandardReports: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/reports/standard`);
    return response.data as StandardReport[];
  },

  runStandardReport: async (eventId: number | string, standardReportId: string, options?: { date_from?: string; date_to?: string }) => {
    const response = await apiClient.post(`/events/${eventId}/reports/standard/${standardReportId}/run`, {}, { params: options });
    return response.data as { success: boolean; data: Record<string, any>[] };
  },

  // Event General Details APIs (Settings Tab)
  getEventGeneralDetails: async (eventId: number | string) => {
    const response = await apiClient.get(`/events/${eventId}/general`);
    return response.data as EventGeneralDetails;
  },

  updateEventGeneralDetails: async (eventId: number | string, data: UpdateEventGeneralDetailsInput) => {
    const response = await apiClient.put(`/events/${eventId}/general`, data);
    return response.data as EventGeneralDetails;
  },

  getEventMedia: async (eventId: number | string, type?: string) => {
    const response = await apiClient.get(`/events/${eventId}/media`, { params: { type } });
    return response.data as EventMedia[];
  },

  addEventMedia: async (eventId: number | string, data: {
    file_key: string;
    url: string;
    file_type: string;
    media_type: string;
    size?: number;
    original_name?: string;
  }) => {
    const response = await apiClient.post(`/events/${eventId}/media`, data);
    return response.data as EventMedia;
  },

  deleteEventMedia: async (eventId: number | string, mediaId: number) => {
    const response = await apiClient.delete(`/events/${eventId}/media/${mediaId}`);
    return response.data;
  },

  // Event Branding APIs (Settings Tab)
  getEventBranding: async (eventId: number | string): Promise<EventBranding> => {
    const response = await apiClient.get(`/events/${eventId}/branding`);
    return response.data as EventBranding;
  },

  updateEventBranding: async (eventId: number | string, data: UpdateEventBrandingInput): Promise<EventBranding> => {
    const response = await apiClient.put(`/events/${eventId}/branding`, data);
    return response.data as EventBranding;
  },

  resetEventBranding: async (eventId: number | string): Promise<EventBranding> => {
    const response = await apiClient.post(`/events/${eventId}/branding/reset`);
    return response.data as EventBranding;
  },

  // Payment & Tax Settings APIs (Settings Tab)
  getPaymentTaxSettings: async (eventId: number | string): Promise<PaymentTaxSettings> => {
    const response = await apiClient.get(`/events/${eventId}/payment-tax`);
    return response.data as PaymentTaxSettings;
  },

  updatePaymentTaxSettings: async (eventId: number | string, data: UpdatePaymentTaxInput): Promise<PaymentTaxSettings> => {
    const response = await apiClient.put(`/events/${eventId}/payment-tax`, data);
    return response.data as PaymentTaxSettings;
  },

  resetPaymentTaxSettings: async (eventId: number | string): Promise<PaymentTaxSettings> => {
    const response = await apiClient.post(`/events/${eventId}/payment-tax/reset`);
    return response.data as PaymentTaxSettings;
  },
};

// Master Data API
export const masterDataAPI = {
  // Categories
  getCategories: async (includeInactive = false) => {
    const response = await apiClient.get('/master/categories', { params: { include_inactive: includeInactive } });
    return response.data as Category[];
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await apiClient.post('/master/categories', data);
    return response.data as Category;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string; is_active?: boolean }) => {
    const response = await apiClient.put(`/master/categories/${id}`, data);
    return response.data as Category;
  },

  deleteCategory: async (id: number) => {
    const response = await apiClient.delete(`/master/categories/${id}`);
    return response.data;
  },

  // Tags
  getTags: async (search?: string, includeInactive = false) => {
    const response = await apiClient.get('/master/tags', { params: { search, include_inactive: includeInactive } });
    return response.data as Tag[];
  },

  createTag: async (data: { name: string; color?: string }) => {
    const response = await apiClient.post('/master/tags', data);
    return response.data as Tag;
  },

  updateTag: async (id: number, data: { name?: string; color?: string; is_active?: boolean }) => {
    const response = await apiClient.put(`/master/tags/${id}`, data);
    return response.data as Tag;
  },

  deleteTag: async (id: number) => {
    const response = await apiClient.delete(`/master/tags/${id}`);
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await apiClient.get('/master/users');
    return response.data as UserBasic[];
  },
};

// Meeting Generation API
export interface MeetingGenerateRequest {
  platform: 'zoom' | 'google-meet';
  topic: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface MeetingGenerateResponse {
  success: boolean;
  meeting_url: string;
  meeting_id: string | null;
  meeting_password: string | null;
  platform: string;
  provider_payload?: any;
}

export interface MeetingIntegrationStatus {
  zoom: boolean;
  googleMeet: boolean;
}

export const meetingAPI = {
  getIntegrationStatus: async (): Promise<MeetingIntegrationStatus> => {
    const response = await apiClient.get('/meetings/status');
    return response.data as MeetingIntegrationStatus;
  },

  generateMeeting: async (data: MeetingGenerateRequest): Promise<MeetingGenerateResponse> => {
    const response = await apiClient.post('/meetings/generate', data);
    return response.data as MeetingGenerateResponse;
  },

  deleteMeeting: async (platform: string, meetingId: string): Promise<void> => {
    await apiClient.delete(`/meetings/${platform}/${meetingId}`);
  },
};

// Badge Design Interfaces
export interface BadgeDesignConfig {
  visible_fields: string[];
  field_positions: Record<string, { x: number; y: number; width?: number }>;
  font_size_scale: number;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  logo_url: string | null;
  show_punch_hole: boolean;
  qr_code_size: number;
}

export interface BadgeDesign {
  id: number;
  event_id: number | null;
  ticket_type_id: number | null;
  name: string;
  is_global_default: boolean;
  is_event_default: boolean;
  badge_size: string;
  custom_width: number | null;
  custom_height: number | null;
  orientation: string;
  design_config: BadgeDesignConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ticket_type_name?: string;
}

export interface CreateBadgeDesignInput {
  ticket_type_id?: number | null;
  name: string;
  is_event_default?: boolean;
  badge_size?: string;
  custom_width?: number | null;
  custom_height?: number | null;
  orientation?: string;
  design_config?: Partial<BadgeDesignConfig>;
  is_active?: boolean;
}

export interface UpdateBadgeDesignInput {
  name?: string;
  is_event_default?: boolean;
  badge_size?: string;
  custom_width?: number | null;
  custom_height?: number | null;
  orientation?: string;
  design_config?: Partial<BadgeDesignConfig>;
  is_active?: boolean;
}

// Booking Interfaces
export interface Booking {
  id: number;
  booking_code: string;
  event_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  promo_code: string | null;
  source: string;
  booked_at: string;
  confirmed_at: string | null;
  created_at: string;
  event_name?: string;
  items?: BookingItem[];
}

export interface BookingItem {
  id: number;
  booking_id: number;
  ticket_id: number | null;
  addon_id: number | null;
  item_type: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
}

export interface CreateBookingInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  payment_method?: string | null;
  promo_code?: string | null;
  source?: string;
  items: { ticket_id?: number; addon_id?: number; item_type: string; item_name: string; quantity: number; unit_price: number }[];
}

// Issued Ticket Interfaces
export interface IssuedTicket {
  id: number;
  ticket_number: string;
  unique_code: string;
  event_id: number;
  booking_id: number;
  ticket_type_id: number | null;
  holder_name: string;
  holder_email: string | null;
  holder_phone: string | null;
  holder_company: string | null;
  holder_job_title: string | null;
  qr_payload: string;
  qr_image_url: string | null;
  badge_design_id: number | null;
  status: string;
  is_checked_in: boolean;
  checked_in_at: string | null;
  checkin_method: string | null;
  checkin_location: string | null;
  issued_at: string;
  created_at: string;
  ticket_type_name?: string;
  booking_code?: string;
  event_name?: string;
}

export interface IssueTicketInput {
  booking_id: number;
  booking_item_id?: number | null;
  ticket_type_id?: number | null;
  holder_name: string;
  holder_email?: string | null;
  holder_phone?: string | null;
  holder_company?: string | null;
  holder_job_title?: string | null;
}

export interface CheckinByCodeInput {
  code: string;
  device_id?: number;
  device_name?: string;
  location?: string;
}

export interface CheckinResult {
  success: boolean;
  message: string;
  ticket?: IssuedTicket;
}

export interface IssuedTicketStats {
  total_issued: number;
  total_checked_in: number;
  total_not_checked_in: number;
  checkin_percentage: number;
  by_ticket_type: { ticket_type: string; checked_in: number; total: number }[];
}

// Badge Design API
export const badgeDesignAPI = {
  getDesigns: async (eventId: number | string): Promise<BadgeDesign[]> => {
    const response = await apiClient.get(`/events/${eventId}/badge-designs`);
    return response.data as BadgeDesign[];
  },

  getDesignById: async (eventId: number | string, designId: number | string): Promise<BadgeDesign> => {
    const response = await apiClient.get(`/events/${eventId}/badge-designs/${designId}`);
    return response.data as BadgeDesign;
  },

  getDesignForTicket: async (eventId: number | string, ticketTypeId?: number): Promise<BadgeDesign | null> => {
    const response = await apiClient.get(`/events/${eventId}/badge-designs/for-ticket`, {
      params: ticketTypeId ? { ticket_type_id: ticketTypeId } : {}
    });
    return response.data as BadgeDesign | null;
  },

  createDesign: async (eventId: number | string, data: CreateBadgeDesignInput): Promise<BadgeDesign> => {
    const response = await apiClient.post(`/events/${eventId}/badge-designs`, data);
    return response.data as BadgeDesign;
  },

  updateDesign: async (eventId: number | string, designId: number | string, data: UpdateBadgeDesignInput): Promise<BadgeDesign> => {
    const response = await apiClient.put(`/events/${eventId}/badge-designs/${designId}`, data);
    return response.data as BadgeDesign;
  },

  deleteDesign: async (eventId: number | string, designId: number | string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/badge-designs/${designId}`);
  },

  duplicateDesign: async (eventId: number | string, designId: number | string, newName?: string): Promise<BadgeDesign> => {
    const response = await apiClient.post(`/events/${eventId}/badge-designs/${designId}/duplicate`, { name: newName });
    return response.data as BadgeDesign;
  },
};

// Booking API
export const bookingAPI = {
  getBookings: async (eventId: number | string, params?: { status?: string; payment_status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get(`/events/${eventId}/bookings`, { params });
    return response.data as { bookings: Booking[]; total: number; page: number; limit: number };
  },

  getBookingById: async (eventId: number | string, bookingId: number | string): Promise<Booking> => {
    const response = await apiClient.get(`/events/${eventId}/bookings/${bookingId}`);
    return response.data as Booking;
  },

  getBookingByCode: async (bookingCode: string): Promise<{ booking: Booking; tickets: IssuedTicket[] }> => {
    const response = await apiClient.get(`/events/public/bookings/${bookingCode}`);
    return response.data;
  },

  createBooking: async (eventId: number | string, data: CreateBookingInput): Promise<Booking> => {
    const response = await apiClient.post(`/events/${eventId}/bookings`, data);
    return response.data as Booking;
  },

  confirmBooking: async (eventId: number | string, bookingId: number | string): Promise<{ booking: Booking; tickets: IssuedTicket[]; message: string }> => {
    const response = await apiClient.post(`/events/${eventId}/bookings/${bookingId}/confirm`);
    return response.data;
  },

  updatePaymentStatus: async (eventId: number | string, bookingId: number | string, payment_status: string, payment_reference?: string): Promise<Booking> => {
    const response = await apiClient.post(`/events/${eventId}/bookings/${bookingId}/payment-status`, { payment_status, payment_reference });
    return response.data as Booking;
  },

  cancelBooking: async (eventId: number | string, bookingId: number | string): Promise<Booking> => {
    const response = await apiClient.post(`/events/${eventId}/bookings/${bookingId}/cancel`);
    return response.data as Booking;
  },

  deleteBooking: async (eventId: number | string, bookingId: number | string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/bookings/${bookingId}`);
  },
};

// Issued Ticket API
export const issuedTicketAPI = {
  getTickets: async (eventId: number | string, params?: { booking_id?: number; status?: string; is_checked_in?: boolean; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get(`/events/${eventId}/issued-tickets`, { params });
    return response.data as { tickets: IssuedTicket[]; total: number; page: number; limit: number };
  },

  getTicketById: async (eventId: number | string, ticketId: number | string): Promise<IssuedTicket> => {
    const response = await apiClient.get(`/events/${eventId}/issued-tickets/${ticketId}`);
    return response.data as IssuedTicket;
  },

  getTicketByCode: async (code: string): Promise<IssuedTicket> => {
    const response = await apiClient.get(`/events/public/tickets/${code}`);
    return response.data as IssuedTicket;
  },

  issueTicket: async (eventId: number | string, data: IssueTicketInput): Promise<IssuedTicket> => {
    const response = await apiClient.post(`/events/${eventId}/issued-tickets`, data);
    return response.data as IssuedTicket;
  },

  checkin: async (eventId: number | string, data: CheckinByCodeInput): Promise<CheckinResult> => {
    const response = await apiClient.post(`/events/${eventId}/checkin`, data);
    return response.data as CheckinResult;
  },

  undoCheckin: async (eventId: number | string, ticketId: number | string): Promise<CheckinResult> => {
    const response = await apiClient.post(`/events/${eventId}/issued-tickets/${ticketId}/undo-checkin`);
    return response.data as CheckinResult;
  },

  cancelTicket: async (eventId: number | string, ticketId: number | string): Promise<IssuedTicket> => {
    const response = await apiClient.post(`/events/${eventId}/issued-tickets/${ticketId}/cancel`);
    return response.data as IssuedTicket;
  },

  getStats: async (eventId: number | string): Promise<IssuedTicketStats> => {
    const response = await apiClient.get(`/events/${eventId}/issued-tickets/stats`);
    return response.data as IssuedTicketStats;
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

// ============================================================================
// INTEGRATIONS API
// ============================================================================

export type IntegrationType = 'email' | 'sms' | 'maps';
export type EmailProvider = 'sendgrid' | 'smtp';
export type SmsProvider = 'twilio' | 'messagebird';
export type MapsProvider = 'google_maps';

export interface IntegrationConfig {
  id: number;
  event_id: number | null;
  integration_type: IntegrationType;
  provider: string;
  is_enabled: boolean;
  config: Record<string, any>;
  status: 'not_configured' | 'connected' | 'error';
  status_message: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationsResponse {
  email: IntegrationConfig | null;
  sms: IntegrationConfig | null;
  maps: IntegrationConfig | null;
}

export interface SaveIntegrationsInput {
  email?: {
    provider: EmailProvider;
    is_enabled: boolean;
    config: {
      // SendGrid
      api_key?: string;
      from_email?: string;
      from_name?: string;
      // SMTP
      host?: string;
      port?: number;
      username?: string;
      password?: string;
      encryption?: 'none' | 'tls' | 'ssl';
    };
  };
  sms?: {
    provider: SmsProvider;
    is_enabled: boolean;
    config: {
      // Twilio
      account_sid?: string;
      auth_token?: string;
      from_number?: string;
      // MessageBird
      api_key?: string;
      originator?: string;
    };
  };
  maps?: {
    provider: MapsProvider;
    is_enabled: boolean;
    config: {
      api_key?: string;
    };
  };
}

export const integrationsAPI = {
  // Get all integrations for an event (resolved with global defaults)
  getEventIntegrations: async (eventId: number | string): Promise<IntegrationsResponse> => {
    const response = await apiClient.get(`/events/${eventId}/integrations`);
    return response.data as IntegrationsResponse;
  },

  // Save all integrations for an event
  saveEventIntegrations: async (eventId: number | string, data: SaveIntegrationsInput): Promise<{ message: string; integrations: IntegrationsResponse }> => {
    const response = await apiClient.put(`/events/${eventId}/integrations`, data);
    return response.data;
  },

  // Test a specific integration connection
  testConnection: async (eventId: number | string, configId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/events/${eventId}/integrations/${configId}/test`);
    return response.data;
  },

  // Delete an integration config
  deleteIntegration: async (eventId: number | string, configId: number): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/integrations/${configId}`);
  },
};

// ===== Privacy Settings API =====
export interface PrivacySettings {
  id?: number;
  event_id: number | null;
  gdpr_consent_enabled: boolean;
  privacy_policy_url: string | null;
  custom_consent_text: string | null;
  data_retention_days: '90' | '180' | '365' | 'forever';
  dpa_signed: boolean;
  dpa_signed_at: string | null;
  cookie_consent_enabled: boolean;
  is_global_default?: boolean;
}

export interface UpdatePrivacySettingsInput {
  gdpr_consent_enabled?: boolean;
  privacy_policy_url?: string | null;
  custom_consent_text?: string | null;
  data_retention_days?: '90' | '180' | '365' | 'forever';
  dpa_signed?: boolean;
  cookie_consent_enabled?: boolean;
}

export const privacySettingsAPI = {
  // Get privacy settings for an event (resolved with global defaults)
  getEventSettings: async (eventId: number | string): Promise<PrivacySettings> => {
    const response = await apiClient.get(`/events/${eventId}/privacy-settings`);
    return response.data as PrivacySettings;
  },

  // Update privacy settings for an event
  updateEventSettings: async (eventId: number | string, data: UpdatePrivacySettingsInput): Promise<{ message: string; settings: PrivacySettings }> => {
    const response = await apiClient.put(`/events/${eventId}/privacy-settings`, data);
    return response.data;
  },

  // Reset event settings to global defaults
  resetToGlobal: async (eventId: number | string): Promise<{ message: string; settings: PrivacySettings }> => {
    const response = await apiClient.post(`/events/${eventId}/privacy-settings/reset`);
    return response.data;
  },

  // Export full event data as CSV
  exportEventData: async (eventId: number | string): Promise<Blob> => {
    const response = await apiClient.get(`/events/${eventId}/privacy-settings/export`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// ===== Email Templates API =====
export type EmailScenario = 
  | 'registration_complete' 
  | 'payment_successful' 
  | 'event_reminder' 
  | 'event_cancelled' 
  | 'post_event_followup';

export interface EmailScenarioConfig {
  scenario: EmailScenario;
  triggerLabel: string;
  description: string;
  is_enabled: boolean;
  has_override: boolean;
  source: 'global' | 'event';
  subject: string;
  body: string;
  send_timing: 'immediate' | 'scheduled';
  schedule_offset: number | null;
  schedule_unit: 'minutes' | 'hours' | 'days' | null;
  globalSubject: string;
  globalBody: string;
  variables: string[];
}

export interface EmailProviderStatus {
  available: boolean;
  provider?: string;
  error?: string;
}

export interface EmailTemplatesResponse {
  templates: EmailScenarioConfig[];
  emailProviderStatus: EmailProviderStatus;
}

export interface SaveEmailTemplatesInput {
  scenarios: Array<{
    scenario: EmailScenario;
    is_enabled: boolean;
    has_override: boolean;
    subject?: string | null;
    body?: string | null;
    send_timing?: 'immediate' | 'scheduled';
    schedule_offset?: number | null;
    schedule_unit?: 'minutes' | 'hours' | 'days' | null;
  }>;
}

export const emailTemplatesAPI = {
  // Get all email template configurations for an event
  getEventTemplates: async (eventId: number | string): Promise<EmailTemplatesResponse> => {
    const response = await apiClient.get(`/events/${eventId}/email-templates`);
    return response.data as EmailTemplatesResponse;
  },

  // Save all email template configurations
  saveEventTemplates: async (eventId: number | string, data: SaveEmailTemplatesInput): Promise<{ message: string; templates: EmailScenarioConfig[] }> => {
    const response = await apiClient.put(`/events/${eventId}/email-templates`, data);
    return response.data;
  },

  // Reset to global defaults
  resetToGlobal: async (eventId: number | string): Promise<{ message: string; templates: EmailScenarioConfig[] }> => {
    const response = await apiClient.post(`/events/${eventId}/email-templates/reset`);
    return response.data;
  },

  // Send test email
  sendTestEmail: async (eventId: number | string, scenario: EmailScenario, email: string): Promise<{ message: string; messageId?: string; provider?: string }> => {
    const response = await apiClient.post(`/events/${eventId}/email-templates/test`, { scenario, email });
    return response.data;
  },

  // Get email provider status
  getEmailProviderStatus: async (eventId: number | string): Promise<EmailProviderStatus> => {
    const response = await apiClient.get(`/events/${eventId}/email-templates/status`);
    return response.data;
  },
};
