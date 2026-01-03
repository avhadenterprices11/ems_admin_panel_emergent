import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Play,
  FileEdit,
  Copy,
  Download,
  Clock,
  Trash2,
  Check,
  MoreHorizontal,
  BarChart2,
  PieChart,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
  X,
  Loader2,
  Table as TableIcon,
  LineChart,
  Map,
  Filter
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { 
  eventsAPI, 
  Report, 
  ReportDataSource, 
  StandardReport, 
  CreateReportInput,
  ReportRunResult 
} from '../../api/events.api';

type ViewMode = 'dashboard' | 'builder' | 'view';

export function EventReports() {
  const { eventId } = useParams<{ eventId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  
  // Data states
  const [reports, setReports] = useState<Report[]>([]);
  const [standardReports, setStandardReports] = useState<StandardReport[]>([]);
  const [dataSources, setDataSources] = useState<ReportDataSource[]>([]);
  const [reportData, setReportData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningReport, setRunningReport] = useState(false);
  
  // Builder form states
  const [builderForm, setBuilderForm] = useState<CreateReportInput>({
    name: '',
    description: '',
    category: 'Registrations',
    data_scope: 'this_event',
    visualization_type: 'table',
    visibility: 'private',
    selected_fields: [],
    filters: [],
    group_by: '',
  });

  // Load initial data
  useEffect(() => {
    if (eventId) {
      loadReports();
      loadStandardReports();
      loadDataSources();
    }
  }, [eventId]);

  const loadReports = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const data = await eventsAPI.getReports(eventId);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStandardReports = async () => {
    if (!eventId) return;
    try {
      const data = await eventsAPI.getStandardReports(eventId);
      setStandardReports(data);
    } catch (error) {
      console.error('Error loading standard reports:', error);
    }
  };

  const loadDataSources = async () => {
    if (!eventId) return;
    try {
      const data = await eventsAPI.getDataSources(eventId);
      setDataSources(data);
    } catch (error) {
      console.error('Error loading data sources:', error);
    }
  };

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setViewMode('view');
    await runReportQuery(report);
  };

  const runReportQuery = async (report: Report) => {
    if (!eventId) return;
    setRunningReport(true);
    try {
      const result = await eventsAPI.runReport(eventId, report.id);
      setReportData(result.data);
      toast.success(`Report executed in ${result.execution_time_ms}ms`);
    } catch (error: any) {
      console.error('Error running report:', error);
      toast.error(error.response?.data?.message || 'Failed to run report');
      setReportData([]);
    } finally {
      setRunningReport(false);
    }
  };

  const handleRunStandardReport = async (standardReport: StandardReport) => {
    if (!eventId) return;
    setRunningReport(true);
    try {
      const result = await eventsAPI.runStandardReport(eventId, standardReport.id);
      setReportData(result.data);
      setSelectedReport({
        id: 0,
        name: standardReport.name,
        description: standardReport.description,
        category: standardReport.category,
        visualization_type: standardReport.visualization,
        data_scope: 'this_event',
        visibility: 'private',
        schedule_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
      });
      setViewMode('view');
      toast.success('Standard report executed successfully');
    } catch (error: any) {
      console.error('Error running standard report:', error);
      toast.error(error.response?.data?.message || 'Failed to run standard report');
    } finally {
      setRunningReport(false);
    }
  };

  const handleCreateReport = async () => {
    if (!eventId || !builderForm.name.trim()) {
      toast.error('Report name is required');
      return;
    }
    setLoading(true);
    try {
      const newReport = await eventsAPI.createReport(eventId, builderForm);
      toast.success('Report created successfully');
      setReports([newReport, ...reports]);
      setViewMode('dashboard');
      resetBuilderForm();
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast.error(error.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!eventId || !reportToDelete) return;
    setLoading(true);
    try {
      await eventsAPI.deleteReport(eventId, reportToDelete.id);
      toast.success('Report deleted successfully');
      setReports(reports.filter(r => r.id !== reportToDelete.id));
      setIsDeleteOpen(false);
      setReportToDelete(null);
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async (report: Report) => {
    if (!eventId) return;
    try {
      const blob = await eventsAPI.exportReportCSV(eventId, report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
      setIsExportOpen(false);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.error(error.response?.data?.message || 'Failed to export report');
    }
  };

  const handleDuplicateReport = async (report: Report) => {
    if (!eventId) return;
    try {
      const duplicated = await eventsAPI.createReport(eventId, {
        name: `${report.name} (Copy)`,
        description: report.description,
        category: report.category,
        data_scope: report.data_scope,
        visualization_type: report.visualization_type,
        visibility: report.visibility,
        config_json: report.config_json,
      });
      toast.success('Report duplicated successfully');
      setReports([duplicated, ...reports]);
    } catch (error: any) {
      console.error('Error duplicating report:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate report');
    }
  };

  const resetBuilderForm = () => {
    setBuilderForm({
      name: '',
      description: '',
      category: 'Registrations',
      data_scope: 'this_event',
      visualization_type: 'table',
      visibility: 'private',
      selected_fields: [],
      filters: [],
      group_by: '',
    });
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart2 size={16} />;
      case 'line': return <LineChart size={16} />;
      case 'pie': return <PieChart size={16} />;
      case 'map': return <Map size={16} />;
      default: return <TableIcon size={16} />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Builder View
  if (viewMode === 'builder') {
    return (
      <div className="space-y-6" data-testid="report-builder">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1d293d]">Custom Report Builder</h3>
            <p className="text-sm text-slate-500 mt-1">Create custom reports with filters, metrics, and visualizations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setViewMode('dashboard'); resetBuilderForm(); }} data-testid="cancel-builder-btn">
              Cancel
            </Button>
            <Button 
              className="bg-[#0e042f] hover:bg-[#1d293d] text-white" 
              onClick={handleCreateReport}
              disabled={loading || !builderForm.name.trim()}
              data-testid="save-report-btn"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Report
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name *</Label>
              <Input
                id="report-name"
                value={builderForm.name}
                onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                placeholder="Enter report name"
                data-testid="report-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-category">Category</Label>
              <Select
                value={builderForm.category}
                onValueChange={(value) => setBuilderForm({ ...builderForm, category: value })}
              >
                <SelectTrigger data-testid="report-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registrations">Registrations</SelectItem>
                  <SelectItem value="Ticket Sales">Ticket Sales</SelectItem>
                  <SelectItem value="Revenue & Finance">Revenue & Finance</SelectItem>
                  <SelectItem value="Attendance">Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={builderForm.description}
              onChange={(e) => setBuilderForm({ ...builderForm, description: e.target.value })}
              placeholder="Enter report description"
              rows={2}
              data-testid="report-description-input"
            />
          </div>

          {/* Visualization Type */}
          <div className="space-y-2">
            <Label>Visualization Type</Label>
            <div className="flex gap-2">
              {['table', 'bar', 'line', 'pie'].map((type) => (
                <Button
                  key={type}
                  variant={builderForm.visualization_type === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBuilderForm({ ...builderForm, visualization_type: type })}
                  className={builderForm.visualization_type === type ? 'bg-[#0e042f]' : ''}
                  data-testid={`viz-type-${type}`}
                >
                  {getVisualizationIcon(type)}
                  <span className="ml-2 capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Data Source & Fields */}
          <div className="space-y-4">
            <Label>Select Fields</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dataSources.map((source) => (
                <div key={source.id} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm text-slate-900 mb-2">{source.name}</h4>
                  <div className="space-y-1">
                    {source.fields.map((field) => (
                      <label key={field.id} className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={builderForm.selected_fields?.includes(field.id)}
                          onCheckedChange={(checked) => {
                            const fields = builderForm.selected_fields || [];
                            if (checked) {
                              setBuilderForm({ ...builderForm, selected_fields: [...fields, field.id] });
                            } else {
                              setBuilderForm({ ...builderForm, selected_fields: fields.filter(f => f !== field.id) });
                            }
                          }}
                        />
                        <span className="text-slate-600">{field.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Scope</Label>
              <Select
                value={builderForm.data_scope}
                onValueChange={(value) => setBuilderForm({ ...builderForm, data_scope: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_event">This Event Only</SelectItem>
                  <SelectItem value="series">Event Series</SelectItem>
                  <SelectItem value="multi">Multiple Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={builderForm.visibility}
                onValueChange={(value) => setBuilderForm({ ...builderForm, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only Me)</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="org">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Report View
  if (viewMode === 'view' && selectedReport) {
    return (
      <div className="space-y-6" data-testid="report-viewer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setViewMode('dashboard'); setSelectedReport(null); setReportData([]); }} data-testid="back-to-dashboard-btn">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h3 className="text-xl font-bold text-[#1d293d]">{selectedReport.name}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedReport.description || `Category: ${selectedReport.category}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => selectedReport.id > 0 && runReportQuery(selectedReport)}
              disabled={runningReport || selectedReport.id === 0}
              data-testid="refresh-report-btn"
            >
              <RefreshCw size={16} className={`mr-2 ${runningReport ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
            <Button 
              className="bg-[#0e042f] hover:bg-[#1d293d] text-white" 
              onClick={() => setIsExportOpen(true)}
              disabled={reportData.length === 0}
              data-testid="export-report-btn"
            >
              <Download size={16} className="mr-2" /> Export
            </Button>
          </div>
        </div>

        {/* Report Summary Stats */}
        {reportData.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-1">Total Records</p>
              <h3 className="text-2xl font-bold text-slate-900">{reportData.length}</h3>
            </div>
            {selectedReport.category === 'Revenue & Finance' && reportData[0]?.total_revenue !== undefined && (
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-emerald-600">
                  ${reportData.reduce((sum, row) => sum + (parseFloat(row.total_revenue) || 0), 0).toLocaleString()}
                </h3>
              </div>
            )}
            {selectedReport.category === 'Ticket Sales' && (
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Total Sold</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {reportData.reduce((sum, row) => sum + (parseInt(row.quantity_sold) || 0), 0).toLocaleString()}
                </h3>
              </div>
            )}
          </div>
        )}

        {/* Report Data Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {runningReport ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">Running report...</span>
            </div>
          ) : reportData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    {Object.keys(reportData[0]).map((key) => (
                      <TableHead key={key} className="capitalize">
                        {key.replace(/_/g, ' ')}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-slate-50/60">
                      {Object.values(row).map((value: any, colIndex) => (
                        <TableCell key={colIndex} className="text-sm">
                          {value === null || value === undefined ? '-' : 
                           typeof value === 'object' ? JSON.stringify(value) :
                           String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <TableIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>No data available for this report</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard View (default)
  return (
    <div className="space-y-6" data-testid="reports-dashboard">
      {/* Standard Reports (Quick Insights) */}
      <div>
        <h4 className="font-bold text-[#1d293d] mb-4">Quick Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {standardReports.map((report) => (
            <div 
              key={report.id}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 cursor-pointer transition-colors"
              onClick={() => handleRunStandardReport(report)}
              data-testid={`standard-report-${report.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-50">
                  {getVisualizationIcon(report.visualization)}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink size={14} className="text-slate-400" />
                </Button>
              </div>
              <h5 className="font-medium text-sm text-slate-900">{report.name}</h5>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Reports */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-[#1d293d]">Saved Reports</h3>
          <Button className="bg-[#0f172b]" onClick={() => setViewMode('builder')} data-testid="create-report-btn">
            <Plus size={16} className="mr-2" /> Create Custom Report
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : reports.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Visualization</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow 
                  key={report.id} 
                  className="hover:bg-slate-50/60 cursor-pointer"
                  onClick={() => handleViewReport(report)}
                  data-testid={`report-row-${report.id}`}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-[#1d293d]">{report.name}</div>
                      {report.description && (
                        <div className="text-xs text-slate-400 line-clamp-1">{report.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.category || 'Custom'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {getVisualizationIcon(report.visualization_type)}
                      <span className="capitalize">{report.visualization_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{report.visibility}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(report.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleViewReport(report)}>
                          <Play size={14} className="mr-2" /> Run Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                          <Copy size={14} className="mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedReport(report); setIsExportOpen(true); }}>
                          <Download size={14} className="mr-2" /> Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => { setReportToDelete(report); setIsDeleteOpen(true); }}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="font-medium text-slate-900 mb-1">No custom reports yet</h3>
            <p className="text-sm max-w-md mx-auto mb-4">
              Create your first custom report to analyze event data with custom fields and filters.
            </p>
            <Button onClick={() => setViewMode('builder')} data-testid="create-first-report-btn">
              <Plus size={16} className="mr-2" /> Create Your First Report
            </Button>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
            <DialogDescription>
              Export "{selectedReport?.name}" in your preferred format.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => selectedReport && handleExportCSV(selectedReport)}
              data-testid="export-csv-btn"
            >
              <Download size={14} className="mr-2" /> Export as CSV
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{reportToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteReport}
              disabled={loading}
              data-testid="confirm-delete-btn"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
