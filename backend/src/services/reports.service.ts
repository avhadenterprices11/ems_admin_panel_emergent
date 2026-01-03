import db from '../database/db';

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
  id: number;
  report_id: number;
  source_type: string;
  field_name: string;
  field_alias?: string;
  sort_order: number;
}

export interface ReportFilter {
  id: number;
  report_id: number;
  field: string;
  operator: string;
  value?: string;
  logic_operator: string;
  sort_order: number;
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

export interface ReportDataRow {
  [key: string]: any;
}

export interface RunReportResult {
  success: boolean;
  data: ReportDataRow[];
  total: number;
  execution_time_ms: number;
  run_id: number;
}

// Data source definitions - reusable across modules
export const DATA_SOURCES = [
  {
    id: 'events',
    name: 'Event Data',
    table: 'events',
    alias: 'e',
    fields: [
      { id: 'evt_name', name: 'Event Name', column: 'name', type: 'text' },
      { id: 'evt_date', name: 'Event Date', column: 'start_date', type: 'date' },
      { id: 'evt_loc', name: 'Location', column: 'location', type: 'text' },
      { id: 'evt_cat', name: 'Category', column: 'category', type: 'text' },
      { id: 'evt_status', name: 'Status', column: 'status', type: 'text' },
    ],
  },
  {
    id: 'tickets',
    name: 'Ticket Data',
    table: 'tickets',
    alias: 't',
    fields: [
      { id: 'tkt_name', name: 'Ticket Type', column: 'name', type: 'text' },
      { id: 'tkt_price', name: 'Price', column: 'price', type: 'number' },
      { id: 'tkt_sold', name: 'Quantity Sold', column: 'sold_count', type: 'number' },
      { id: 'tkt_capacity', name: 'Capacity', column: 'capacity', type: 'number' },
    ],
  },
  {
    id: 'registrations',
    name: 'Registration Data',
    table: 'event_registrations',
    alias: 'r',
    fields: [
      { id: 'reg_name', name: 'Registrant Name', column: 'registrant_name', type: 'text' },
      { id: 'reg_email', name: 'Email', column: 'registrant_email', type: 'text' },
      { id: 'reg_status', name: 'Status', column: 'status', type: 'text' },
      { id: 'reg_date', name: 'Registration Date', column: 'created_at', type: 'date' },
      { id: 'reg_amount', name: 'Amount Paid', column: 'total_amount', type: 'number' },
    ],
  },
  {
    id: 'attendees',
    name: 'Check-in Logs',
    table: 'event_attendees',
    alias: 'a',
    fields: [
      { id: 'att_name', name: 'Attendee Name', column: 'attendee_name', type: 'text' },
      { id: 'att_status', name: 'Check-in Status', column: 'checkin_status', type: 'text' },
      { id: 'att_time', name: 'Check-in Time', column: 'checkin_time', type: 'datetime' },
      { id: 'att_email', name: 'Email', column: 'attendee_email', type: 'text' },
    ],
  },
];

export class ReportsService {
  // Get all reports for an event (or global if eventId is null)
  async getReportsByEventId(eventId?: number): Promise<Report[]> {
    let query = db('reports')
      .where('is_deleted', false)
      .orderBy('created_at', 'desc');

    if (eventId) {
      query = query.where('event_id', eventId);
    }

    const reports = await query;

    return reports.map((r: any) => ({
      ...r,
      config_json: typeof r.config_json === 'string' ? JSON.parse(r.config_json) : r.config_json,
    }));
  }

  // Get report by ID
  async getReportById(reportId: number, eventId?: number): Promise<Report | null> {
    let query = db('reports')
      .where('id', reportId)
      .andWhere('is_deleted', false);

    if (eventId) {
      query = query.andWhere('event_id', eventId);
    }

    const report = await query.first();

    if (!report) return null;

    return {
      ...report,
      config_json: typeof report.config_json === 'string' ? JSON.parse(report.config_json) : report.config_json,
    };
  }

