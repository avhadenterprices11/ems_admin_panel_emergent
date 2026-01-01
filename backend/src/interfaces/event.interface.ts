export interface Event {
  id: number;
  event_code: string;
  name: string;
  type: string;
  start_date: Date;
  end_date: Date;
  owner: string;
  location: string;
  total_registrations: number;
  checked_in_count: number;
  capacity: number | null;
  status: string;
  is_registration_open: boolean;
  is_checkin_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface EventListQuery {
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

export interface EventMetrics {
  totalEvents: number;
  activeEvents: number;
  draftEvents: number;
  totalRegistrations: number;
  growthRate: number;
}
