import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Megaphone, MoreHorizontal, Mail, MessageSquare, Smartphone,
  Send, Filter, ChevronDown, ArrowUpDown, LayoutTemplate, Download,
  Upload, PlayCircle, PauseCircle, Copy
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
import { SavedViews, View } from "../components/common/SavedViews";
import { CreateViewDialog } from "../components/common/CreateViewDialog";

interface CommunicationsPageProps {
  onManageCampaign?: (id: string) => void;
  onCreateCampaign?: () => void;
  onNavigate?: (view: string) => void;
}

export function CommunicationsPage({ onManageCampaign, onCreateCampaign, onNavigate }: CommunicationsPageProps) {
  const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState('all');
  const [views, setViews] = useState<View[]>([
    { id: 'all', label: 'All Campaigns', type: 'system' },
    { id: 'scheduled', label: 'Scheduled', type: 'system' },
    { id: 'sent', label: 'Sent', type: 'system' },
    { id: 'draft', label: 'Draft', type: 'system' },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isCreateViewDialogOpen, setIsCreateViewDialogOpen] = useState(false);

  // Mock Data (4 Campaigns)
  const campaigns = [
    {
      id: "CMP-001",
      name: "Summit 2024 - Early Bird Reminder",
      channel: "Email",
      status: "Sent",
      audience: 2500,
      openRate: "45.2%",
      scheduledDate: "Jan 10, 2024"
    },
    {
      id: "CMP-002",
      name: "Welcome to NISAU",
      channel: "WhatsApp",
      status: "Scheduled",
      audience: 120,
      openRate: "-",
      scheduledDate: "Feb 05, 2024"
    },
    {
      id: "CMP-003",
      name: "Feedback Survey Link",
      channel: "SMS",
      status: "Draft",
      audience: 0,
      openRate: "-",
      scheduledDate: "-"
    },
    {
      id: "CMP-004",
      name: "Awards Night Announcement",
      channel: "Push",
      status: "Sent",
      audience: 5000,
      openRate: "62.1%",
      scheduledDate: "Dec 15, 2023"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'Scheduled':
        return "bg-blue-50 text-blue-600 border-blue-100";
      case 'Draft':
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Email':
        return <Mail size={14} className="mr-1 text-slate-500" />;
      case 'WhatsApp':
        return <MessageSquare size={14} className="mr-1 text-green-500" />;
      case 'SMS':
        return <Smartphone size={14} className="mr-1 text-blue-500" />;
      case 'Push':
        return <Send size={14} className="mr-1 text-purple-500" />;
      default:
        return <Megaphone size={14} className="mr-1 text-slate-500" />;
    }
  };

  // Filter
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection
  const isAllSelected = filteredCampaigns.length > 0 && filteredCampaigns.every(e => selectedRows.includes(e.id));

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      const visibleIds = filteredCampaigns.map(e => e.id);
      setSelectedRows(selectedRows.filter(id => !visibleIds.includes(id)));
    } else {
      const visibleIds = filteredCampaigns.map(e => e.id);
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
    { id: 'name', label: 'Campaign Name' },
    { id: 'channel', label: 'Channel' },
    { id: 'status', label: 'Status' },
    { id: 'audience', label: 'Audience Size' },
    { id: 'openRate', label: 'Open Rate' },
    { id: 'scheduledDate', label: 'Scheduled Date' }
  ];

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting campaigns", options);
  };

  // Mobile Card Config
  const mobileConfig: MobileCardConfig<typeof campaigns[0]> = {
    idField: (c) => c.id,
    valueField: (c) => (
      <span className="flex items-center text-xs font-medium">
        {getChannelIcon(c.channel)} {c.channel}
      </span>
    ),
    titleField: (c) => c.name,
    statusField: (c) => (
      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold border-0 ${getStatusColor(c.status)}`}>
        {c.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Audience", value: (c) => c.audience.toLocaleString() },
      { label: "Open Rate", value: (c) => c.openRate },
      { label: "Date", value: (c) => c.scheduledDate },
    ],
    actions: (c) => (
      <div className="flex gap-2 w-full">
        <Button 
          size="sm" 
          className="flex-1 bg-[#0f172b] text-white"
          onClick={() => onManageCampaign && onManageCampaign(c.id)}
        >
          Edit
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          Analytics
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
          label: "Create Campaign",
          onClick: () => navigate('/communications/new'), 
          icon: <Megaphone size={16} className="mr-2" />
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

      {/* SECTION 2: STATS GRID */}
      <StatsGrid stats={[
        { label: "Total Campaigns", value: "32" },
        { label: "Sent", value: "24", color: "text-emerald-600" },
        { label: "Scheduled", value: "5", color: "text-blue-600" },
        { label: "Drafts", value: "3", color: "text-slate-600" }
      ]} />

      {/* SECTION 3: EMAIL TEMPLATES QUICK ACCESS */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-[20px] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-lg">
              <Mail className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#1d293d] text-sm">Email Templates</h3>
              <p className="text-xs text-slate-600">Manage attendee lifecycle emails</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/communications/email')}
            className="border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            Email Templates
          </Button>
        </div>
      </div>

      {/* SECTION 4: LIST CONTROLS */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search campaigns..."
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
            <ResponsiveMenuItem>Channel</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Event Linked</ResponsiveMenuItem>
            <ResponsiveMenuItem>Delivery Performance</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Scheduled Date</ResponsiveMenuItem>
            <ResponsiveMenuItem>Open Rate</ResponsiveMenuItem>
            <ResponsiveMenuItem>Campaign Name</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Campaign Name</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Channel</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Audience Size</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Open Rate</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Scheduled Date</ResponsiveMenuCheckboxItem>
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

      {/* SECTION 5: BULK ACTIONS BAR */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {selectedRows.length} Selected
            </span>
            <span className="text-sm text-blue-800">campaigns selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <PlayCircle size={14} className="mr-2" /> Resume
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <PauseCircle size={14} className="mr-2" /> Pause
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Copy size={14} className="mr-2" /> Duplicate
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 6: DATA TABLE */}
      <ResponsiveTable
        data={filteredCampaigns}
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
                      Campaign Name
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Channel
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Audience Size
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Open Rate
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Scheduled Date
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow 
                      key={campaign.id} 
                      className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(campaign.id) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => onManageCampaign && onManageCampaign(campaign.id)}
                    >
                      {/* Checkbox */}
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(campaign.id)}
                          onCheckedChange={() => toggleRow(campaign.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>

                      {/* Campaign Name (with ID) */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#1d293d] text-[13px]">{campaign.name}</span>
                          <span className="text-[11px] text-[#62748e]">{campaign.id}</span>
                        </div>
                      </TableCell>

                      {/* Channel (with Icon) */}
                      <TableCell>
                        <div className="flex items-center text-[#1d293d] text-[13px]">
                          {getChannelIcon(campaign.channel)}
                          {campaign.channel}
                        </div>
                      </TableCell>

                      {/* Status (Badge) */}
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </TableCell>

                      {/* Audience Size */}
                      <TableCell>
                        <span className="text-[#1d293d] text-[13px] font-medium">{campaign.audience.toLocaleString()}</span>
                      </TableCell>

                      {/* Open Rate */}
                      <TableCell>
                        <span className="text-[#1d293d] text-[13px]">{campaign.openRate}</span>
                      </TableCell>

                      {/* Scheduled Date */}
                      <TableCell>
                        <span className="text-[#62748e] text-[13px]">{campaign.scheduledDate}</span>
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

              {/* SECTION 7: PAGINATION */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                {/* Left Side: Results Info & Rows Per Page */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Showing <span className="font-bold text-slate-700">1-{filteredCampaigns.length}</span> of <span className="font-bold text-slate-700">32</span> results
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
        moduleName="Communications"
        totalCount={campaigns.length}
        selectedCount={selectedRows.length}
        columns={exportColumns}
        supportsDateRange={true}
        onExport={handleExportData}
      />

      <CreateViewDialog open={isCreateViewDialogOpen} onOpenChange={setIsCreateViewDialogOpen} onAddView={handleAddView} />
    </div>
  );
}