  // Create report
  async createReport(eventId: number | null, input: CreateReportInput, userId?: number): Promise<Report> {
    const configJson = {
      name: input.name,
      description: input.description,
      type: input.category,
      scope: input.data_scope,
      selectedFields: input.selected_fields || [],
      filters: input.filters || [],
      groupBy: input.group_by || '',
      visualization: input.visualization_type,
      visibility: input.visibility,
    };

    const [report] = await db('reports')
      .insert({
        event_id: eventId,
        name: input.name,
        description: input.description || null,
        category: input.category || null,
        data_scope: input.data_scope || 'this_event',
        visualization_type: input.visualization_type || 'table',
        config_json: JSON.stringify(configJson),
        visibility: input.visibility || 'private',
        schedule_enabled: input.schedule_enabled || false,
        schedule_frequency: input.schedule_frequency || null,
        schedule_recipients: input.schedule_recipients || null,
        created_by: userId || null,
      })
      .returning('*');

    // Save fields
    if (input.selected_fields && input.selected_fields.length > 0) {
      const fieldRecords = input.selected_fields.map((fieldId, index) => {
        const sourceInfo = this.getFieldSourceInfo(fieldId);
        return {
          report_id: report.id,
          source_type: sourceInfo.source,
          field_name: fieldId,
          sort_order: index,
        };
      });
      await db('report_fields').insert(fieldRecords);
    }

    // Save filters
    if (input.filters && input.filters.length > 0) {
      const filterRecords = input.filters.map((f, index) => ({
        report_id: report.id,
        field: f.field,
        operator: f.operator,
        value: f.value || null,
        logic_operator: f.logic_operator || 'AND',
        sort_order: index,
      }));
      await db('report_filters').insert(filterRecords);
    }

    return {
      ...report,
      config_json: configJson,
    };
  }

  // Update report
  async updateReport(reportId: number, eventId: number | null, input: UpdateReportInput): Promise<Report | null> {
    let query = db('reports').where('id', reportId);
    if (eventId) {
      query = query.andWhere('event_id', eventId);
    }

    const existing = await query.first();
    if (!existing) return null;

    const updateData: any = { updated_at: db.fn.now() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.data_scope !== undefined) updateData.data_scope = input.data_scope;
    if (input.visualization_type !== undefined) updateData.visualization_type = input.visualization_type;
    if (input.config_json !== undefined) updateData.config_json = JSON.stringify(input.config_json);
    if (input.visibility !== undefined) updateData.visibility = input.visibility;
    if (input.schedule_enabled !== undefined) updateData.schedule_enabled = input.schedule_enabled;
    if (input.schedule_frequency !== undefined) updateData.schedule_frequency = input.schedule_frequency;
    if (input.schedule_recipients !== undefined) updateData.schedule_recipients = input.schedule_recipients;

    const [updated] = await db('reports')
      .where('id', reportId)
      .update(updateData)
      .returning('*');

    return {
      ...updated,
      config_json: typeof updated.config_json === 'string' ? JSON.parse(updated.config_json) : updated.config_json,
    };
  }

  // Delete report (soft delete)
  async deleteReport(reportId: number, eventId?: number): Promise<boolean> {
    let query = db('reports').where('id', reportId);
    if (eventId) {
      query = query.andWhere('event_id', eventId);
    }

    const result = await query.update({ is_deleted: true, updated_at: db.fn.now() });
    return result > 0;
  }

