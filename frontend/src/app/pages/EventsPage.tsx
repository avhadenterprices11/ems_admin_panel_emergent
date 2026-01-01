import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Upload, Download, Filter, ArrowUpDown, LayoutTemplate, Ellipsis,
  MapPin, CircleCheck, Archive, ChevronDown, Calendar, Activity, FileText, FolderArchive, Users, TrendingUp
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { ResponsiveTable, MobileCardConfig } from '../components/ui/responsive-table';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { ExportDialog, ExportColumn } from '../components/common/ExportDialog';
import { ImportDialog, ImportField } from '../components/common/ImportDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { StatsGrid } from '../components/common/StatsGrid';
import { ListControls } from '../components/common/ListControls';
import { MetricsGrid, type MetricData } from '../components/ui';
import { ResponsiveControl, ResponsiveMenuItem, ResponsiveMenuCheckboxItem, ResponsiveMenuLabel, ResponsiveMenuSeparator } from '../components/common/ResponsiveControl';
import { SavedViews, View } from '../components/common/SavedViews';
import { CreateViewDialog } from '../components/common/CreateViewDialog';

// Event interface
interface Event {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  eventOwner: string;
  location: string;
  registrations: number;
  checkedInCount: number;
  status: string;
  isRegistrationOpen: boolean;
  isCheckinActive: boolean;
}

// Mock data
const mockEvents: Event[] = [
  {
    id: "EVT-001",
    name: "Global Tech Summit 2024",
    type: "Conference",
    startDate: "Jan 15, 2024",
    endDate: "Jan 17, 2024",
    eventOwner: "Sarah Jenkins",
    location: "London, UK",
    registrations: 1250,
    checkedInCount: 1100,
    status: "Published",
    isRegistrationOpen: false,
    isCheckinActive: false,
  },
  {
    id: "EVT-002",
    name: "Product Launch Event",
    type: "Meetup",
    startDate: "Dec 28, 2024",
    endDate: "Dec 28, 2024",
    eventOwner: "Michael Chen",
    location: "San Francisco, CA",
    registrations: 450,
    checkedInCount: 380,
    status: "Live Today",
    isRegistrationOpen: false,
    isCheckinActive: true,
  },
  {
    id: "EVT-003",
    name: "Innovation Awards 2024",
    type: "Awards",
    startDate: "Feb 10, 2024",
    endDate: "Feb 10, 2024",
    eventOwner: "Emma Davis",
    location: "New York, NY",
    registrations: 800,
    checkedInCount: 0,
    status: "Draft",
    isRegistrationOpen: true,
    isCheckinActive: false,
  },
  {
    id: "EVT-004",
    name: "Developer Workshop Series",
    type: "Workshop",
    startDate: "Nov 20, 2024",
    endDate: "Nov 22, 2024",
    eventOwner: "Alex Rodriguez",
    location: "Austin, TX",
    registrations: 320,
    checkedInCount: 320,
    status: "Completed",
    isRegistrationOpen: false,
    isCheckinActive: false,
  },
  {
    id: "EVT-005",
    name: "Annual Community Meetup",
    type: "Meetup",
    startDate: "Mar 5, 2024",
    endDate: "Mar 5, 2024",
    eventOwner: "Lisa Thompson",
    location: "Seattle, WA",
    registrations: 180,
    checkedInCount: 0,
    status: "Published",
    isRegistrationOpen: true,
    isCheckinActive: false,
  },
  {
    id: "EVT-006",
    name: "Executive Leadership Summit",
    type: "Conference",
    startDate: "Apr 12, 2024",
    endDate: "Apr 14, 2024",
    eventOwner: "David Park",
    location: "Chicago, IL",
    registrations: 650,
    checkedInCount: 0,
    status: "Published",
    isRegistrationOpen: true,
    isCheckinActive: false,
  },
  {
    id: "EVT-007",
    name: "Design Thinking Workshop",
    type: "Workshop",
    startDate: "Jan 8, 2024",
    endDate: "Jan 9, 2024",
    eventOwner: "Nina Patel",
    location: "Boston, MA",
    registrations: 95,
    checkedInCount: 82,
    status: "Published",
    isRegistrationOpen: false,
    isCheckinActive: false,
  },
];

// Saved views
const defaultViews: View[] = [
  { id: 'all', label: 'All Events', type: 'system' },
  { id: 'active', label: 'Active', type: 'system' },
  { id: 'draft', label: 'Draft', type: 'system' },
  { id: 'archived', label: 'Archived', type: 'system' },
  { id: 'live', label: 'Live Today', type: 'system' },
];

// Export columns configuration
const exportColumns: ExportColumn[] = [
  { id: 'id', label: 'Event ID' },
  { id: 'name', label: 'Event Name' },
  { id: 'type', label: 'Type' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'endDate', label: 'End Date' },
  { id: 'eventOwner', label: 'Owner' },
  { id: 'location', label: 'Location' },
  { id: 'registrations', label: 'Total Registrations' },
  { id: 'checkedInCount', label: 'Checked In' },
  { id: 'status', label: 'Status' },
];

