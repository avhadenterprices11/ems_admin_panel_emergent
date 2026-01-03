import { Request, Response } from 'express';
import { ReportsService, CreateReportInput, UpdateReportInput } from '../services/reports.service';

const reportsService = new ReportsService();

export class ReportsController {
  // Get all reports for an event
  async getReports(req: Request, res: Response) {
    try {
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : undefined;

      const reports = await reportsService.getReportsByEventId(eventId);
      return res.status(200).json(reports);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return res.status(500).json({ message: 'Failed to fetch reports' });
    }
  }

  // Get report by ID
  async getReportById(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : undefined;

      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }

      const report = await reportsService.getReportById(reportId, eventId);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      return res.status(200).json(report);
    } catch (error: any) {
      console.error('Error fetching report:', error);
      return res.status(500).json({ message: 'Failed to fetch report' });
    }
  }

  // Create report
  async createReport(req: Request, res: Response) {
    try {
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : null;

      const { name, description, category, data_scope, visualization_type, config_json, visibility, schedule_enabled, schedule_frequency, schedule_recipients, selected_fields, filters, group_by } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Report name is required' });
      }

      const input: CreateReportInput = {
        name: name.trim(),
        description: description?.trim(),
        category,
        data_scope,
        visualization_type,
        config_json,
        visibility,
        schedule_enabled,
        schedule_frequency,
        schedule_recipients,
        selected_fields,
        filters,
        group_by,
      };

      // Get user ID from auth if available
      const userId = (req as any).user?.id;

      const report = await reportsService.createReport(eventId, input, userId);
      return res.status(201).json(report);
    } catch (error: any) {
      console.error('Error creating report:', error);
      return res.status(500).json({ message: 'Failed to create report' });
    }
  }

  // Update report
  async updateReport(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : null;

      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }

      const { name, description, category, data_scope, visualization_type, config_json, visibility, schedule_enabled, schedule_frequency, schedule_recipients } = req.body;

      const input: UpdateReportInput = {};
      if (name !== undefined) input.name = name.trim();
      if (description !== undefined) input.description = description?.trim();
      if (category !== undefined) input.category = category;
      if (data_scope !== undefined) input.data_scope = data_scope;
      if (visualization_type !== undefined) input.visualization_type = visualization_type;
      if (config_json !== undefined) input.config_json = config_json;
      if (visibility !== undefined) input.visibility = visibility;
      if (schedule_enabled !== undefined) input.schedule_enabled = schedule_enabled;
      if (schedule_frequency !== undefined) input.schedule_frequency = schedule_frequency;
      if (schedule_recipients !== undefined) input.schedule_recipients = schedule_recipients;

      const report = await reportsService.updateReport(reportId, eventId, input);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      return res.status(200).json(report);
    } catch (error: any) {
      console.error('Error updating report:', error);
      return res.status(500).json({ message: 'Failed to update report' });
    }
  }

  // Delete report
  async deleteReport(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : undefined;

      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }

      const deleted = await reportsService.deleteReport(reportId, eventId);
      if (!deleted) {
        return res.status(404).json({ message: 'Report not found' });
      }

      return res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting report:', error);
      return res.status(500).json({ message: 'Failed to delete report' });
    }
  }

  // Run report
  async runReport(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : undefined;

      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }

      const { date_from, date_to, limit, offset } = req.query;

      const result = await reportsService.runReport(reportId, eventId, {
        dateFrom: date_from as string,
        dateTo: date_to as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error running report:', error);
      return res.status(500).json({ message: error.message || 'Failed to run report' });
    }
  }

  // Export report as CSV
  async exportReportCSV(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.reportId, 10);
      const eventId = req.params.eventId ? parseInt(req.params.eventId, 10) : undefined;

      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }

      const { date_from, date_to } = req.query;

      const { csv, filename } = await reportsService.exportReportCSV(reportId, eventId, {
        dateFrom: date_from as string,
        dateTo: date_to as string,
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      return res.status(500).json({ message: error.message || 'Failed to export report' });
    }
  }

  // Get report runs history
  async getReportRuns(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.reportId, 10);

      if (isNaN(reportId)) {
        return res.status(400).json({ message: 'Invalid report ID' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const runs = await reportsService.getReportRuns(reportId, limit);

      return res.status(200).json(runs);
    } catch (error: any) {
      console.error('Error fetching report runs:', error);
      return res.status(500).json({ message: 'Failed to fetch report runs' });
    }
  }

  // Get data sources (for report builder)
  async getDataSources(req: Request, res: Response) {
    try {
      const dataSources = reportsService.getDataSources();
      return res.status(200).json(dataSources);
    } catch (error: any) {
      console.error('Error fetching data sources:', error);
      return res.status(500).json({ message: 'Failed to fetch data sources' });
    }
  }

  // Get standard reports
  async getStandardReports(req: Request, res: Response) {
    try {
      const standardReports = reportsService.getStandardReports();
      return res.status(200).json(standardReports);
    } catch (error: any) {
      console.error('Error fetching standard reports:', error);
      return res.status(500).json({ message: 'Failed to fetch standard reports' });
    }
  }

  // Run standard report
  async runStandardReport(req: Request, res: Response) {
    try {
      const standardReportId = req.params.standardReportId;
      const eventId = parseInt(req.params.eventId, 10);

      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { date_from, date_to } = req.query;

      const data = await reportsService.runStandardReport(standardReportId, eventId, {
        dateFrom: date_from as string,
        dateTo: date_to as string,
      });

      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      console.error('Error running standard report:', error);
      return res.status(500).json({ message: error.message || 'Failed to run standard report' });
    }
  }
}