  // Run report and get data
  async runReport(reportId: number, eventId?: number, options?: { dateFrom?: string; dateTo?: string; limit?: number; offset?: number }): Promise<RunReportResult> {
    const startTime = Date.now();

    const report = await this.getReportById(reportId, eventId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Create run record
    const [runRecord] = await db('report_runs')
      .insert({
        report_id: reportId,
        status: 'running',
      })
      .returning('*');

    try {
      // Build and execute query based on report config
      const data = await this.executeReportQuery(report, eventId, options);
      const executionTime = Date.now() - startTime;

      // Update run record
      await db('report_runs')
        .where('id', runRecord.id)
        .update({
          status: 'completed',
          result_snapshot_json: JSON.stringify(data.slice(0, 100)), // Store first 100 rows as snapshot
          row_count: data.length,
          execution_time_ms: executionTime,
        });

      return {
        success: true,
        data,
        total: data.length,
        execution_time_ms: executionTime,
        run_id: runRecord.id,
      };
    } catch (error: any) {
      // Update run record with error
      await db('report_runs')
        .where('id', runRecord.id)
        .update({
          status: 'failed',
          error_message: error.message,
          execution_time_ms: Date.now() - startTime,
        });

      throw error;
    }
  }

  // Execute the actual report query
  private async executeReportQuery(report: Report, eventId?: number, options?: { dateFrom?: string; dateTo?: string; limit?: number; offset?: number }): Promise<ReportDataRow[]> {
    const config = report.config_json || {};
    const category = report.category || config.type || 'Registrations';

    // Base query based on category
    let query: any;

    switch (category) {
      case 'Ticket Sales':
        query = db('tickets as t')
          .leftJoin('events as e', 't.event_id', 'e.id')
          .select(
            'e.name as event_name',
            't.name as ticket_type',
            't.price',
            't.sold_count as quantity_sold',
            db.raw('t.price * t.sold_count as total_revenue'),
            't.created_at as date'
          );
        if (eventId) query = query.where('t.event_id', eventId);
        break;

      case 'Revenue & Finance':
        query = db('event_registrations as r')
          .leftJoin('events as e', 'r.event_id', 'e.id')
          .select(
            'e.name as event_name',
            'r.payment_status',
            db.raw('COUNT(*) as transaction_count'),
            db.raw('SUM(r.total_amount) as total_revenue'),
            db.raw('DATE(r.created_at) as date')
          )
          .groupBy('e.name', 'r.payment_status', db.raw('DATE(r.created_at)'));
        if (eventId) query = query.where('r.event_id', eventId);
        break;

      case 'Attendance':
        query = db('event_attendees as a')
          .leftJoin('events as e', 'a.event_id', 'e.id')
          .leftJoin('tickets as t', 'a.ticket_id', 't.id')
          .select(
            'e.name as event_name',
            't.name as ticket_type',
            'a.attendee_name',
            'a.attendee_email',
            'a.checkin_status',
            'a.checkin_time',
            'a.created_at as registration_date'
          );
        if (eventId) query = query.where('a.event_id', eventId);
        break;

      default: // Registrations
        query = db('event_registrations as r')
          .leftJoin('events as e', 'r.event_id', 'e.id')
          .leftJoin('tickets as t', 'r.ticket_id', 't.id')
          .select(
            'e.name as event_name',
            't.name as ticket_type',
            'r.registrant_name',
            'r.registrant_email',
            'r.status',
            'r.payment_status',
            'r.total_amount as amount',
            'r.created_at as date'
          );
        if (eventId) query = query.where('r.event_id', eventId);
        break;
    }

    // Apply date filters
    if (options?.dateFrom) {
      query = query.where('r.created_at', '>=', options.dateFrom);
    }
    if (options?.dateTo) {
      query = query.where('r.created_at', '<=', options.dateTo);
    }

    // Apply limit and offset
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return query;
  }

  // Export report data as CSV
  async exportReportCSV(reportId: number, eventId?: number, options?: { dateFrom?: string; dateTo?: string }): Promise<{ csv: string; filename: string }> {
    const report = await this.getReportById(reportId, eventId);
    if (!report) {
      throw new Error('Report not found');
    }

    const result = await this.runReport(reportId, eventId, { ...options, limit: 10000 });
    const data = result.data;

    if (data.length === 0) {
      return { csv: '', filename: `${report.name}_empty.csv` };
    }

    // Generate CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          // Escape quotes and wrap in quotes if contains comma
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      )
    ];

