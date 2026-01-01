import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MoreHorizontal, 
  Filter, 
  ChevronDown,
  ArrowUpDown, 
  LayoutTemplate, 
  Download, 
  Upload, 
  Archive,
  CheckCircle, 
  GitBranch
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "../components/ui/dropdown-menu";
import { ResponsiveTable, MobileCardConfig } from "../components/ui/responsive-table";
import { DatePickerWithRange } from "../components/ui/date-range-picker";
import { PageHeader } from "../components/ui/PageHeader";
import { StatsGrid } from "../components/common/StatsGrid";
import { ListControls } from "../components/common/ListControls";
import { 
  ResponsiveControl, 
  ResponsiveMenuItem, 
  ResponsiveMenuCheckboxItem, 
  ResponsiveMenuLabel, 
  ResponsiveMenuSeparator 
} from "../components/common/ResponsiveControl";
import { ExportDialog, ExportColumn } from "../components/common/ExportDialog";
import { ImportDialog, ImportField } from "../components/common/ImportDialog";
import { SavedViews, View } from "../components/common/SavedViews";
import { CreateViewDialog } from "../components/common/CreateViewDialog";

interface Form {
  id: string;
  name: string;
  type: string;
  status: string;
  submissions: number;
  lastUpdated: string;
  owner: string;
}

const initialForms: Form[] = [
  {
    id: "FRM-001",
    name: "Global Tech Summit Registration",
    type: "Registration",
    status: "Active",
    submissions: 1250,
    lastUpdated: "2 hours ago",
    owner: "Sarah Jenkins"
  },
  {
    id: "FRM-002",
    name: "Post-Event Feedback Survey",
    type: "Feedback",
    status: "Draft",
    submissions: 0,
    lastUpdated: "1 day ago",
    owner: "Mike Ross"
  },
  {
    id: "FRM-003",
    name: "Speaker Application Workflow",
    type: "Custom",
    status: "Active",
    submissions: 45,
    lastUpdated: "3 days ago",
    owner: "Jessica Pearson"
  },
  {
    id: "FRM-004",
    name: "Volunteer Interest Form",
    type: "Survey",
    status: "Archived",
    submissions: 89,
    lastUpdated: "1 month ago",
    owner: "Louis Litt"
  }
];

const initialViews: View[] = [
  { id: 'all', label: 'All Forms', type: 'system' },
  { id: 'active', label: 'Active', type: 'system' },
  { id: 'draft', label: 'Draft', type: 'system' },
  { id: 'archived', label: 'Archived', type: 'system' },
];

const exportColumns: ExportColumn[] = [
  { id: 'id', label: 'Form ID' },
  { id: 'name', label: 'Form Name' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'owner', label: 'Owner' }
];

const importFields: ImportField[] = [
  { id: 'name', label: 'Form Name', required: true, type: 'text' },
  { id: 'type', label: 'Type', required: true, type: 'select', options: ['Registration', 'Feedback', 'Survey', 'Custom'] },
  { id: 'status', label: 'Status', required: false, type: 'select', options: ['Active', 'Draft'] }
];

