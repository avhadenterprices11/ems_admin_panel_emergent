import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Upload, 
  Download, 
  Calendar,
  MapPin,
  Users,
  Mic,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  LayoutTemplate,
  Archive
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { PageHeader } from '../components/ui/PageHeader';
import { StatsGrid } from '../components/common/StatsGrid';
import { ListControls } from '../components/common/ListControls';
import { SavedViews, View } from '../components/common/SavedViews';
import { ResponsiveControl, ResponsiveMenuItem, ResponsiveMenuCheckboxItem, ResponsiveMenuLabel, ResponsiveMenuSeparator } from '../components/common/ResponsiveControl';
import { ResponsiveTable, MobileCardConfig } from '../components/ui/responsive-table';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { ExportDialog, ExportColumn, ExportOptions } from '../components/common/ExportDialog';
import { CreateViewDialog } from '../components/common/CreateViewDialog';

interface Conference {
  id: string;
  name: string;
  dates: string;
  location: string;
  sessions: number;
  speakers: number;
  status: 'Planning' | 'Active' | 'Completed';
}

const mockConferences: Conference[] = [
  { id: 'CONF-001', name: 'Global Education Summit 2024', dates: 'Mar 15-18, 2024', location: 'London, UK', sessions: 24, speakers: 32, status: 'Planning' },
  { id: 'CONF-002', name: 'Innovation in Learning Conference', dates: 'Apr 10-12, 2024', location: 'New York, USA', sessions: 18, speakers: 28, status: 'Planning' },
  { id: 'CONF-003', name: 'International Teaching Symposium', dates: 'May 5-7, 2024', location: 'Sydney, Australia', sessions: 15, speakers: 22, status: 'Planning' },
  { id: 'CONF-004', name: 'Digital Learning Expo', dates: 'Feb 20-22, 2024', location: 'Toronto, Canada', sessions: 20, speakers: 35, status: 'Active' },
  { id: 'CONF-005', name: 'EdTech Summit 2024', dates: 'Mar 8-10, 2024', location: 'San Francisco, USA', sessions: 22, speakers: 30, status: 'Active' },
  { id: 'CONF-006', name: 'Higher Education Forum', dates: 'Apr 3-5, 2024', location: 'Singapore', sessions: 16, speakers: 25, status: 'Active' },
  { id: 'CONF-007', name: 'Future of Education Summit', dates: 'Jan 15-17, 2024', location: 'Berlin, Germany', sessions: 19, speakers: 27, status: 'Completed' },
  { id: 'CONF-008', name: 'Learning Technologies Conference', dates: 'Jan 22-24, 2024', location: 'Amsterdam, Netherlands', sessions: 21, speakers: 29, status: 'Completed' },
  { id: 'CONF-009', name: 'Academic Excellence Conference', dates: 'Feb 5-7, 2024', location: 'Paris, France', sessions: 17, speakers: 24, status: 'Completed' },
  { id: 'CONF-010', name: 'Global Educators Forum', dates: 'Feb 12-14, 2024', location: 'Tokyo, Japan', sessions: 23, speakers: 33, status: 'Completed' },
  { id: 'CONF-011', name: 'Student Success Conference', dates: 'May 20-22, 2024', location: 'Melbourne, Australia', sessions: 14, speakers: 20, status: 'Planning' },
  { id: 'CONF-012', name: 'Research & Innovation Summit', dates: 'Jun 10-12, 2024', location: 'Dublin, Ireland', sessions: 25, speakers: 38, status: 'Planning' },
];

