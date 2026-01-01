import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, UserPlus, MoreHorizontal, Filter, ChevronDown,
  ArrowUpDown, LayoutTemplate, Download, Upload,
  CheckCircle, Mail, UserCheck, UserX
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../components/ui/dropdown-menu";
import { ResponsiveTable, MobileCardConfig } from "../components/ui/responsive-table";
import { DatePickerWithRange } from "../components/ui/date-range-picker";
import { PageHeader } from "../components/ui/PageHeader";
import { StatsGrid } from "../components/common/StatsGrid";
import { ListControls } from "../components/common/ListControls";
import { ResponsiveControl, ResponsiveMenuItem, ResponsiveMenuCheckboxItem, ResponsiveMenuLabel, ResponsiveMenuSeparator } from "../components/common/ResponsiveControl";
import { ExportDialog, ExportColumn, ExportOptions } from "../components/common/ExportDialog";
import { ImportDialog, ImportField, ImportMode } from "../components/common/ImportDialog";
import { SavedViews, View } from "../components/common/SavedViews";
import { CreateViewDialog } from "../components/common/CreateViewDialog";

interface PeoplePageProps {
  onManagePerson?: (id: string) => void;
  onAddPerson?: () => void;
}

export function PeoplePage({ onManagePerson, onAddPerson }: PeoplePageProps) {
  const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState('all');
  const [views, setViews] = useState<View[]>([
    { id: 'all', label: 'All People', type: 'system' },
    { id: 'attendees', label: 'Attendees', type: 'system' },
    { id: 'volunteers', label: 'Volunteers', type: 'system' },
    { id: 'judges', label: 'Judges', type: 'system' },
    { id: 'staff', label: 'Staff', type: 'system' },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isCreateViewDialogOpen, setIsCreateViewDialogOpen] = useState(false);

  // Mock Data (4 People)
  const people = [
    {
      id: "PPL-001",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      role: "Attendee",
      event: "Global Tech Summit 2024",
      status: "Active",
      lastActive: "2 mins ago"
    },
    {
      id: "PPL-002",
      name: "Michael Chen",
      email: "m.chen@nisau.org",
      role: "Staff",
      event: "All Events",
      status: "Active",
      lastActive: "1 hour ago"
    },
    {
      id: "PPL-003",
      name: "Dr. Emily Davis",
      email: "e.davis@university.ac.uk",
      role: "Judge",
      event: "Education Awards Night",
      status: "Active",
      lastActive: "1 day ago"
    },
    {
      id: "PPL-004",
      name: "John Smith",
      email: "john.s@test.com",
      role: "Attendee",
      event: "NISAU Annual Meetup",
      status: "Inactive",
      lastActive: "2 months ago"
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return "text-purple-600 bg-purple-50";
      case 'Staff':
        return "text-blue-600 bg-blue-50";
      case 'Judge':
        return "text-orange-600 bg-orange-50";
      case 'Attendee':
        return "text-slate-600 bg-slate-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
      : "bg-slate-100 text-slate-500 border-slate-200";
  };

  // Filter
  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection
  const isAllSelected = filteredPeople.length > 0 && filteredPeople.every(e => selectedRows.includes(e.id));

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      const visibleIds = filteredPeople.map(e => e.id);
      setSelectedRows(selectedRows.filter(id => !visibleIds.includes(id)));
    } else {
      const visibleIds = filteredPeople.map(e => e.id);
      setSelectedRows(Array.from(new Set([...selectedRows, ...visibleIds])));
    }
  };

  const handleAddView = (viewName: string) => {
    const id = viewName.toLowerCase().replace(/\s+/g, '-');
    setViews([...views, { id, label: viewName, type: 'user' }]);
    setActiveViewId(id);
  };

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
    { id: 'event', label: 'Event' },
    { id: 'status', label: 'Status' },
    { id: 'lastActive', label: 'Last Active' }
  ];

  const importFields: ImportField[] = [
    { id: 'name', label: 'Full Name', required: true, type: 'text' },
    { id: 'email', label: 'Email Address', required: true, type: 'email' },
    { id: 'role', label: 'Role', required: true, type: 'select', options: ['Attendee', 'Staff', 'Judge', 'Admin'] }
  ];

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting people", options);
  };

  const handleImportData = async (data: any[], mode: ImportMode) => {
    console.log(`Importing people (Mode: ${mode})`, data);
  };

  // Mobile Card Config
  const mobileConfig: MobileCardConfig<typeof people[0]> = {
    idField: (p) => p.id,
    valueField: (p) => <span>{p.role}</span>,
    titleField: (p) => p.name,
    statusField: (p) => (
      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold ${getStatusColor(p.status)}`}>
        {p.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Email", value: (p) => p.email },
      { label: "Event", value: (p) => p.event },
      { label: "Last Active", value: (p) => p.lastActive },
    ],
    actions: (p) => (
      <div className="flex gap-2 w-full">
        <Button 
          size="sm" 
          className="flex-1 bg-[#0f172b] text-white"
          onClick={() => navigate(`/people/${p.id}/edit`)}
        >
          View Profile
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          Message
        </Button>
      </div>
    )
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: PAGE HEADER */}
      <PageHeader 
        dateRangePicker={<DatePickerWithRange />}
        primaryAction={{
          label: "Add Person",
          onClick: () => navigate('/people/new'), 
          icon: <UserPlus size={16} className="mr-2" />
        }}
        secondaryActions={
          <>
            <Button 
              variant="outline" 
              className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50 w-full md:w-auto"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button 
              variant="outline" 
              className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50 w-full md:w-auto"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </>
        }
      />

      {/* SECTION 2: STATS GRID */}
      <StatsGrid stats={[
        { label: "Total People", value: "2,450" },
        { label: "Attendees", value: "2,300", color: "text-blue-600" },
        { label: "Staff Members", value: "120", color: "text-purple-600" },
        { label: "Judges", value: "30", color: "text-orange-600" }
      ]} />

      {/* SECTION 3: LIST CONTROLS */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search people..."
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
            <ResponsiveMenuItem>Role</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Event Association</ResponsiveMenuItem>
            <ResponsiveMenuItem>Registration Status</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Name (A-Z)</ResponsiveMenuItem>
            <ResponsiveMenuItem>Recently Added</ResponsiveMenuItem>
            <ResponsiveMenuItem>Last Activity</ResponsiveMenuItem>
            <ResponsiveMenuItem>Role</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Name</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Role</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Email</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Associated Event</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Last Active</ResponsiveMenuCheckboxItem>
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
              <DropdownMenuItem onClick={() => setIsCreateViewDialogOpen(true)}>
                <Plus size={14} className="mr-2" /> Save Current View
              </DropdownMenuItem>
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

      {/* SECTION 4: BULK ACTIONS BAR */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {selectedRows.length} Selected
            </span>
            <span className="text-sm text-blue-800">people selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Mail size={14} className="mr-2" /> Email
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <UserCheck size={14} className="mr-2" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <UserX size={14} className="mr-2" /> Deactivate
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 5: DATA TABLE */}
      <ResponsiveTable
        data={filteredPeople}
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
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider h-[50px]">
                      Name
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Role
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Email
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Associated Event
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Last Active
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeople.map((person) => (
                    <TableRow 
                      key={person.id} 
                      className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(person.id) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => navigate(`/people/${person.id}/edit`)}
                    >
                      {/* Checkbox */}
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(person.id)}
                          onCheckedChange={() => toggleRow(person.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>

                      {/* Name (with ID) */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#1d293d] text-[13px]">{person.name}</span>
                          <span className="text-[11px] text-[#62748e]">{person.id}</span>
                        </div>
                      </TableCell>

                      {/* Role (Badge) */}
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getRoleColor(person.role)}`}>
                          {person.role}
                        </Badge>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <span className="text-[#1d293d] text-[13px]">{person.email}</span>
                      </TableCell>

                      {/* Associated Event */}
                      <TableCell>
                        <span className="text-[#62748e] text-[13px]">{person.event}</span>
                      </TableCell>

                      {/* Status (Badge) */}
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusColor(person.status)}`}>
                          {person.status}
                        </Badge>
                      </TableCell>

                      {/* Last Active */}
                      <TableCell className="text-[#62748e] text-[13px]">
                        {person.lastActive}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={16} className="text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* SECTION 6: PAGINATION */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                {/* Left Side: Results Info & Rows Per Page */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Showing <span className="font-bold text-slate-700">1-{filteredPeople.length}</span> of <span className="font-bold text-slate-700">2,450</span> results
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
                
                {/* Right Side: Page Navigation */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" disabled>
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" className="h-8 w-8 text-xs bg-blue-50 text-blue-600 font-bold rounded-lg">
                      1
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )} 
      />

      {/* DIALOGS */}
      <ExportDialog 
        open={isExportDialogOpen} 
        onOpenChange={setIsExportDialogOpen}
        moduleName="People"
        totalCount={people.length}
        selectedCount={selectedRows.length}
        columns={exportColumns}
        supportsDateRange={true}
        onExport={handleExportData}
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        moduleName="People"
        fields={importFields}
        onImport={handleImportData}
      />

      <CreateViewDialog open={isCreateViewDialogOpen} onOpenChange={setIsCreateViewDialogOpen} onAddView={handleAddView} />
    </div>
  );
}