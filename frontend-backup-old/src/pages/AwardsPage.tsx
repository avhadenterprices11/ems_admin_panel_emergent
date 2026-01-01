import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Upload, 
  Download, 
  Trophy,
  Calendar,
  Award,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  LayoutTemplate,
  Archive,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { PageHeader } from '../components/ui/PageHeader';
import { StatsGrid } from '../components/common/StatsGrid';
import { ListControls } from '../components/common/ListControls';
import { SavedViews, View } from '../components/common/SavedViews';
import { ResponsiveControl, ResponsiveMenuItem, ResponsiveMenuCheckboxItem, ResponsiveMenuLabel, ResponsiveMenuSeparator } from '../components/common/ResponsiveControl';
import { ExportDialog, ExportColumn, ExportOptions } from '../components/common/ExportDialog';
import { ResponsiveTable, MobileCardConfig } from '../components/ui/responsive-table';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { CreateViewDialog } from '../components/common/CreateViewDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

interface AwardProgram {
  id: string;
  name: string;
  deadline: string;
  entries: number;
  categories: number;
  status: string;
}

const mockAwards: AwardProgram[] = [
  { id: "AWD-2024-01", name: "India UK Achievers Honours 2024", deadline: "Jan 30, 2024", entries: 450, categories: 12, status: "Judging In Progress" },
  { id: "AWD-2024-02", name: "Student Excellence Awards", deadline: "Mar 15, 2024", entries: 120, categories: 8, status: "Open for Entries" },
  { id: "AWD-2024-03", name: "Research Innovation Awards", deadline: "Feb 28, 2024", entries: 85, categories: 6, status: "Open for Entries" },
  { id: "AWD-2024-04", name: "Faculty Achievement Awards", deadline: "Apr 10, 2024", entries: 200, categories: 15, status: "Judging In Progress" },
  { id: "AWD-2024-05", name: "Community Impact Awards", deadline: "May 20, 2024", entries: 175, categories: 10, status: "Judging In Progress" },
  { id: "AWD-2023-01", name: "Alumni Awards 2023", deadline: "Dec 10, 2023", entries: 340, categories: 10, status: "Completed" },
  { id: "AWD-2023-02", name: "Teaching Excellence Awards 2023", deadline: "Nov 15, 2023", entries: 280, categories: 9, status: "Completed" },
  { id: "AWD-2023-03", name: "Leadership Awards 2023", deadline: "Oct 30, 2023", entries: 150, categories: 7, status: "Completed" },
];

export const AwardsPage = () => {
  const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [awards] = useState<AwardProgram[]>(mockAwards);
  
  const [views, setViews] = useState<View[]>([
    { id: 'all', label: 'All Programs', type: 'system' },
    { id: 'open', label: 'Open for Entries', type: 'system' },
    { id: 'judging', label: 'Judging in Progress', type: 'system' },
    { id: 'completed', label: 'Completed', type: 'system' },
  ]);

  // Filter awards by active view and search
  const filteredAwards = awards.filter(award => {
    const matchesView = 
      activeViewId === 'all' ? true :
      activeViewId === 'open' ? award.status === 'Open for Entries' :
      activeViewId === 'judging' ? award.status === 'Judging In Progress' :
      activeViewId === 'completed' ? award.status === 'Completed' :
      true;

    const matchesSearch = searchQuery === '' || 
      award.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesView && matchesSearch;
  });

  const handleManageAward = (id: string) => {
    navigate(`/awards/${id}`);
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
      prev.length === filteredAwards.length ? [] : filteredAwards.map(a => a.id)
    );
  };

  const isAllSelected = selectedRows.length === filteredAwards.length && filteredAwards.length > 0;

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'ID' },
    { id: 'name', label: 'Program Name' },
    { id: 'deadline', label: 'Deadline' },
    { id: 'entries', label: 'Entries Count' },
    { id: 'categories', label: 'Categories Count' },
    { id: 'status', label: 'Status' }
  ];

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting awards", options);
  };

  const mobileConfig: MobileCardConfig<AwardProgram> = {
    idField: (award) => award.id,
    titleField: (award) => award.name,
    valueField: (award) => (
      <span>
        {award.entries} 
        <span className="text-slate-400 font-normal text-xs"> Entries</span>
      </span>
    ),
    statusField: (award) => (
      <Badge variant="secondary" className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-0 h-5 text-[10px]">
        {award.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Deadline", value: (a) => a.deadline },
      { label: "Categories", value: (a) => String(a.categories) },
    ],
    actions: (award) => (
      <Button 
        size="sm" 
        className="w-full bg-[#0f172b] text-white"
        onClick={() => handleManageAward(award.id)}
      >
        Manage Program
      </Button>
    )
  };

  const stats = [
    { label: "Total Programs", value: "8" },
    { label: "Open for Entries", value: "2", color: "text-emerald-600" },
    { label: "Judging", value: "3", color: "text-purple-600" },
    { label: "Completed", value: "3", color: "text-slate-400" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        dateRangePicker={<DatePickerWithRange />}
        primaryAction={{
          label: "New Program",
          onClick: () => {},
          icon: <Plus size={16} className="mr-2" />
        }}
        secondaryActions={
          <>
            <Button 
              variant="outline" 
              className="h-[38px] border-slate-200 text-slate-600 hover:bg-slate-50 w-full md:w-auto"
              disabled
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

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* List Controls */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search programs..."
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
            <ResponsiveMenuItem>Program Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Deadline Range</ResponsiveMenuItem>
            <ResponsiveMenuItem>Category Count</ResponsiveMenuItem>
            <ResponsiveMenuItem>Entry Count</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Deadline (Nearest First)</ResponsiveMenuItem>
            <ResponsiveMenuItem>Number of Entries</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Program Name (A-Z)</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Program Name</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Deadline</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Categories Count</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Entries Count</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
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
            <span className="text-sm text-blue-800">programs selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Archive size={14} className="mr-2" /> Archive
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Download size={14} className="mr-2" /> Export
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Table */}
      <ResponsiveTable
        data={filteredAwards}
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
                    <TableHead className="w-[400px] text-[#253154] font-bold text-[11px] uppercase tracking-wider h-[50px]">
                      Program Name
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Deadline
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Stats
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAwards.map((award) => (
                    <TableRow 
                      key={award.id} 
                      className={`cursor-pointer hover:bg-slate-50 h-[72px] ${selectedRows.includes(award.id) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => handleManageAward(award.id)}
                    >
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(award.id)}
                          onCheckedChange={() => toggleRow(award.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                            <Trophy size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1d293d]">{award.name}</span>
                            <span className="text-xs text-slate-400">{award.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600 text-[13px]">
                          <Calendar size={14} /> {award.deadline}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-4 text-[13px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Award size={14} /> {award.categories} Categories
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy size={14} /> {award.entries} Entries
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100">
                          {award.status}
                        </Badge>
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
            <div className="border-t border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-400">
                  Showing <span className="font-bold text-slate-700">1-{filteredAwards.length}</span> of <span className="font-bold text-slate-700">8</span> results
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
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" 
                  disabled
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 w-8 text-xs bg-blue-50 text-blue-600 font-bold rounded-lg"
                  >
                    1
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" 
                  disabled
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Export Dialog */}
      <ExportDialog 
        open={isExportDialogOpen} 
        onOpenChange={setIsExportDialogOpen}
        columns={exportColumns}
        onExport={handleExportData}
        entityName="programs"
      />
    </div>
  );
};