// Import fields configuration
const importFields: ImportField[] = [
  { id: 'name', label: 'Event Name', required: true, type: 'text' },
  { id: 'type', label: 'Event Type', required: true, type: 'select', options: ['Conference', 'Meetup', 'Workshop', 'Awards'] },
  { id: 'startDate', label: 'Start Date', required: true, type: 'date' },
  { id: 'endDate', label: 'End Date', required: true, type: 'date' },
  { id: 'location', label: 'Location', required: false, type: 'text' },
  { id: 'owner', label: 'Event Owner', required: false, type: 'email' }
];

// Helper functions
const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'Conference':
      return "text-purple-600 bg-purple-50";
    case 'Meetup':
      return "text-orange-600 bg-orange-50";
    case 'Awards':
      return "text-pink-600 bg-pink-50";
    default:
      return "text-blue-600 bg-blue-50";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Published':
      return "bg-emerald-50 text-[#00bc7d] hover:bg-emerald-100 border-none";
    case 'Live Today':
      return "bg-rose-50 text-rose-600 hover:bg-rose-100 border-none animate-pulse";
    case 'Draft':
      return "bg-slate-100 text-slate-500 hover:bg-slate-200 border-none";
    case 'Completed':
      return "bg-blue-50 text-[#4f39f6] hover:bg-blue-100 border-none";
    default:
      return "bg-slate-100 text-slate-500 border-none";
  }
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events] = useState<Event[]>(mockEvents);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewId, setActiveViewId] = useState('all');
  const [views, setViews] = useState<View[]>(defaultViews);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCreateViewDialogOpen, setIsCreateViewDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Filter events based on search
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.eventOwner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection handlers
  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredEvents.map(e => e.id));
    }
  };

  const isAllSelected = filteredEvents.length > 0 && selectedRows.length === filteredEvents.length;

  // Action handlers
  const onAddEvent = () => {
    navigate('/events/new');
  };

  const onManageEvent = (id: string) => {
    navigate(`/events/${id}`);
  };

  const handleAddView = (name: string) => {
    const newView: View = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      label: name,
      type: 'custom'
    };
    setViews([...views, newView]);
  };

  const handleExportData = (options: any) => {
    console.log('Export data:', options);
  };

  const handleImportData = (file: File, mode: any) => {
    console.log('Import data:', file, mode);
  };

  // Mobile config
  const mobileConfig: MobileCardConfig<Event> = {
    idField: (event) => event.id,
    valueField: (event) => (
      <span>{event.registrations.toLocaleString()} <span className="text-slate-400 font-normal text-xs">Reg.</span></span>
    ),
    titleField: (event) => event.name,
    statusField: (event) => (
      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold border-0 ${getStatusColor(event.status)}`}>
        {event.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Type", value: (e) => e.type },
      { label: "Date", value: (e) => `${e.startDate} - ${e.endDate}` },
      { label: "Location", value: (e) => e.location },
      { label: "Owner", value: (e) => e.eventOwner },
      { 
        label: "Attendance", 
        value: (e) => (
          <div className="flex items-center gap-2">
            <span>{e.checkedInCount.toLocaleString()} checked in</span>
            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${(e.checkedInCount / e.registrations) * 100}%` }}
              />
            </div>
          </div>
        )
      }
    ],
    actions: (event) => (
      <div className="flex gap-2 w-full">
        <Button 
          size="sm" 
          className="flex-1 bg-[#0f172b] text-white hover:bg-[#1d293d]"
          onClick={() => onManageEvent(event.id)}
        >
          Manage
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          More
        </Button>
      </div>
    )
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. TOP UTILITY BAR */}
      <PageHeader 
        dateRangePicker={<DatePickerWithRange />}
        primaryAction={{
          label: "Add New Event",
          onClick: onAddEvent,
          icon: <Plus size={16} className="mr-2" />
        }}
        secondaryActions={
          <>
            <Button className="h-[38px] bg-[#0e042f] hover:bg-[#1d293d] text-white w-full md:w-auto shadow-sm transition-colors rounded-xl" onClick={() => setIsImportDialogOpen(true)}>
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button className="h-[38px] bg-[#0e042f] hover:bg-[#1d293d] text-white w-full md:w-auto shadow-sm transition-colors rounded-xl" onClick={() => setIsExportDialogOpen(true)}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </>
        }
      />

      {/* 2. METRICS SUMMARY ROW */}
      <MetricsGrid metrics={[
        { 
          title: "Total Events", 
          value: "124",
          icon: Calendar,
          bgClass: "bg-[#7151ff]",
          colorClass: "text-white",
          tooltipText: "Total number of events in the system"
        },
        { 
          title: "Active Events", 
          value: "45", 
          icon: Activity,
          bgClass: "bg-[#00af35]",
          colorClass: "text-white",
          tooltipText: "Events currently live or upcoming"
        },
        { 
          title: "Draft Events", 
          value: "12", 
          icon: FileText,
          bgClass: "bg-[#089cff]",
          colorClass: "text-white",
          tooltipText: "Events in draft status, not yet published"
        },
        { 
          title: "Total Registrations", 
          value: "3,820", 
          icon: Users,
          bgClass: "bg-[#da41c5]",
          colorClass: "text-white",
          tooltipText: "Total registrations across all events"
        },
        { 
          title: "Growth Rate", 
          value: "+12%", 
          icon: TrendingUp,
          bgClass: "bg-[#fab446]",
          colorClass: "text-white",
          tooltipText: "Registration growth compared to last month"
        },
      ]} />

      {/* 3. TABLE CONTROL BAR */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search events..."
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
            <ResponsiveMenuItem>Event Type</ResponsiveMenuItem>
            <ResponsiveMenuItem>Location</ResponsiveMenuItem>
            <ResponsiveMenuItem>Owner</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Registration Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Attendance Range</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Start Date (Newest)</ResponsiveMenuItem>
            <ResponsiveMenuItem>Start Date (Oldest)</ResponsiveMenuItem>
            <ResponsiveMenuItem>Attendance (High → Low)</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Event Name (A-Z)</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Event Details</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Type</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Start Date</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>End Date</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Owner</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Location</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Attendance</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
          </ResponsiveControl>
        }
        moreControl={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-[38px] w-[38px] rounded-lg hover:bg-slate-100 text-slate-600">
                <Ellipsis size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuItem onClick={() => setIsCreateViewDialogOpen(true)}>
                <Plus size={14} className="mr-2" /> Save Current View
              </DropdownMenuItem>
              <DropdownMenuItem>
                Rename Saved View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Bulk Edit</DropdownMenuItem>
              <DropdownMenuItem>Bulk Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Bulk Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* 4. BULK ACTIONS BAR */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {selectedRows.length} Selected
            </span>
            <span className="text-sm text-blue-800">events selected for action</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <CircleCheck size={14} className="mr-2" /> Publish
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Archive size={14} className="mr-2" /> Archive
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Download size={14} className="mr-2" /> Export Attendees
            </Button>
          </div>
        </div>
      )}

      {/* 5. DATA TABLE + PAGINATION */}
      <ResponsiveTable
        data={filteredEvents}
        mobileConfig={mobileConfig}
        selectedRows={selectedRows}
        onToggleRow={toggleRow}
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
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider h-[50px]">Event Details</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Start Date</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">End Date</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Owner</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Location</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Attendance</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow 
                      key={event.id} 
                      className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(event.id) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => onManageEvent(event.id)} 
                    >
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(event.id)}
                          onCheckedChange={() => toggleRow(event.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#1d293d] text-[13px]">{event.name}</span>
                          <span className="text-[11px] text-[#62748e]">{event.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#1d293d] text-[13px] font-medium">
                        {event.startDate}
                      </TableCell>
                      <TableCell className="text-[#62748e] text-[13px]">
                        {event.endDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">
                            {event.eventOwner.charAt(0)}
                          </div>
                          <span className="text-[#1d293d] text-[13px]">{event.eventOwner}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[#62748e] text-[13px]">
                          <MapPin size={12} />
                          <span className="truncate max-w-[100px]" title={event.location}>{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-[#1d293d] text-[13px]">{event.checkedInCount.toLocaleString()}</span>
                            <span className="text-[11px] text-[#94a3b8]">/ {event.registrations.toLocaleString()}</span>
                          </div>
                          <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(event.checkedInCount / event.registrations) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${getStatusColor(event.status)}`}>
                            {event.status}
                          </Badge>
                          {event.isCheckinActive && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Check-in Active
                            </div>
                          )}
                          {!event.isCheckinActive && event.isRegistrationOpen && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Reg. Open
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Footer */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                {/* Left side: Results info + Rows per page */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Showing <span className="font-bold text-slate-700">1-{filteredEvents.length}</span> of <span className="font-bold text-slate-700">124</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rows per page:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 text-slate-600 rounded-lg px-2 gap-1">
                          {pageSize} <ChevronDown size={12} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {[10, 25, 50, 100].map(size => (
                          <DropdownMenuItem key={size} onClick={() => setPageSize(size)}>
                            {size}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Right side: Pagination controls */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" disabled>Previous</Button>
                  <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" className="h-8 w-8 text-xs bg-blue-50 text-blue-600 font-bold rounded-lg">1</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">2</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">3</Button>
                    <span className="text-xs text-slate-400">...</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Next</Button>
                </div>
              </div>
            </div>
          </div>
        )} 
      />

      {/* Export Dialog */}
      <ExportDialog 
        open={isExportDialogOpen} 
        onOpenChange={setIsExportDialogOpen}
        moduleName="Events"
        totalCount={events.length}
        selectedCount={selectedRows.length}
        columns={exportColumns}
        supportsDateRange={true}
        onExport={handleExportData}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        moduleName="Events"
        fields={importFields}
        onImport={handleImportData}
      />

      {/* Create View Dialog */}
      <CreateViewDialog
        open={isCreateViewDialogOpen}
        onOpenChange={setIsCreateViewDialogOpen}
        onAddView={handleAddView}
      />
    </div>
  );
};