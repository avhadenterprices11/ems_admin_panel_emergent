import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Upload, Download, Filter, ArrowUpDown, LayoutTemplate, Ellipsis,
  MapPin, CircleCheck, Archive, ChevronDown, Calendar, Activity, FileText, FolderArchive, Users, TrendingUp
} from 'lucide-react';
import { eventsAPI, savedViewsAPI } from '../api/events.api';
import { toast } from 'sonner';
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

// Event interface (matching backend)
interface Event {
  id: string;
  event_code: string;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  owner: string;
  location: string;
  total_registrations: number;
  checked_in_count: number;
  capacity: number | null;
  status: string;
  is_registration_open: boolean;
  is_checkin_active: boolean;
}


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
  
  // State
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    activeEvents: 0,
    draftEvents: 0,
    totalRegistrations: 0,
    growthRate: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewId, setActiveViewId] = useState('all');
  const [views, setViews] = useState<View[]>(defaultViews);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCreateViewDialogOpen, setIsCreateViewDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('start_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState<any>({});
  const [dateRange, setDateRange] = useState<any>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    startDate: true,
    endDate: true,
    owner: true,
    location: true,
    attendance: true,
    status: true,
  });

  // Handle sort changes
  const handleSortChange = (value: string) => {
    switch (value) {
      case 'start-newest':
        setSortBy('start_date');
        setSortOrder('desc');
        break;
      case 'start-oldest':
        setSortBy('start_date');
        setSortOrder('asc');
        break;
      case 'attendance-high':
        setSortBy('total_registrations');
        setSortOrder('desc');
        break;
      case 'attendance-low':
        setSortBy('total_registrations');
        setSortOrder('asc');
        break;
      case 'status':
        setSortBy('status');
        setSortOrder('asc');
        break;
      case 'name-az':
        setSortBy('name');
        setSortOrder('asc');
        break;
      case 'name-za':
        setSortBy('name');
        setSortOrder('desc');
        break;
    }
  };

  // Handle bulk actions
  const handleBulkArchive = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select events to archive');
      return;
    }
    try {
      await eventsAPI.bulkArchive(selectedRows);
      toast.success(`${selectedRows.length} event(s) archived successfully`);
      setSelectedRows([]);
      fetchEvents();
      fetchMetrics();
    } catch (error) {
      toast.error('Failed to archive events');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select events to delete');
      return;
    }
    try {
      await eventsAPI.bulkDelete(selectedRows);
      toast.success(`${selectedRows.length} event(s) deleted successfully`);
      setSelectedRows([]);
      fetchEvents();
      fetchMetrics();
    } catch (error) {
      toast.error('Failed to delete events');
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveViewId('all');
    setFilters({});
    setDateRange(null);
    setSortBy('start_date');
    setSortOrder('desc');
    setPagination({ ...pagination, page: 1 });
  };

  // Handle save view
  const handleSaveView = async (name: string) => {
    try {
      const configuration = {
        search: searchQuery,
        tab: activeViewId,
        filters,
        dateRange: dateRange ? {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString(),
        } : null,
        sortBy,
        sortOrder,
        visibleColumns,
        pageSize,
      };
      
      await savedViewsAPI.createView(name, 'events', configuration);
      toast.success('View saved successfully');
      
      // Refresh views list
      const viewsResult = await savedViewsAPI.getViews('events');
      const customViews = viewsResult.data.map((v: any) => ({
        id: v.id.toString(),
        label: v.name,
        type: 'custom',
      }));
      setViews([...defaultViews, ...customViews]);
    } catch (error) {
      toast.error('Failed to save view');
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        pageSize,
        search: searchQuery || undefined,
        tab: activeViewId !== 'all' ? activeViewId : undefined,
        sortBy,
        sortOrder,
        ...filters,
      };

      if (dateRange?.from) {
        params.startDateFrom = dateRange.from.toISOString();
      }
      if (dateRange?.to) {
        params.startDateTo = dateRange.to.toISOString();
      }

      const result = await eventsAPI.getEvents(params);
      setEvents(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const params: any = {
        tab: activeViewId !== 'all' ? activeViewId : undefined,
      };

      if (dateRange?.from) {
        params.startDateFrom = dateRange.from.toISOString();
      }
      if (dateRange?.to) {
        params.startDateTo = dateRange.to.toISOString();
      }

      const result = await eventsAPI.getMetrics(params);
      setMetrics(result);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents();
    fetchMetrics();
  }, [pagination.page, pageSize, searchQuery, activeViewId, sortBy, sortOrder, filters, dateRange]);

  const filteredEvents = events;

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
    idField: (event) => event.event_code,
    valueField: (event) => (
      <span>{event.total_registrations.toLocaleString()} <span className="text-slate-400 font-normal text-xs">Reg.</span></span>
    ),
    titleField: (event) => event.name,
    statusField: (event) => (
      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold border-0 ${getStatusColor(event.status)}`}>
        {event.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Type", value: (e) => e.type },
      { label: "Start Date", value: (e) => new Date(e.start_date).toLocaleDateString() },
      { label: "End Date", value: (e) => new Date(e.end_date).toLocaleDateString() },
      { label: "Owner", value: (e) => e.owner },
      { label: "Location", value: (e) => e.location },
      { label: "Checked In", value: (e) => `${e.checked_in_count}/${e.total_registrations}` },
    ],
    actions: (event) => (
      <div className="flex gap-2 w-full">
        <Button 
          size="sm" 
          className="flex-1 bg-[#0f172b] text-white hover:bg-[#1d293d]"
          onClick={() => onManageEvent(event.event_code)}
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
          value: metrics.totalEvents.toString(),
          icon: Calendar,
          bgClass: "bg-[#7151ff]",
          colorClass: "text-white",
          tooltipText: "Total number of events in the system"
        },
        { 
          title: "Active Events", 
          value: metrics.activeEvents.toString(), 
          icon: Activity,
          bgClass: "bg-[#00af35]",
          colorClass: "text-white",
          tooltipText: "Events currently live or upcoming"
        },
        { 
          title: "Draft Events", 
          value: metrics.draftEvents.toString(), 
          icon: FileText,
          bgClass: "bg-[#089cff]",
          colorClass: "text-white",
          tooltipText: "Events in draft status, not yet published"
        },
        { 
          title: "Total Registrations", 
          value: metrics.totalRegistrations.toLocaleString(), 
          icon: Users,
          bgClass: "bg-[#da41c5]",
          colorClass: "text-white",
          tooltipText: "Total registrations across all events"
        },
        { 
          title: "Growth Rate", 
          value: `${metrics.growthRate > 0 ? '+' : ''}${metrics.growthRate}%`, 
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
            <ResponsiveMenuItem onClick={() => handleSortChange('start-newest')}>
              Start Date (Newest)
            </ResponsiveMenuItem>
            <ResponsiveMenuItem onClick={() => handleSortChange('start-oldest')}>
              Start Date (Oldest)
            </ResponsiveMenuItem>
            <ResponsiveMenuItem onClick={() => handleSortChange('attendance-high')}>
              Attendance (High → Low)
            </ResponsiveMenuItem>
            <ResponsiveMenuItem onClick={() => handleSortChange('status')}>
              Status
            </ResponsiveMenuItem>
            <ResponsiveMenuItem onClick={() => handleSortChange('name-az')}>
              Event Name (A-Z)
            </ResponsiveMenuItem>
            <ResponsiveMenuItem onClick={() => handleSortChange('name-za')}>
              Event Name (Z-A)
            </ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Event Details</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.type}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, type: checked})}
            >
              Type
            </ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.startDate}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, startDate: checked})}
            >
              Start Date
            </ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.endDate}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, endDate: checked})}
            >
              End Date
            </ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.owner}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, owner: checked})}
            >
              Owner
            </ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.location}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, location: checked})}
            >
              Location
            </ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.attendance}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, attendance: checked})}
            >
              Attendance
            </ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem 
              checked={visibleColumns.status}
              onCheckedChange={(checked) => setVisibleColumns({...visibleColumns, status: checked})}
            >
              Status
            </ResponsiveMenuCheckboxItem>
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
              <DropdownMenuItem disabled>
                Rename Saved View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Bulk Edit (Coming Soon)</DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkArchive} disabled={selectedRows.length === 0}>
                Bulk Archive ({selectedRows.length})
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600" 
                onClick={handleBulkDelete}
                disabled={selectedRows.length === 0}
              >
                Bulk Delete ({selectedRows.length})
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleResetFilters}>Reset Filters</DropdownMenuItem>
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
                    {visibleColumns.type && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Type</TableHead>}
                    {visibleColumns.startDate && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Start Date</TableHead>}
                    {visibleColumns.endDate && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">End Date</TableHead>}
                    {visibleColumns.owner && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Owner</TableHead>}
                    {visibleColumns.location && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Location</TableHead>}
                    {visibleColumns.attendance && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Attendance</TableHead>}
                    {visibleColumns.status && <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                          <span>Loading events...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                    <TableRow 
                      key={event.event_code} 
                      className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(event.event_code) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => onManageEvent(event.event_code)} 
                    >
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(event.event_code)}
                          onCheckedChange={() => toggleRow(event.event_code)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#1d293d] text-[13px]">{event.name}</span>
                          <span className="text-[11px] text-[#62748e]">{event.event_code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#1d293d] text-[13px] font-medium">
                        {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-[#62748e] text-[13px]">
                        {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">
                            {event.owner.charAt(0)}
                          </div>
                          <span className="text-[#1d293d] text-[13px]">{event.owner}</span>
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
                            <span className="font-bold text-[#1d293d] text-[13px]">{event.checked_in_count.toLocaleString()}</span>
                            <span className="text-[11px] text-[#94a3b8]">/ {event.total_registrations.toLocaleString()}</span>
                          </div>
                          <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(event.checked_in_count / event.total_registrations) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${getStatusColor(event.status)}`}>
                            {event.status}
                          </Badge>
                          {event.is_checkin_active && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Check-in Active
                            </div>
                          )}
                          {!event.is_checkin_active && event.is_registration_open && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Reg. Open
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Footer */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                {/* Left side: Results info + Rows per page */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        Showing <span className="font-bold text-slate-700">{((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.totalRecords)}</span> of <span className="font-bold text-slate-700">{pagination.totalRecords}</span> results
                      </>
                    )}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 3) }, (_, i) => i + 1).map(page => (
                      <Button 
                        key={page}
                        variant={page === pagination.page ? "secondary" : "ghost"}
                        size="sm" 
                        className={`h-8 w-8 text-xs rounded-lg ${page === pagination.page ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        onClick={() => setPagination({...pagination, page})}
                      >
                        {page}
                      </Button>
                    ))}
                    {pagination.totalPages > 3 && <span className="text-xs text-slate-400">...</span>}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                  >
                    Next
                  </Button>
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