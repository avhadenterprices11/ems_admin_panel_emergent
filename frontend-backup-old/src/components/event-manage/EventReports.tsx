import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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

interface Report {
  id: string;
  name: string;
  type: string;
  author: string;
  lastRun: string;
  status: string;
}

export function EventReports() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'builder' | 'view'>('dashboard');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportReportName, setExportReportName] = useState('');

  const MOCK_SAVED_REPORTS: Report[] = [
    { id: "RPT-001", name: "Ticket Sales Summary", type: "Sales", author: "System", lastRun: "Today, 2:30 PM", status: "Ready" },
    { id: "RPT-002", name: "Registration Breakdown", type: "Registrations", author: "Admin", lastRun: "Today, 11:15 AM", status: "Ready" },
    { id: "RPT-003", name: "Revenue by Channel", type: "Revenue", author: "Admin", lastRun: "Yesterday, 4:45 PM", status: "Ready" },
    { id: "RPT-004", name: "Attendee Demographics", type: "Attendees", author: "System", lastRun: "Oct 24, 9:00 AM", status: "Ready" },
    { id: "RPT-005", name: "Marketing Performance", type: "Marketing", author: "Marketing Team", lastRun: "Oct 23, 3:20 PM", status: "Ready" },
  ];

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setViewMode('view');
  };

  const handleExportClick = (reportName: string) => {
    setExportReportName(reportName);
    setIsExportOpen(true);
  };

  if (viewMode === 'builder') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1d293d]">Custom Report Builder</h3>
            <p className="text-sm text-slate-500 mt-1">Create custom reports with filters, metrics, and visualizations</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('dashboard')}>
            Cancel
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
          <div className="text-center text-slate-400">
            <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="font-medium text-slate-900 mb-1">Report Builder Interface</h3>
            <p className="text-sm max-w-md mx-auto">
              Drag-and-drop report builder similar to Looker/Shopify with custom fields, filters, and chart types would be implemented here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'view' && selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1d293d]">{selectedReport.name}</h3>
            <p className="text-sm text-slate-500 mt-1">Last run: {selectedReport.lastRun}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode('builder')}>
              <FileEdit size={16} className="mr-2" /> Edit
            </Button>
            <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" onClick={() => handleExportClick(selectedReport.name)}>
              <Download size={16} className="mr-2" /> Export
            </Button>
            <Button variant="outline" onClick={() => setViewMode('dashboard')}>
              Back
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
          <div className="space-y-6">
            {/* Mock Report Content */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900">$125,000</h3>
                <p className="text-xs text-emerald-600 mt-1">
                  <TrendingUp size={12} className="inline mr-1" />
                  +15% vs last event
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Tickets Sold</p>
                <h3 className="text-2xl font-bold text-slate-900">895</h3>
                <p className="text-xs text-slate-500 mt-1">50% capacity</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Avg. Order Value</p>
                <h3 className="text-2xl font-bold text-slate-900">$140</h3>
                <p className="text-xs text-slate-500 mt-1">Per transaction</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-6">
              <h4 className="font-bold text-[#1d293d] mb-4">Revenue by Ticket Type</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">General Admission</span>
                    <span className="text-sm font-bold text-slate-900">$25,000</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">VIP Access</span>
                    <span className="text-sm font-bold text-slate-900">$25,000</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 bg-purple-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Early Bird</span>
                    <span className="text-sm font-bold text-slate-900">$25,000</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Revenue by Ticket Type</h4>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink size={14} className="text-slate-400" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">General Admission</span>
              <span className="text-sm font-bold text-slate-900">$25,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">VIP Access</span>
              <span className="text-sm font-bold text-slate-900">$25,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Early Bird</span>
              <span className="text-sm font-bold text-slate-900">$25,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Top Performing Days</h4>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink size={14} className="text-slate-400" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Oct 20 (Launch Day)</span>
              <span className="text-sm font-bold text-emerald-600">432 sales</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Oct 21</span>
              <span className="text-sm font-bold text-slate-900">287 sales</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Oct 22</span>
              <span className="text-sm font-bold text-slate-900">198 sales</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Discount Performance</h4>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink size={14} className="text-slate-400" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">EARLYBIRD20</span>
              <span className="text-sm font-bold text-slate-900">348 uses</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">STUDENT15</span>
              <span className="text-sm font-bold text-slate-900">87 uses</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">VIP10</span>
              <span className="text-sm font-bold text-slate-900">45 uses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Reports */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-[#1d293d]">Saved Reports</h3>
          <Button className="bg-[#0f172b]" onClick={() => setViewMode('builder')}>
            <Plus size={16} className="mr-2" /> Create Custom Report
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Report Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SAVED_REPORTS.map((report) => (
              <TableRow 
                key={report.id} 
                className="hover:bg-slate-50/60 cursor-pointer"
                onClick={() => handleViewReport(report)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium text-[#1d293d]">{report.name}</div>
                    <div className="text-xs text-slate-400">ID: {report.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{report.type}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{report.author}</TableCell>
                <TableCell className="text-sm text-slate-600">{report.lastRun}</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-50 text-emerald-600 border-0">
                    <Check size={10} className="mr-1" /> {report.status}
                  </Badge>
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
                      <DropdownMenuItem>
                        <FileEdit size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy size={14} className="mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExportClick(report.name)}>
                        <Download size={14} className="mr-2" /> Export
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock size={14} className="mr-2" /> Schedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
            <DialogDescription>
              Export "{exportReportName}" in your preferred format.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Download size={14} className="mr-2" /> Export as CSV
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download size={14} className="mr-2" /> Export as Excel
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download size={14} className="mr-2" /> Export as PDF
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}