    const csv = csvRows.join('\n');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.csv`;

    return { csv, filename };
  }

  // Get report runs history
  async getReportRuns(reportId: number, limit: number = 10): Promise<ReportRun[]> {
    return db('report_runs')
      .where('report_id', reportId)
      .orderBy('executed_at', 'desc')
      .limit(limit);
  }

  // Get data sources (for UI)
  getDataSources() {
    return DATA_SOURCES;
  }

  // Helper to get source info for a field
  private getFieldSourceInfo(fieldId: string): { source: string; field: any } {
    for (const source of DATA_SOURCES) {
      const field = source.fields.find(f => f.id === fieldId);
      if (field) {
        return { source: source.id, field };
      }
    }
    return { source: 'unknown', field: null };
  }

  // Get standard/predefined reports
  getStandardReports(): { id: string; name: string; description: string; category: string; visualization: string }[] {
    return [
      {
        id: 'registration_funnel',
        name: 'Registration Funnel',
        description: 'Conversion rates from page view to payment.',
        category: 'Registrations',
        visualization: 'line',
      },
      {
        id: 'ticket_sales_breakdown',
        name: 'Ticket Sales Breakdown',
        description: 'Sales volume by ticket type and category.',
        category: 'Ticket Sales',
        visualization: 'pie',
      },
      {
        id: 'revenue_over_time',
        name: 'Revenue Over Time',
        description: 'Daily gross revenue and transaction count.',
        category: 'Revenue & Finance',
        visualization: 'line',
      },
      {
        id: 'attendance_checkin',
        name: 'Attendance & Check-in',
        description: 'Real-time check-in stats vs total registrations.',
        category: 'Attendance',
        visualization: 'bar',
      },
      {
        id: 'geographic_distribution',
        name: 'Geographic Distribution',
        description: 'Attendee breakdown by country and city.',
        category: 'Registrations',
        visualization: 'map',
      },
    ];
  }

  // Run a standard report
  async runStandardReport(reportId: string, eventId: number, options?: { dateFrom?: string; dateTo?: string }): Promise<ReportDataRow[]> {
    const standardReports = this.getStandardReports();
    const standard = standardReports.find(r => r.id === reportId);
    if (!standard) {
      throw new Error('Standard report not found');
    }

    // Execute query based on standard report type
    switch (reportId) {
      case 'registration_funnel':
        return this.getRegistrationFunnelData(eventId, options);
      case 'ticket_sales_breakdown':
        return this.getTicketSalesData(eventId, options);
      case 'revenue_over_time':
        return this.getRevenueData(eventId, options);
      case 'attendance_checkin':
        return this.getAttendanceData(eventId, options);
      case 'geographic_distribution':
        return this.getGeographicData(eventId, options);
      default:
        return [];
    }
  }

  // Standard report queries
  private async getRegistrationFunnelData(eventId: number, options?: any): Promise<ReportDataRow[]> {
    const result = await db('event_registrations')
      .where('event_id', eventId)
      .select(
        'status',
        db.raw('COUNT(*) as count')
      )
      .groupBy('status');
    return result;
  }

  private async getTicketSalesData(eventId: number, options?: any): Promise<ReportDataRow[]> {
    const result = await db('tickets')
      .where('event_id', eventId)
      .select(
        'name as ticket_type',
        'sold as quantity',
        db.raw('price * sold as revenue')
      );
    return result;
  }

  private async getRevenueData(eventId: number, options?: any): Promise<ReportDataRow[]> {
    const result = await db('event_registrations')
      .where('event_id', eventId)
      .select(
        db.raw('DATE(created_at) as date'),
        db.raw('SUM(total_amount) as revenue'),
        db.raw('COUNT(*) as transactions')
      )
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date');
    return result;
  }

  private async getAttendanceData(eventId: number, options?: any): Promise<ReportDataRow[]> {
    const result = await db('event_attendees')
      .where('event_id', eventId)
      .select(
        'checkin_status',
        db.raw('COUNT(*) as count')
      )
      .groupBy('checkin_status');
    return result;
  }

  private async getGeographicData(eventId: number, options?: any): Promise<ReportDataRow[]> {
    // This would typically use a geo field - simplified for now
    const result = await db('event_registrations')
      .where('event_id', eventId)
      .select(
        db.raw("'United States' as country"),
        db.raw('COUNT(*) as count')
      );
    return result;
  }
}
