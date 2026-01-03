import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Download,
  Search,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CreditCard,
  Tag,
  ShoppingBag,
  Percent,
  Settings,
  Copy,
  Calendar,
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { 
  eventsAPI, 
  Ticket, 
  TicketStats, 
  CreateTicketInput, 
  UpdateTicketInput,
  Addon,
  CreateAddonInput,
  UpdateAddonInput,
  PromoCode,
  CreatePromoCodeInput,
  UpdatePromoCodeInput,
  EventSettings,
  UpdateEventSettingsInput,
} from '../../api/events.api';
import { toast } from 'sonner';
import { cn } from '../ui/utils';

interface EventTicketsProps {
  eventId: number;
}

export const EventTickets = ({ eventId }: EventTicketsProps) => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [endSalesConfirmationOpen, setEndSalesConfirmationOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);
  const [ticketToEndSales, setTicketToEndSales] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [ticketForm, setTicketForm] = useState<CreateTicketInput>({
    name: '',
    description: '',
    price: 0,
    capacity: 100,
    category: 'General',
    min_per_order: 1,
    max_per_order: 10,
    is_visible: true,
    is_on_sale: true,
    sales_start_at: '',
    sales_end_at: '',
  });

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const [ticketsData, statsData] = await Promise.all([
        eventsAPI.getTickets(eventId),
        eventsAPI.getTicketStats(eventId),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  // Filter tickets by search
  const filteredTickets = tickets.filter(ticket =>
    ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setTicketForm({
      name: '',
      description: '',
      price: 0,
      capacity: 100,
      category: 'General',
      min_per_order: 1,
      max_per_order: 10,
      is_visible: true,
      is_on_sale: true,
      sales_start_at: '',
      sales_end_at: '',
    });
    setSelectedTicket(null);
  };

  // Handle create ticket
  const handleCreateTicket = async () => {
    if (!ticketForm.name) {
      toast.error('Ticket name is required');
      return;
    }
    if (ticketForm.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    try {
      setIsSubmitting(true);
      await eventsAPI.createTicket(eventId, ticketForm);
      toast.success('Ticket created successfully');
      setIsTicketDialogOpen(false);
      resetForm();
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update ticket
  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    const updateData: UpdateTicketInput = {
      name: ticketForm.name,
      description: ticketForm.description,
      price: ticketForm.price,
      capacity: ticketForm.capacity,
      category: ticketForm.category,
      min_per_order: ticketForm.min_per_order,
      max_per_order: ticketForm.max_per_order,
      is_visible: ticketForm.is_visible,
      is_on_sale: ticketForm.is_on_sale,
      sales_start_at: ticketForm.sales_start_at || undefined,
      sales_end_at: ticketForm.sales_end_at || undefined,
    };

    try {
      setIsSubmitting(true);
      await eventsAPI.updateTicket(eventId, selectedTicket.id, updateData);
      toast.success('Ticket updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete ticket
  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      setIsSubmitting(true);
      await eventsAPI.deleteTicket(eventId, ticketToDelete);
      toast.success('Ticket deleted successfully');
      setDeleteConfirmationOpen(false);
      setTicketToDelete(null);
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle sales
  const handleToggleSales = async (ticketId: number) => {
    try {
      await eventsAPI.toggleTicketSales(eventId, ticketId);
      toast.success('Ticket sales updated');
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle sales');
    }
  };

  // Handle end sales
  const handleEndSales = async () => {
    if (!ticketToEndSales) return;

    try {
      setIsSubmitting(true);
      await eventsAPI.endTicketSales(eventId, ticketToEndSales);
      toast.success('Ticket sales ended');
      setEndSalesConfirmationOpen(false);
      setTicketToEndSales(null);
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to end sales');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle duplicate ticket
  const handleDuplicateTicket = async (ticketId: number) => {
    try {
      await eventsAPI.duplicateTicket(eventId, ticketId);
      toast.success('Ticket duplicated successfully');
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to duplicate ticket');
    }
  };

  // Open edit dialog
  const openEditDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketForm({
      name: ticket.name,
      description: ticket.description || '',
      price: parseFloat(ticket.price.toString()),
      capacity: ticket.capacity || 0,
      category: ticket.category,
      min_per_order: ticket.min_per_order,
      max_per_order: ticket.max_per_order,
      is_visible: ticket.is_visible,
      is_on_sale: ticket.is_on_sale,
      sales_start_at: ticket.sales_start_at ? new Date(ticket.sales_start_at).toISOString().slice(0, 16) : '',
      sales_end_at: ticket.sales_end_at ? new Date(ticket.sales_end_at).toISOString().slice(0, 16) : '',
    });
    setIsEditDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string, isOnSale: boolean) => {
    const statusColors: Record<string, string> = {
      on_sale: 'bg-emerald-100 text-emerald-700',
      sold_out: 'bg-rose-100 text-rose-700',
      ended: 'bg-slate-100 text-slate-700',
      draft: 'bg-amber-100 text-amber-700',
    };
    const statusLabels: Record<string, string> = {
      on_sale: 'On Sale',
      sold_out: 'Sold Out',
      ended: 'Ended',
      draft: 'Draft',
    };
    return (
      <Badge className={cn('font-medium', statusColors[status] || 'bg-slate-100 text-slate-700')}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Stats cards data
  const statsCards = [
    { label: 'Total Sales', value: formatCurrency(stats?.totalSales || 0), icon: <CreditCard size={20} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Tickets Sold', value: `${stats?.ticketsSold || 0} / ${stats?.totalCapacity || 0}`, icon: <Tag size={20} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Add-on Revenue', value: formatCurrency(stats?.addonRevenue || 0), icon: <ShoppingBag size={20} />, color: 'text-purple-600 bg-purple-50' },
    { label: 'Avg Order Value', value: formatCurrency(stats?.avgOrderValue || 0), icon: <Percent size={20} />, color: 'text-amber-600 bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-[#1d293d]">{card.value}</p>
              </div>
              <div className={cn('p-3 rounded-lg', card.color)}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-slate-100/80 p-1 rounded-lg">
            <TabsTrigger value="inventory" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Ticket Inventory
            </TabsTrigger>
            <TabsTrigger value="addons" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Add-ons
            </TabsTrigger>
            <TabsTrigger value="promos" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Promo Codes
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              onClick={() => { resetForm(); setIsTicketDialogOpen(true); }}
              className="bg-[#0f172b] hover:bg-[#1d293d]"
              data-testid="add-ticket-btn"
            >
              <Plus size={16} className="mr-2" /> Add Ticket
            </Button>
          </div>
        </div>

        {/* Ticket Inventory Tab */}
        <TabsContent value="inventory" className="mt-0">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-lg font-medium">No tickets found</p>
                <p className="text-sm">Create your first ticket to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Ticket Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Sold / Capacity</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Sales Period</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-slate-50/50" data-testid={`ticket-row-${ticket.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-[#1d293d]">{ticket.name}</div>
                          <div className="text-xs text-slate-500">{ticket.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {ticket.ticket_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {ticket.ticket_type === 'free' ? 'Free' : formatCurrency(parseFloat(ticket.price.toString()))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                ticket.capacity && ticket.sold_count >= ticket.capacity ? 'bg-rose-500' :
                                ticket.capacity && ticket.sold_count / ticket.capacity > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${ticket.capacity ? Math.min((ticket.sold_count / ticket.capacity) * 100, 100) : 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {ticket.sold_count} / {ticket.capacity || '∞'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status, ticket.is_on_sale)}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(ticket.sales_start_at)} - {formatDate(ticket.sales_end_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`ticket-actions-${ticket.id}`}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEditDialog(ticket)}>
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTicket(ticket.id)}>
                              Duplicate
                            </DropdownMenuItem>
                            {ticket.status !== 'ended' && ticket.status !== 'sold_out' && (
                              <DropdownMenuItem onClick={() => handleToggleSales(ticket.id)}>
                                {ticket.is_on_sale ? 'Pause Sales' : 'Resume Sales'}
                              </DropdownMenuItem>
                            )}
                            {ticket.status !== 'ended' && (
                              <DropdownMenuItem 
                                onClick={() => { setTicketToEndSales(ticket.id); setEndSalesConfirmationOpen(true); }}
                                className="text-amber-600"
                              >
                                End Sales
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => { setTicketToDelete(ticket.id); setDeleteConfirmationOpen(true); }}
                              className="text-rose-600"
                              disabled={ticket.sold_count > 0}
                            >
                              Delete Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Add-ons Tab (Placeholder) */}
        <TabsContent value="addons" className="mt-0">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">Add-ons coming soon</p>
            <p className="text-sm text-slate-400">Offer merchandise, parking, or extras with ticket purchases</p>
          </div>
        </TabsContent>

        {/* Promo Codes Tab (Placeholder) */}
        <TabsContent value="promos" className="mt-0">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <Percent size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">Promo Codes coming soon</p>
            <p className="text-sm text-slate-400">Create discount codes for your tickets</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>Add a new ticket type for this event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-name">Ticket Name *</Label>
              <Input
                id="ticket-name"
                placeholder="e.g., General Admission"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                data-testid="ticket-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                placeholder="Brief description of what's included"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-price">Price ($)</Label>
                <Input
                  id="ticket-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({ ...ticketForm, price: parseFloat(e.target.value) || 0 })}
                  data-testid="ticket-price-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-capacity">Capacity</Label>
                <Input
                  id="ticket-capacity"
                  type="number"
                  min="1"
                  value={ticketForm.capacity}
                  onChange={(e) => setTicketForm({ ...ticketForm, capacity: parseInt(e.target.value) || undefined })}
                  data-testid="ticket-capacity-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-category">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min/Max per Order</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="w-20"
                    value={ticketForm.min_per_order}
                    onChange={(e) => setTicketForm({ ...ticketForm, min_per_order: parseInt(e.target.value) || 1 })}
                  />
                  <span className="text-slate-400">-</span>
                  <Input
                    type="number"
                    min="1"
                    className="w-20"
                    value={ticketForm.max_per_order}
                    onChange={(e) => setTicketForm({ ...ticketForm, max_per_order: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sales-start">Sales Start</Label>
                <Input
                  id="sales-start"
                  type="datetime-local"
                  value={ticketForm.sales_start_at}
                  onChange={(e) => setTicketForm({ ...ticketForm, sales_start_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-end">Sales End</Label>
                <Input
                  id="sales-end"
                  type="datetime-local"
                  value={ticketForm.sales_end_at}
                  onChange={(e) => setTicketForm({ ...ticketForm, sales_end_at: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Visible to Attendees</Label>
                <p className="text-xs text-slate-500">Show this ticket on the event page</p>
              </div>
              <Switch
                checked={ticketForm.is_visible}
                onCheckedChange={(checked) => setTicketForm({ ...ticketForm, is_visible: checked })}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Start Sales Immediately</Label>
                <p className="text-xs text-slate-500">Ticket will be available for purchase right away</p>
              </div>
              <Switch
                checked={ticketForm.is_on_sale}
                onCheckedChange={(checked) => setTicketForm({ ...ticketForm, is_on_sale: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateTicket} disabled={isSubmitting} data-testid="create-ticket-submit">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>Update ticket details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ticket-name">Ticket Name *</Label>
              <Input
                id="edit-ticket-name"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ticket-description">Description</Label>
              <Textarea
                id="edit-ticket-description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ticket-price">Price ($)</Label>
                <Input
                  id="edit-ticket-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({ ...ticketForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ticket-capacity">Capacity</Label>
                <Input
                  id="edit-ticket-capacity"
                  type="number"
                  min="1"
                  value={ticketForm.capacity}
                  onChange={(e) => setTicketForm({ ...ticketForm, capacity: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min/Max per Order</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="w-20"
                    value={ticketForm.min_per_order}
                    onChange={(e) => setTicketForm({ ...ticketForm, min_per_order: parseInt(e.target.value) || 1 })}
                  />
                  <span className="text-slate-400">-</span>
                  <Input
                    type="number"
                    min="1"
                    className="w-20"
                    value={ticketForm.max_per_order}
                    onChange={(e) => setTicketForm({ ...ticketForm, max_per_order: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sales-start">Sales Start</Label>
                <Input
                  id="edit-sales-start"
                  type="datetime-local"
                  value={ticketForm.sales_start_at}
                  onChange={(e) => setTicketForm({ ...ticketForm, sales_start_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sales-end">Sales End</Label>
                <Input
                  id="edit-sales-end"
                  type="datetime-local"
                  value={ticketForm.sales_end_at}
                  onChange={(e) => setTicketForm({ ...ticketForm, sales_end_at: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Visible to Attendees</Label>
                <p className="text-xs text-slate-500">Show this ticket on the event page</p>
              </div>
              <Switch
                checked={ticketForm.is_visible}
                onCheckedChange={(checked) => setTicketForm({ ...ticketForm, is_visible: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateTicket} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket} className="bg-rose-600 hover:bg-rose-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Sales Confirmation Dialog */}
      <AlertDialog open={endSalesConfirmationOpen} onOpenChange={setEndSalesConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Ticket Sales</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end sales for this ticket? This will permanently stop all future purchases. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndSales} className="bg-amber-600 hover:bg-amber-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              End Sales
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