export const ConferencesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isNewConferenceOpen, setIsNewConferenceOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [activeViewId, setActiveViewId] = useState('all');
  const [conferences] = useState<Conference[]>(mockConferences);
  
  const [views, setViews] = useState<View[]>([
    { id: 'all', label: 'All Conferences', type: 'system' },
    { id: 'planning', label: 'Planning', type: 'system' },
    { id: 'active', label: 'Active', type: 'system' },
    { id: 'completed', label: 'Completed', type: 'system' },
  ]);

  const [newConference, setNewConference] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'Planning' as const
  });

  // Filter conferences by active view
  const filteredConferences = conferences.filter(conf => {
    const matchesView = 
      activeViewId === 'all' ? true :
      activeViewId === 'planning' ? conf.status === 'Planning' :
      activeViewId === 'active' ? conf.status === 'Active' :
      activeViewId === 'completed' ? conf.status === 'Completed' :
      true;

    const matchesSearch = searchQuery === '' || 
      conf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conf.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesView && matchesSearch;
  });

  const handleManageConference = (id: string) => {
    navigate(`/conferences/${id}`);
  };

  const handleCreateConference = () => {
    const newId = `CONF-${String(conferences.length + 1).padStart(3, '0')}`;
    console.log('Creating conference:', { ...newConference, id: newId });
    setIsNewConferenceOpen(false);
    setNewConference({ name: '', startDate: '', endDate: '', location: '', status: 'Planning' });
    // Navigate to manage page for the new conference
    handleManageConference(newId);
  };

  const handleAddView = (viewName: string) => {
    const newView: View = {
      id: `custom-${Date.now()}`,
      label: viewName,
      type: 'custom'
    };
    setViews([...views, newView]);
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev => 
      prev.length === filteredConferences.length ? [] : filteredConferences.map(c => c.id)
    );
  };

  const isAllSelected = selectedRows.length === filteredConferences.length && filteredConferences.length > 0;

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Conference Name' },
    { id: 'dates', label: 'Dates' },
    { id: 'location', label: 'Location' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'status', label: 'Status' }
  ];

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting conferences", options);
  };

  const mobileConfig: MobileCardConfig<Conference> = {
    idField: (conf) => conf.id,
    valueField: (conf) => (
      <span className="text-slate-900 font-medium text-xs">{conf.dates}</span>
    ),
    titleField: (conf) => conf.name,
    statusField: (conf) => (
      <Badge 
        variant="secondary" 
        className={`px-2 py-0 h-5 text-[10px] border-none ${
          conf.status === 'Active' ? 'bg-green-50 text-green-600' :
          conf.status === 'Planning' ? 'bg-blue-50 text-blue-600' :
          'bg-slate-100 text-slate-600'
        }`}
      >
        {conf.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Location", value: (c) => c.location },
      { label: "Speakers", value: (c) => String(c.speakers) },
      { label: "Sessions", value: (c) => String(c.sessions) },
    ],
    actions: (conf) => (
      <Button 
        size="sm" 
        className="w-full bg-[#0f172b] text-white"
        onClick={() => handleManageConference(conf.id)}
      >
        Manage Conference
      </Button>
    )
  };

  const stats = [
    { label: "Total Conferences", value: "12" },
    { label: "Active", value: "3", color: "text-emerald-600" },
    { label: "Upcoming", value: "5", color: "text-blue-600" },
    { label: "Completed", value: "4", color: "text-slate-400" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        dateRangePicker={<DatePickerWithRange />}
        primaryAction={{
          label: "New Conference",
          onClick: () => setIsNewConferenceOpen(true),
          icon: <Plus size={16} className="mr-2" />
        }}
        secondaryActions={
          <>
            <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" disabled>
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" onClick={() => setIsExportDialogOpen(true)}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </>
        }
      />

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* List Controls */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search conferences..."
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
            <ResponsiveMenuItem>Location</ResponsiveMenuItem>
            <ResponsiveMenuItem>Date Range</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Speaker Count</ResponsiveMenuItem>
            <ResponsiveMenuItem>Session Count</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Start Date</ResponsiveMenuItem>
            <ResponsiveMenuItem>Number of Sessions</ResponsiveMenuItem>
            <ResponsiveMenuItem>Number of Speakers</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Conference</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Dates</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Location</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Stats</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
          </ResponsiveControl>
        }
        moreControl={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
              <DropdownMenuItem>Bulk Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Bulk Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {selectedRows.length} Selected
            </span>
            <span className="text-sm text-blue-800">conferences selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 bg-white">
              <Archive size={14} className="mr-2" /> Archive
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 bg-white">
              <Download size={14} className="mr-2" /> Export
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Table */}
      <ResponsiveTable
        data={filteredConferences}
        mobileConfig={mobileConfig}
        renderDesktop={() => (
          <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-1">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100">
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Conference</TableHead>
                    <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                    <TableHead className="font-semibold text-slate-700">Location</TableHead>
                    <TableHead className="font-semibold text-slate-700">Sessions / Speakers</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConferences.map((conf) => (
                    <TableRow 
                      key={conf.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedRows.includes(conf.id)}
                          onCheckedChange={() => toggleRow(conf.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900">{conf.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{conf.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm">{conf.dates}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-sm">{conf.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Mic size={14} className="text-slate-400" />
                            <span>{conf.sessions}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Users size={14} className="text-slate-400" />
                            <span>{conf.speakers}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`border-none ${
                            conf.status === 'Active' ? 'bg-green-50 text-green-600' :
                            conf.status === 'Planning' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {conf.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleManageConference(conf.id)}
                          >
                            Manage
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Archive</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      />

      {/* New Conference Sheet */}
      <Sheet open={isNewConferenceOpen} onOpenChange={setIsNewConferenceOpen}>
        <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Conference</SheetTitle>
            <SheetDescription>
              Add conference details to get started with session planning
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-4">
            {/* Conference Name */}
            <div className="space-y-2">
              <Label htmlFor="conf-name">Conference Name *</Label>
              <Input 
                id="conf-name"
                placeholder="e.g., Global Education Summit 2024"
                value={newConference.name}
                onChange={(e) => setNewConference({...newConference, name: e.target.value})}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date *</Label>
                <Input 
                  id="start-date"
                  type="date"
                  value={newConference.startDate}
                  onChange={(e) => setNewConference({...newConference, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date *</Label>
                <Input 
                  id="end-date"
                  type="date"
                  value={newConference.endDate}
                  onChange={(e) => setNewConference({...newConference, endDate: e.target.value})}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location"
                placeholder="e.g., London, UK"
                value={newConference.location}
                onChange={(e) => setNewConference({...newConference, location: e.target.value})}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newConference.status}
                onValueChange={(val: 'Planning' | 'Active' | 'Completed') => setNewConference({...newConference, status: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="gap-2">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button 
              onClick={handleCreateConference}
              disabled={!newConference.name || !newConference.startDate || !newConference.location}
            >
              Create Conference
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Export Dialog */}
      <ExportDialog 
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        columns={exportColumns}
        onExport={handleExportData}
        entityName="conferences"
      />
    </div>
  );
};