export function FormsPage() {
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeViewId, setActiveViewId] = useState('all');
  const [views, setViews] = useState<View[]>(initialViews);
  const [pageSize, setPageSize] = useState(10);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Filter forms based on search and active view
  const filteredForms = forms.filter(form => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.owner.toLowerCase().includes(searchQuery.toLowerCase());

    // View filter
    let matchesView = true;
    if (activeViewId === 'active') matchesView = form.status === 'Active';
    else if (activeViewId === 'draft') matchesView = form.status === 'Draft';
    else if (activeViewId === 'archived') matchesView = form.status === 'Archived';

    return matchesSearch && matchesView;
  });

  // Selection handlers
  const toggleRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === filteredForms.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredForms.map(f => f.id));
    }
  };

  const isAllSelected = filteredForms.length > 0 && selectedRows.length === filteredForms.length;

  // Handlers
  const handleAddView = (view: View) => {
    setViews([...views, view]);
  };

  const handleExportData = (options: any) => {
    console.log('Exporting with options:', options);
  };

  const handleImportData = (data: any) => {
    console.log('Importing data:', data);
  };

  const handleManageForm = (formId: string) => {
    navigate(`/forms/${formId}`);
  };

  // Color helpers
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Registration':
        return "text-blue-600 bg-blue-50";
      case 'Feedback':
        return "text-purple-600 bg-purple-50";
      case 'Survey':
        return "text-pink-600 bg-pink-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return "bg-emerald-50 text-[#00bc7d] hover:bg-emerald-100 border-none";
      case 'Draft':
        return "bg-slate-100 text-slate-500 hover:bg-slate-200 border-none";
      case 'Archived':
        return "bg-orange-50 text-orange-600 hover:bg-orange-100 border-none";
      default:
        return "bg-slate-100 text-slate-500 border-none";
    }
  };

  // Mobile config
  const mobileConfig: MobileCardConfig<typeof forms[0]> = {
    idField: (form) => form.id,
    valueField: (form) => (
      <span>{form.submissions} <span className="text-slate-400 font-normal text-xs">Subs.</span></span>
    ),
    titleField: (form) => form.name,
    statusField: (form) => (
      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold border-0 ${getStatusColor(form.status)}`}>
        {form.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Type", value: (f) => f.type },
      { label: "Last Updated", value: (f) => f.lastUpdated },
      { label: "Owner", value: (f) => f.owner },
    ],
    actions: (form) => (
      <div className="flex gap-2 w-full">
        <Button 
          size="sm" 
          className="flex-1 bg-[#0f172b] text-white"
          onClick={() => handleManageForm(form.id)}
        >
          Edit Form
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          Results
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
          label: "Create New Form",
          onClick: () => navigate('/forms/new'), 
          icon: <Plus size={16} className="mr-2" />,
          dropdownItems: (
            <>
              <DropdownMenuItem>
                <GitBranch className="mr-2 h-4 w-4" /> Create Workflow
              </DropdownMenuItem>
            </>
          )
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

      {/* 2. METRICS SUMMARY ROW */}
      <StatsGrid stats={[
        { label: "Total Forms", value: "24" },
        { label: "Active Forms", value: "8", color: "text-emerald-600" },
        { label: "Draft Forms", value: "4", color: "text-slate-600" },
        { label: "Submissions", value: "1,450", color: "text-blue-600" }
      ]} />

      {/* 3. TABLE CONTROL BAR */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search forms..."
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
            <ResponsiveMenuItem>Form Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Form Type</ResponsiveMenuItem>
            <ResponsiveMenuItem>Submission Volume</ResponsiveMenuItem>
            <ResponsiveMenuItem>Created By</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Created Date</ResponsiveMenuItem>
            <ResponsiveMenuItem>Submission Count</ResponsiveMenuItem>
            <ResponsiveMenuItem>Form Name</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Form Name</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Type</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Submissions</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Last Updated</ResponsiveMenuCheckboxItem>
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
              <DropdownMenuItem>Bulk Archive</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Bulk Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* 4. BULK ACTIONS BAR (Conditional) */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {selectedRows.length} Selected
            </span>
            <span className="text-sm text-blue-800">forms selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <CheckCircle size={14} className="mr-2" /> Activate
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Archive size={14} className="mr-2" /> Archive
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Download size={14} className="mr-2" /> Export Data
            </Button>
          </div>
        </div>
      )}

      {/* 5. DATA TABLE + PAGINATION */}
      <ResponsiveTable
        data={filteredForms}
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
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider h-[50px]">Form Name</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Submissions</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Last Updated</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">Owner</TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow 
                      key={form.id} 
                      className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(form.id) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => handleManageForm(form.id)}
                    >
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(form.id)}
                          onCheckedChange={() => toggleRow(form.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#1d293d] text-[13px]">{form.name}</span>
                          <span className="text-[11px] text-[#62748e]">{form.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getTypeColor(form.type)}`}>
                          {form.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${getStatusColor(form.status)}`}>
                          {form.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#1d293d] text-[13px] font-medium">
                          {form.submissions.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#62748e] text-[13px]">
                        {form.lastUpdated}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">
                            {form.owner.charAt(0)}
                          </div>
                          <span className="text-[#1d293d] text-[13px]">{form.owner}</span>
                        </div>
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

              {/* Pagination Footer */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                {/* Left side: Results info + Rows per page */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Showing <span className="font-bold text-slate-700">1-{filteredForms.length}</span> of <span className="font-bold text-slate-700">24</span> results
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
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50" disabled>Next</Button>
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
        moduleName="Forms"
        totalCount={forms.length}
        selectedCount={selectedRows.length}
        columns={exportColumns}
        supportsDateRange={true}
        onExport={handleExportData}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        moduleName="Forms"
        fields={importFields}
        onImport={handleImportData}
      />
    </div>
  );
}