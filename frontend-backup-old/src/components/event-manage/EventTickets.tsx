import React, { useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  CreditCard,
  Tag,
  ShoppingBag,
  Percent,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ResponsiveTable, MobileCardConfig } from '../ui/responsive-table';
import { DateTimePicker } from '../ui/datetime-picker';
import { ExportDialog, ExportColumn, ExportOptions } from '../common/ExportDialog';
import { ImportDialog, ImportField } from '../common/ImportDialog';
import { cn } from '../ui/utils';

interface Ticket {
  id: string;
  name: string;
  type: string;
  price: string;
  quantity: number;
  sold: number;
  status: 'On Sale' | 'Sold Out' | 'Ended' | 'Paused';
  category: string;
  description?: string;
  internalNotes?: string;
}

const initialTickets: Ticket[] = [
  { id: "TKT-001", name: "Early Bird", type: "Paid", price: "50.00", quantity: 500, sold: 500, status: "Ended", category: "General", internalNotes: "" },
  { id: "TKT-002", name: "General Admission", type: "Paid", price: "100.00", quantity: 1000, sold: 250, status: "On Sale", category: "General", internalNotes: "" },
  { id: "TKT-003", name: "VIP Access", type: "Paid", price: "250.00", quantity: 100, sold: 100, status: "Sold Out", category: "VIP", internalNotes: "" },
  { id: "TKT-004", name: "Student Pass", type: "Free", price: "0.00", quantity: 200, sold: 45, status: "On Sale", category: "Students", internalNotes: "" }
];

