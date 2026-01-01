import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, DollarSign, MoreHorizontal, CreditCard, FileText, RefreshCw,
  Filter, ChevronDown, ArrowUpDown, LayoutTemplate, Download,
  Upload, Archive, CheckCircle, AlertCircle
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

interface FinancePageProps {
  onManageTransaction?: (id: string) => void;
  onCreateTransaction?: () => void;
}

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

export function FinancePage({ onManageTransaction, onCreateTransaction }: FinancePageProps) {
  const navigate = useNavigate();
  const [activeViewId, setActiveViewId] = useState('all');
  const [views, setViews] = useState<View[]>([
    { id: 'all', label: 'All Transactions', type: 'system' },
    { id: 'paid', label: 'Paid', type: 'system' },
    { id: 'pending', label: 'Pending', type: 'system' },
    { id: 'failed', label: 'Failed', type: 'system' },
    { id: 'refunded', label: 'Refunded', type: 'system' },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const transactions = [
    {
      id: "TXN-001",
      type: "Payment",
      event: "Global Tech Summit 2024",
      amount: "£450.00",
      status: "Completed",
      method: "Credit Card (Visa)",
      date: "Jan 12, 2024"
    },
    {
      id: "TXN-002",
      type: "Payment",
      event: "NISAU Annual Meetup",
      amount: "£25.00",
      status: "Pending",
      method: "Bank Transfer",
      date: "Jan 11, 2024"
    },
    {
      id: "TXN-003",
      type: "Refund",
      event: "Global Tech Summit 2024",
      amount: "-£450.00",
      status: "Completed",
      method: "Credit Card (Visa)",
      date: "Jan 10, 2024"
    },
    {
      id: "TXN-004",
      type: "Payment",
      event: "Awards Night Sponsorship",
      amount: "£5,000.00",
      status: "Completed",
      method: "Invoice",
      date: "Jan 09, 2024"
    }
  ];

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'Transaction ID' },
    { id: 'type', label: 'Type' },
    { id: 'event', label: 'Event / Program' },
    { id: 'amount', label: 'Amount' },
    { id: 'status', label: 'Status' },
    { id: 'method', label: 'Payment Method' },
    { id: 'date', label: 'Date' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'Pending':
        return "bg-amber-50 text-amber-600 border-amber-100";
      case 'Failed':
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Refund' ? "text-rose-600 bg-rose-50" : "text-blue-600 bg-blue-50";
  };

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = filteredTransactions.length > 0 && filteredTransactions.every(e => selectedRows.includes(e.id));

  const toggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleAll = () => {
    if (isAllSelected) {
      const visibleIds = filteredTransactions.map(e => e.id);
      setSelectedRows(selectedRows.filter(id => !visibleIds.includes(id)));
    } else {
      const visibleIds = filteredTransactions.map(e => e.id);
      setSelectedRows(Array.from(new Set([...selectedRows, ...visibleIds])));
    }
  };

  const handleAddView = (newView: { label: string }) => {
    const id = newView.label.toLowerCase().replace(/\s+/g, '-');
    setViews([...views, { id, label: newView.label, type: 'user' }]);
    setActiveViewId(id);
  };

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting transactions", options);
  };

  const mobileConfig: MobileCardConfig<typeof transactions[0]> = {
    idField: (t) => t.id,
    valueField: (t) => (
      <span className={`font-mono font-medium ${t.type === 'Refund' ? 'text-rose-600' : 'text-emerald-600'}`}>
        {t.amount}
      </span>
    ),
    titleField: (t) => t.event,
    statusField: (t) => (
      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] font-bold ${getStatusColor(t.status)}`}>
        {t.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Type", value: (t) => t.type },
      { label: "Method", value: (t) => t.method },
      { label: "Date", value: (t) => t.date },
    ],
    actions: (t) => (
      <div className="flex gap-2 w-full">
        <Button 
          size="sm" 
          className="flex-1 bg-[#0f172b] text-white"
          onClick={() => onManageTransaction && onManageTransaction(t.id)}
        >
          View Details
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          Download Invoice
        </Button>
      </div>
    )
  };

  return (
    <div className="space-y-6 p-8">
      {/* SECTION 1: PAGE HEADER */}
      <PageHeader 
        dateRangePicker={<DatePickerWithRange />}
        primaryAction={{
          label: "View Transactions",
          onClick: () => navigate('/finance/transactions'), 
          icon: <FileText size={16} className="mr-2" />,
          dropdownItems: (
            <DropdownMenuItem onClick={onCreateTransaction}>
              <PlusIcon className="mr-2 h-4 w-4" /> Generate Invoice
            </DropdownMenuItem>
          )
        }}
        secondaryActions={
          <>
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
        { label: "Total Revenue", value: "£124,500" },
        { label: "Refunds", value: "£1,200", color: "text-rose-600" },
        { label: "Pending Payments", value: "£4,500", color: "text-amber-600" },
        { label: "Net Earnings", value: "£123,300", color: "text-emerald-600" }
      ]} />

      {/* SECTION 3: LIST CONTROLS */}
      <ListControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search transactions..."
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
            <ResponsiveMenuItem>Transaction Type</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Event / Conference</ResponsiveMenuItem>
            <ResponsiveMenuItem>Date Range</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        sortControl={
          <ResponsiveControl label="Sort" icon={<ArrowUpDown size={16} />}>
            <ResponsiveMenuLabel>Sort Order</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuItem>Amount (High → Low)</ResponsiveMenuItem>
            <ResponsiveMenuItem>Transaction Date</ResponsiveMenuItem>
            <ResponsiveMenuItem>Status</ResponsiveMenuItem>
            <ResponsiveMenuItem>Event Name</ResponsiveMenuItem>
          </ResponsiveControl>
        }
        columnsControl={
          <ResponsiveControl label="Columns" icon={<LayoutTemplate size={16} />}>
            <ResponsiveMenuLabel>Toggle Columns</ResponsiveMenuLabel>
            <ResponsiveMenuSeparator />
            <ResponsiveMenuCheckboxItem checked disabled>Transaction ID</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Type</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Event / Program</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Amount</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Status</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Payment Method</ResponsiveMenuCheckboxItem>
            <ResponsiveMenuCheckboxItem checked>Date</ResponsiveMenuCheckboxItem>
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
              <DropdownMenuItem>Bulk Receipt Download</DropdownMenuItem>
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
            <span className="text-sm text-blue-800">transactions selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <Download size={14} className="mr-2" /> Download Receipts
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 bg-white">
              <FileText size={14} className="mr-2" /> Re-send Invoice
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 5: DATA TABLE */}
      <ResponsiveTable
        data={filteredTransactions}
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
                      Transaction ID
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Type
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Event / Program
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Amount
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Payment Method
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="text-[#253154] font-bold text-[11px] uppercase tracking-wider text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow 
                      key={t.id}
                      className={`group border-slate-50 hover:bg-slate-50/60 transition-colors h-[72px] cursor-pointer ${selectedRows.includes(t.id) ? 'bg-slate-50/80' : ''}`}
                      onClick={() => navigate(`/finance/transactions?id=${t.id}`)}
                    >
                      <TableCell className="pl-4">
                        <Checkbox 
                          checked={selectedRows.includes(t.id)}
                          onCheckedChange={() => toggleRow(t.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-slate-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-[#1d293d] text-[13px]">{t.id}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 font-normal text-[11px] border-none ${getTypeColor(t.type)}`}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#1d293d] text-[13px]">{t.event}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-medium text-[13px] ${t.type === 'Refund' ? 'text-rose-600' : 'text-[#1d293d]'}`}>
                          {t.amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${getStatusColor(t.status)}`}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#62748e] text-[13px]">{t.method}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#62748e] text-[13px]">{t.date}</span>
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
              
              {/* SECTION 6: PAGINATION */}
              <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                {/* Left Side: Results Info & Rows Per Page */}
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Showing <span className="font-bold text-slate-700">1-{filteredTransactions.length}</span> of <span className="font-bold text-slate-700">1,240</span> results
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
        moduleName="Finance"
        totalCount={transactions.length}
        selectedCount={selectedRows.length}
        columns={exportColumns}
        supportsDateRange={true}
        onExport={handleExportData}
      />
    </div>
  );
}