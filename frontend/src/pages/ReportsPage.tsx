import React, { useState } from 'react';
import { 
  Plus, Download, Filter, LayoutTemplate, MoreHorizontal, 
  BarChart, PieChart, LineChart, FileSpreadsheet, ArrowUpDown, Play
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../components/ui/dropdown-menu";
import { DatePickerWithRange } from "../components/ui/date-range-picker";
import { PageHeader } from "../components/ui/PageHeader";
import { StatsGrid } from "../components/common/StatsGrid";
import { ListControls } from "../components/common/ListControls";
import { ResponsiveControl, ResponsiveMenuItem, ResponsiveMenuCheckboxItem, ResponsiveMenuLabel, ResponsiveMenuSeparator } from "../components/common/ResponsiveControl";
import { ExportDialog, ExportColumn, ExportOptions } from "../components/common/ExportDialog";
import { SavedViews, View } from "../components/common/SavedViews";
import { CreateViewDialog } from "../components/common/CreateViewDialog";
import { ResponsiveTable, MobileCardConfig } from "../components/ui/responsive-table";

interface ReportsPageProps {
  onManageReport?: (id: string) => void;
  onCreateReport?: () => void;
  onViewAnalytics?: (reportType: string) => void;
}

const savedReports = [
  {
    id: "RPT-001",
    name: "Weekly Registration Summary",
    type: "Summary",
    module: "Events",
    schedule: "Weekly (Mon)",
    lastGenerated: "2 days ago",
    owner: "Sarah Jenkins"
  },
  {
    id: "RPT-002",
    name: "Monthly Revenue Report",
    type: "Financial",
    module: "Finance",
    schedule: "Monthly (1st)",
    lastGenerated: "1 week ago",
    owner: "Finance Team"
  },
  {
    id: "RPT-003",
    name: "Attendee Demographics",
    type: "Analytics",
    module: "People",
    schedule: "One-time",
    lastGenerated: "3 weeks ago",
    owner: "Mike Ross"
  },
  {
    id: "RPT-004",
    name: "Campaign Performance Q1",
    type: "Analytics",
    module: "Communications",
    schedule: "One-time",
    lastGenerated: "1 month ago",
    owner: "Jessica Pearson"
  }
];

const QuickReportCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3" onClick={onClick}>
    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-[#1d293d]">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <div className="mt-auto pt-2 flex items-center text-xs font-bold text-blue-600">
      Generate Now <ArrowUpDown className="ml-1 h-3 w-3 rotate-90" />
    </div>
  </div>
);

const getModuleColor = (module: string) => {
  switch (module) {
    case 'Events':
      return "text-blue-600 bg-blue-50";
    case 'Finance':
      return "text-emerald-600 bg-emerald-50";
    case 'People':
      return "text-purple-600 bg-purple-50";
    case 'Communications':
      return "text-orange-600 bg-orange-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
};

export function ReportsPage({ onManageReport, onCreateReport, onViewAnalytics }: ReportsPageProps) {
  const [activeViewId, setActiveViewId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const views: View[] = [
    { id: 'all', name: 'All Reports', isSystem: true },
    { id: 'scheduled', name: 'Scheduled', isSystem: true },
    { id: 'generated', name: 'Generated', isSystem: true },
    { id: 'failed', name: 'Failed', isSystem: true }
  ];

  const handleAddView = (name: string) => {
    console.log('Adding view:', name);
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(selectedRows.length === savedReports.length ? [] : savedReports.map(r => r.id));
  };

  const isAllSelected = selectedRows.length === savedReports.length && savedReports.length > 0;

  const filteredReports = savedReports.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'Report ID', enabled: true },
    { id: 'name', label: 'Report Name', enabled: true },
    { id: 'type', label: 'Type', enabled: true },
    { id: 'module', label: 'Module', enabled: true },
    { id: 'schedule', label: 'Schedule', enabled: true },
    { id: 'lastGenerated', label: 'Last Generated', enabled: true },
    { id: 'owner', label: 'Owner', enabled: true }
  ];

  const handleExport = (options: ExportOptions) => {
    console.log('Exporting with options:', options);
    setIsExportDialogOpen(false);
  };

  const mobileConfig: MobileCardConfig<typeof savedReports[0]> = {
    idField: (r) => r.id,
    titleField: (r) => r.name,
    valueField: (r) => r.id,
    statusField: (r) => (
      <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getModuleColor(r.module)}`}>
        {r.module}
      </Badge>
    ),
    expandedFields: [
      { label: 'Type', value: (r) => r.type },
      { label: 'Schedule', value: (r) => r.schedule },
      { label: 'Last Generated', value: (r) => r.lastGenerated },
      { label: 'Owner', value: (r) => r.owner }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Date Range Picker */}
        <DatePickerWithRange />
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button 
            className="h-[38px] bg-[#1d293d] text-white hover:bg-[#2a3a52]"
            onClick={onCreateReport || (() => {})}
          >
            <Plus size={16} className="mr-2" />
            Create Custom Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Saved Reports</div>
          <div className="text-3xl font-bold text-[#1d293d]">12</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Scheduled Reports</div>
          <div className="text-3xl font-bold text-[#1d293d]">5</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Dashboards</div>
          <div className="text-3xl font-bold text-[#1d293d]">3</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exports This Month</div>
          <div className="text-3xl font-bold text-[#1d293d]">45</div>
        </div>
      </div>

      {/* Quick Reports Grid */}
      <div>
        <h3 className="text-lg font-bold text-[#1d293d] mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickReportCard 
            icon={<BarChart className="text-blue-600" size={20} />} 
            title="Event Performance" 
            desc="Registration vs Attendance"
            onClick={() => onViewAnalytics && onViewAnalytics('event-performance')}
          />
          <QuickReportCard 
            icon={<PieChart className="text-purple-600" size={20} />} 
            title="Registration Funnel" 
            desc="Conversion Rates"
            onClick={() => onViewAnalytics && onViewAnalytics('registration-funnel')}
          />
          <QuickReportCard 
            icon={<LineChart className="text-emerald-600" size={20} />} 
            title="Revenue Summary" 
            desc="Earnings over time"
            onClick={() => onViewAnalytics && onViewAnalytics('revenue-summary')}
          />
          <QuickReportCard 
            icon={<FileSpreadsheet className="text-orange-600" size={20} />} 
            title="Attendance Analytics" 
            desc="Check-in breakdown"
            onClick={() => onViewAnalytics && onViewAnalytics('attendance')}
          />
        </div>
      </div>

      {/* Saved Reports Section */}
      <div>
        <h3 className="text-lg font-bold text-[#1d293d] mb-4">Saved Reports</h3>

        {/* List Controls */}
        <ListControls 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search saved reports..."
          scopeSelector={
            <SavedViews 
              views={views} 
              activeViewId={activeViewId} 
              onViewChange={setActiveViewId} 
            />
          }
          filterControl={
            <ResponsiveControl label="Filter" icon={<Filter size={16} />}>
              <ResponsiveMenuLabel>Filter By</ResponsiveMenuLabel>
              <ResponsiveMenuSeparator />
              <ResponsiveMenuItem>Report Type</ResponsiveMenuItem>
              <ResponsiveMenuItem>Module</ResponsiveMenuItem>
              <ResponsiveMenuItem>Frequency</ResponsiveMenuItem>
              <ResponsiveMenuItem>Owner</ResponsiveMenuItem>
            </ResponsiveControl>
          }
          sortControl={null}
          columnsControl={
            <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
              <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
              <ResponsiveMenuSeparator />
              <ResponsiveMenuCheckboxItem checked disabled>Report Name</ResponsiveMenuCheckboxItem>
              <ResponsiveMenuCheckboxItem checked>Type</ResponsiveMenuCheckboxItem>
              <ResponsiveMenuCheckboxItem checked>Module</ResponsiveMenuCheckboxItem>
              <ResponsiveMenuCheckboxItem checked>Schedule</ResponsiveMenuCheckboxItem>
              <ResponsiveMenuCheckboxItem checked>Last Generated</ResponsiveMenuCheckboxItem>
              <ResponsiveMenuCheckboxItem checked>Owner</ResponsiveMenuCheckboxItem>
            </ResponsiveControl>
          }
          moreControl={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-[38px] w-[38px] rounded-lg hover:bg-slate-100 text-slate-600">
                  <MoreHorizontal size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <CreateViewDialog onAddView={handleAddView}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus size={14} className="mr-2" /> Save Current View
                  </DropdownMenuItem>
                </CreateViewDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Bulk Export</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Bulk Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />

        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2 mb-4">
            <div className="flex items-center gap-3 px-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">{selectedRows.length} Selected</span>
              <span className="text-sm text-blue-800">reports selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
                <Play size={14} className="mr-2" /> Run Now
              </Button>
              <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
                <Download size={14} className="mr-2" /> Export
              </Button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <ResponsiveTable
          data={filteredReports}
          mobileConfig={mobileConfig}
          renderDesktop={() => (
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-1">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="w-[50px] pl-4">
                        <Checkbox 
                          checked={isAllSelected}
                          onCheckedChange={toggleAll}
                          className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider h-[50px]">Report Name</TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Module</TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Schedule</TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Last Generated</TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Owner</TableHead>
                      <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((r) => (
                      <TableRow 
                        key={r.id}
                        className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(r.id) ? 'bg-slate-50/80' : ''}`}
                        onClick={() => onManageReport && onManageReport(r.id)}
                      >
                        <TableCell className="pl-4">
                          <Checkbox 
                            checked={selectedRows.includes(r.id)}
                            onCheckedChange={() => toggleRow(r.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-[#1d293d] text-[13px]">{r.name}</span>
                            <span className="text-[11px] text-[#62748e]">{r.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-md px-2 py-0.5 font-normal text-[11px] border-none bg-slate-50 text-slate-600">
                            {r.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getModuleColor(r.module)}`}>
                            {r.module}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-[#1d293d] text-[13px]">{r.schedule}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[#62748e] text-[13px]">{r.lastGenerated}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[#62748e] text-[13px]">{r.owner}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal size={16} className="text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-[#62748e]">
                  Showing <span className="font-medium text-[#1d293d]">1-4</span> of <span className="font-medium text-[#1d293d]">4</span> reports
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs">Previous</Button>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs">Next</Button>
                </div>
              </div>
            </div>
          )} 
        />
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        title="Export Reports"
        description="Configure export settings for saved reports"
        columns={exportColumns}
        onExport={handleExport}
      />
    </div>
  );
}