export const EventTickets = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [addons, setAddons] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);

  // Dialog States
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [endSalesConfirmationOpen, setEndSalesConfirmationOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [ticketToEndSales, setTicketToEndSales] = useState<string | null>(null);

  // Form State
  const [newTicket, setNewTicket] = useState({
    name: '',
    description: '',
    price: '0.00',
    quantity: '100',
    minOrder: '1',
    maxOrder: '4',
    saleStart: undefined as Date | undefined,
    saleEnd: undefined as Date | undefined,
    category: 'General',
    isVisible: true,
    isOnSale: true,
    internalNotes: ''
  });

  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const isTicketFormValid = newTicket.name && newTicket.quantity;

  // Handlers
  const handleCreateTicket = () => {
    const ticket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      name: newTicket.name,
      type: parseFloat(newTicket.price) === 0 ? 'Free' : 'Paid',
      price: newTicket.price,
      quantity: parseInt(newTicket.quantity),
      sold: 0,
      status: newTicket.isOnSale ? 'On Sale' : 'Paused',
      category: newTicket.category,
      description: newTicket.description,
      internalNotes: newTicket.internalNotes
    };
    setTickets([...tickets, ticket]);
    setIsTicketDialogOpen(false);
    setNewTicket({
      name: '', description: '', price: '0.00', quantity: '100', minOrder: '1', maxOrder: '4',
      saleStart: undefined, saleEnd: undefined, category: 'General', isVisible: true, isOnSale: true, internalNotes: ''
    });
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTicket) {
      setTickets(tickets.map(t => t.id === editingTicket.id ? editingTicket : t));
      setIsEditDialogOpen(false);
      setEditingTicket(null);
    }
  };

  const handleDuplicateTicket = (ticket: Ticket) => {
    const duplicate: Ticket = {
      ...ticket,
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      name: `${ticket.name} (Copy)`,
      sold: 0,
      status: 'Paused'
    };
    setTickets([...tickets, duplicate]);
  };

  const handlePauseResume = (ticket: Ticket) => {
    setTickets(tickets.map(t =>
      t.id === ticket.id ? { ...t, status: t.status === 'On Sale' ? 'Paused' : 'On Sale' } : t
    ));
  };

  const handleEndSales = (id: string) => {
    setTicketToEndSales(id);
    setEndSalesConfirmationOpen(true);
  };

  const confirmEndSales = () => {
    if (ticketToEndSales) {
      setTickets(tickets.map(t => t.id === ticketToEndSales ? { ...t, status: 'Ended' } : t));
      setEndSalesConfirmationOpen(false);
      setTicketToEndSales(null);
    }
  };

  const handleDeleteTicket = (id: string) => {
    setTicketToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteTicket = () => {
    if (ticketToDelete) {
      setTickets(tickets.filter(t => t.id !== ticketToDelete));
      setDeleteConfirmationOpen(false);
      setTicketToDelete(null);
    }
  };

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting tickets", options);
  };

  const handleImportData = async (file: File, mode: string) => {
    console.log("Importing", file, mode);
  };

  const ticketsConfig: MobileCardConfig<Ticket> = {
    idField: (item) => item.id,
    titleField: (item) => item.name,
    valueField: (item) => (
      <span className="text-slate-900 font-bold text-sm">
        {item.price === "0.00" ? "Free" : `$${item.price}`}
      </span>
    ),
    statusField: (item) => (
      <Badge variant="outline" className={cn(
        "text-[10px] px-2 py-0 h-5 border-0",
        item.status === 'On Sale' ? 'bg-emerald-50 text-emerald-600' :
        item.status === 'Sold Out' ? 'bg-rose-50 text-rose-600' :
        'bg-slate-100 text-slate-500'
      )}>
        {item.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Type", value: (i) => i.type },
      { label: "Category", value: (i) => i.category },
      { label: "Sold", value: (i) => `${i.sold} / ${i.quantity}` },
    ],
    actions: (item) => (
      <Button size="sm" variant="outline" className="w-full" onClick={() => handleEditTicket(item)}>
        Manage Ticket
      </Button>
    )
  };

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'Ticket ID' },
    { id: 'name', label: 'Ticket Name' },
    { id: 'type', label: 'Type' },
    { id: 'price', label: 'Price' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'sold', label: 'Sold Count' },
    { id: 'status', label: 'Status' },
    { id: 'category', label: 'Category' },
    { id: 'internalNotes', label: 'Internal Notes', defaultSelected: false }
  ];

  const importFields: ImportField[] = [
    { id: 'name', label: 'Ticket Name', required: true, type: 'text' },
    { id: 'price', label: 'Price', required: true, type: 'number' },
    { id: 'quantity', label: 'Quantity', required: true, type: 'number' },
    { id: 'category', label: 'Category', required: false, type: 'select', options: ['General', 'VIP', 'Students'] }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Mini-Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Total Sales</p>
            <h3 className="text-xl font-bold text-slate-900">$125,000</h3>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Tickets Sold</p>
            <h3 className="text-xl font-bold text-slate-900">
              895 <span className="text-sm font-normal text-slate-400">/ 1800</span>
            </h3>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Tag size={18} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Add-on Revenue</p>
            <h3 className="text-xl font-bold text-slate-900">$4,500</h3>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
            <ShoppingBag size={18} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase">Avg. Order Value</p>
            <h3 className="text-xl font-bold text-slate-900">$140</h3>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
            <Percent size={18} />
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation + Actions */}
      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="bg-slate-100/80 p-1.5 rounded-[14px] flex w-full overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent h-auto w-full justify-start gap-1 p-0">
              <TabsTrigger
                value="inventory"
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value="addons"
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Add-ons
              </TabsTrigger>
              <TabsTrigger
                value="discounts"
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Discounts & Promo
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:bg-slate-200/50 hover:text-slate-700 transition-all border-none"
              >
                Settings & Rules
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" size="sm" onClick={() => setIsImportDialogOpen(true)}>
              <Upload size={16} className="mr-2" /> Import
            </Button>
            <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" size="sm" onClick={() => setIsExportDialogOpen(true)}>
              <Download size={16} className="mr-2" /> Export
            </Button>
            <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" size="sm" onClick={() => setIsTicketDialogOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Ticket
            </Button>
          </div>
        </div>

        {/* TAB 1: INVENTORY */}
        <TabsContent value="inventory" className="mt-0 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search tickets..."
                className="pl-9 border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <Button variant="ghost" size="sm" className="text-slate-500">
              <Filter size={16} className="mr-2" /> Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500">
              <Settings size={16} className="mr-2" /> Columns
            </Button>
          </div>

          {/* Table */}
          <ResponsiveTable
            data={tickets}
            mobileConfig={ticketsConfig}
            renderDesktop={() => (
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="w-[300px]">Ticket Details</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sold / Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="hover:bg-slate-50/60 cursor-pointer"
                        onClick={() => handleEditTicket(ticket)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-[#1d293d]">
                              {ticket.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {ticket.type} • ID: {ticket.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {ticket.price === "0.00" ? "Free" : `$${ticket.price}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {ticket.sold} / {ticket.quantity}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-800 rounded-full"
                                style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            ticket.status === 'On Sale' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            ticket.status === 'Sold Out' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
                                Edit Ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateTicket(ticket)}>
                                Duplicate Ticket
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePauseResume(ticket)}>
                                {ticket.status === 'On Sale' ? 'Pause Sales' : 'Resume Sales'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEndSales(ticket.id)} className="text-red-600">
                                End Sales
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteTicket(ticket.id)} className="text-red-600">
                                Delete Ticket
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          />
        </TabsContent>

        {/* TAB 2: ADD-ONS */}
        <TabsContent value="addons" className="mt-0">
          {addons.length === 0 ? (
            <div className="min-h-[300px] flex items-center justify-center bg-white border border-slate-100 rounded-xl">
              <div className="text-center text-slate-400">
                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="font-medium text-slate-900 mb-1">No Add-ons Configured</h3>
                <p className="text-sm max-w-xs mx-auto mb-4">
                  Upsell merchandise, meals, or workshop access during registration.
                </p>
                <Button variant="outline" onClick={() => setIsAddonDialogOpen(true)}>
                  Create Add-on
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* TAB 3: DISCOUNTS & PROMO */}
        <TabsContent value="discounts" className="mt-0">
          {promos.length === 0 ? (
            <div className="min-h-[300px] flex items-center justify-center bg-white border border-slate-100 rounded-xl">
              <div className="text-center text-slate-400">
                <Percent size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="font-medium text-slate-900 mb-1">Active Promotions</h3>
                <p className="text-sm max-w-xs mx-auto mb-4">
                  Create discount codes and automatic group pricing rules.
                </p>
                <Button variant="outline" onClick={() => setIsPromoDialogOpen(true)}>
                  Create Promo Code
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* TAB 4: SETTINGS & RULES */}
        <TabsContent value="settings" className="mt-0 space-y-6">
          {/* Tax & Fees + Refund Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Tax & Fees</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pass Fees to Attendees</Label>
                  <p className="text-xs text-slate-500">Attendees pay the service fee</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Charge Tax (VAT/GST)</Label>
                  <p className="text-xs text-slate-500">Apply tax rate to ticket prices</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Refund Policy</h3>
              <div className="space-y-2">
                <Label>Policy Type</Label>
                <Select defaultValue="no-refunds">
                  <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-refunds">No Refunds</SelectItem>
                    <SelectItem value="7-days">Up to 7 days before event</SelectItem>
                    <SelectItem value="30-days">Up to 30 days before event</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>This policy will be displayed on the event page and ticket confirmation emails.</p>
              </div>
            </div>
          </div>

          {/* Ticket Sales Rules */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Ticket Sales Rules</h3>
              <p className="text-sm text-slate-500">
                Control what attendees can do after purchasing tickets.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Ticket Transfers</Label>
                  <p className="text-xs text-slate-500">
                    Attendees can transfer tickets to another person
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Ticket Cancellations by Attendee</Label>
                  <p className="text-xs text-slate-500">Only before refund deadline</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lock Ticket Changes After Event Start</Label>
                  <p className="text-xs text-slate-500">
                    Prevent any ticket modifications once the event begins
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Ticket Visibility Rules */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Ticket Visibility Rules</h3>
              <p className="text-sm text-slate-500">
                Control how tickets appear on the registration page.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Hide Sold-Out Tickets</Label>
                <RadioGroup defaultValue="show-label" className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show-label" id="r1" />
                    <Label htmlFor="r1" className="font-normal text-slate-600">
                      Show "Sold Out" label
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide-completely" id="r2" />
                    <Label htmlFor="r2" className="font-normal text-slate-600">
                      Hide ticket completely
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatically Hide Past Tickets</Label>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Registration Approval */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Registration Approval</h3>
              <p className="text-sm text-slate-500">Manage how registrations are approved.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-approve Registrations</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Require Manual Approval</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-expire Pending Approvals</Label>
                  <p className="text-xs text-slate-500">
                    Pending registrations expire automatically
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" className="w-20" placeholder="0" />
                  <span className="text-sm text-slate-500">hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation & Invoices */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Confirmation & Invoices</h3>
              <p className="text-sm text-slate-500">Control post-registration confirmations.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Send Confirmation Email Automatically</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Attach Invoice / Receipt</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Tax & Fee Breakdown on Invoice</Label>
                <Switch />
              </div>
            </div>
          </div>

          {/* Capacity Rules */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-lg text-[#1d293d]">Capacity Rules</h3>
              <p className="text-sm text-slate-500">Define how ticket capacity is enforced.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Stop Ticket Sales When Event Is Full</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Admin Overselling</Label>
                  <p className="text-xs text-slate-500">Admin-only override</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Waitlist Automatically When Full</Label>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* CREATE TICKET DIALOG */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100 flex-shrink-0">
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Configure ticket details, pricing, and availability.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar-light">
            <div className="p-6 space-y-6">
              {/* 1. Ticket Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Ticket Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g. Early Bird, VIP"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({...newTicket, name: e.target.value})}
                    className={!newTicket.name ? "border-red-200 focus-visible:ring-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticket Description</Label>
                  <Textarea
                    placeholder="Describe what's included in this ticket..."
                    className="resize-none h-20"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  />
                  <p className="text-xs text-slate-500">
                    Shown to attendees on the registration page
                  </p>
                </div>
              </div>

              {/* 2. Pricing & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={newTicket.price}
                      onChange={(e) => setNewTicket({...newTicket, price: e.target.value})}
                    />
                    {parseFloat(newTicket.price || '0') === 0 && (
                      <Badge variant="secondary" className="absolute right-2 top-2 bg-slate-100 text-slate-500 pointer-events-none">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="100"
                    min="1"
                    value={newTicket.quantity}
                    onChange={(e) => setNewTicket({...newTicket, quantity: e.target.value})}
                  />
                </div>
              </div>

              {/* 3. Purchase Limits */}
              <div className="space-y-2">
                <Label>Purchase Limits</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 uppercase font-medium">
                      Min per Order
                    </span>
                    <Input
                      type="number"
                      min="1"
                      value={newTicket.minOrder}
                      onChange={(e) => setNewTicket({...newTicket, minOrder: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 uppercase font-medium">
                      Max per Order
                    </span>
                    <Input
                      type="number"
                      min="1"
                      value={newTicket.maxOrder}
                      onChange={(e) => setNewTicket({...newTicket, maxOrder: e.target.value})}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Controls how many tickets one attendee can purchase
                </p>
              </div>

              {/* 4. Sales Availability */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sales Start Date & Time</Label>
                  <DateTimePicker
                    value={newTicket.saleStart}
                    onChange={(date) => setNewTicket({...newTicket, saleStart: date})}
                    placeholder="Start selling immediately..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sales End Date & Time</Label>
                  <DateTimePicker
                    value={newTicket.saleEnd}
                    onChange={(date) => setNewTicket({...newTicket, saleEnd: date})}
                    placeholder="Stop selling on..."
                  />
                  <p className="text-xs text-slate-500">
                    Ticket automatically stops selling after this time
                  </p>
                </div>
              </div>

              {/* 5. Category */}
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(val) => setNewTicket({...newTicket, category: val})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Visibility & Status */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Visible to attendees</Label>
                    <p className="text-xs text-slate-500">
                      Hidden tickets are not shown on the registration page
                    </p>
                  </div>
                  <Switch
                    checked={newTicket.isVisible}
                    onCheckedChange={(c) => setNewTicket({...newTicket, isVisible: c})}
                  />
                </div>
                <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ticket is On Sale</Label>
                    <p className="text-xs text-slate-500">
                      Pause or resume ticket sales without deleting the ticket
                    </p>
                  </div>
                  <Switch
                    checked={newTicket.isOnSale}
                    onCheckedChange={(c) => setNewTicket({...newTicket, isOnSale: c})}
                  />
                </div>
              </div>

              {/* 7. Internal Notes */}
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea
                  placeholder="Add notes for your team..."
                  className="resize-none h-20"
                  value={newTicket.internalNotes}
                  onChange={(e) => setNewTicket({...newTicket, internalNotes: e.target.value})}
                />
                <p className="text-xs text-slate-500">
                  Internal only. Not visible to attendees
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button
              className="bg-[#0f172b]"
              onClick={handleCreateTicket}
              disabled={!isTicketFormValid}
            >
              Save & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT TICKET DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {editingTicket && (
            <>
              <DialogHeader className="p-6 border-b border-slate-100 flex-shrink-0 space-y-2">
                <DialogTitle className="sr-only">Edit Ticket: {editingTicket.name}</DialogTitle>
                <div className="flex items-center justify-between">
                  <Input
                    value={editingTicket.name}
                    onChange={(e) => setEditingTicket({...editingTicket, name: e.target.value})}
                    className="text-xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                  />
                  <Badge variant={
                    editingTicket.status === 'On Sale' ? 'default' :
                    editingTicket.status === 'Ended' ? 'secondary' : 'destructive'
                  } className={
                    editingTicket.status === 'On Sale' ? 'bg-emerald-600' : ''
                  }>
                    {editingTicket.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Ticket ID: <span className="font-mono text-slate-600">{editingTicket.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto custom-scrollbar-light p-6">
                <Tabs defaultValue="details" className="flex-1">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-100/80">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="availability">Rules</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <div className="mt-6 space-y-6">
                    <TabsContent value="details" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Ticket Name</Label>
                        <Input
                          value={editingTicket.name}
                          onChange={(e) => setEditingTicket({...editingTicket, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          className="h-32"
                          value={editingTicket.description || ''}
                          onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={editingTicket.category}
                          onValueChange={(val) => setEditingTicket({...editingTicket, category: val})}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Sponsor">Sponsor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <Input
                          type="number"
                          value={editingTicket.price}
                          onChange={(e) => setEditingTicket({...editingTicket, price: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Quantity</Label>
                        <Input
                          type="number"
                          value={editingTicket.quantity}
                          onChange={(e) => setEditingTicket({...editingTicket, quantity: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min per Order</Label>
                          <Input type="number" defaultValue="1" />
                        </div>
                        <div className="space-y-2">
                          <Label>Max per Order</Label>
                          <Input type="number" defaultValue="4" />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="availability" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Sales Start</Label>
                        <DateTimePicker placeholder="Select date & time..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Sales End</Label>
                        <DateTimePicker placeholder="Select date & time..." />
                      </div>
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Visible to attendees</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Ticket is On Sale</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0">
                      <div className="space-y-2">
                        <Label>Internal Notes</Label>
                        <Textarea
                          className="h-60"
                          placeholder="Add notes for your team..."
                          value={editingTicket.internalNotes || ''}
                          onChange={(e) => setEditingTicket({...editingTicket, internalNotes: e.target.value})}
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button className="bg-[#0f172b]" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ticket type and remove it from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTicket}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* END SALES CONFIRMATION */}
      <AlertDialog open={endSalesConfirmationOpen} onOpenChange={setEndSalesConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Ticket Sales?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately stop sales for this ticket type. Existing orders will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEndSales}
              className="bg-[#0f172b]"
            >
              End Sales
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* EXPORT DIALOG */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        columns={exportColumns}
        onExport={handleExportData}
        entityName="tickets"
      />

      {/* IMPORT DIALOG */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        fields={importFields}
        onImport={handleImportData}
        moduleName="tickets"
      />
    </div>
  );
};