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

  // Add-ons State
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [isEditAddonDialogOpen, setIsEditAddonDialogOpen] = useState(false);
  const [deleteAddonConfirmationOpen, setDeleteAddonConfirmationOpen] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState<number | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [addonForm, setAddonForm] = useState<CreateAddonInput>({
    name: '',
    description: '',
    addon_type: 'general',
    price: 0,
    currency: 'USD',
    unlimited_quantity: false,
    quantity_limit: 100,
    per_order_limit: 5,
    is_active: true,
    is_visible: true,
  });

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [isEditPromoDialogOpen, setIsEditPromoDialogOpen] = useState(false);
  const [deletePromoConfirmationOpen, setDeletePromoConfirmationOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState<CreatePromoCodeInput>({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    max_discount_amount: undefined,
    min_order_value: undefined,
    applicable_to: 'all',
    usage_limit: undefined,
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  // Settings State
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

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

  // Fetch add-ons
  const fetchAddons = async () => {
    try {
      const addonsData = await eventsAPI.getAddons(eventId);
      setAddons(addonsData);
    } catch (error) {
      console.error('Error fetching addons:', error);
      toast.error('Failed to load add-ons');
    }
  };

  // Fetch promo codes
  const fetchPromoCodes = async () => {
    try {
      const promosData = await eventsAPI.getPromoCodes(eventId);
      setPromoCodes(promosData);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to load promo codes');
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const settingsData = await eventsAPI.getEventSettings(eventId);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAddons();
    fetchPromoCodes();
  }, [eventId]);

  // Fetch settings when switching to settings tab
  useEffect(() => {
    if (activeTab === 'settings' && !settings) {
      fetchSettings();
    }
  }, [activeTab]);

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

  // ==================== ADD-ONS HANDLERS ====================
  
  const resetAddonForm = () => {
    setAddonForm({
      name: '',
      description: '',
      addon_type: 'general',
      price: 0,
      currency: 'USD',
      unlimited_quantity: false,
      quantity_limit: 100,
      per_order_limit: 5,
      is_active: true,
      is_visible: true,
    });
    setSelectedAddon(null);
  };

  const handleCreateAddon = async () => {
    if (!addonForm.name) {
      toast.error('Add-on name is required');
      return;
    }
    if (addonForm.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    try {
      setIsSubmitting(true);
      await eventsAPI.createAddon(eventId, addonForm);
      toast.success('Add-on created successfully');
      setIsAddonDialogOpen(false);
      resetAddonForm();
      fetchAddons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create add-on');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAddon = async () => {
    if (!selectedAddon) return;

    try {
      setIsSubmitting(true);
      await eventsAPI.updateAddon(eventId, selectedAddon.id, addonForm as UpdateAddonInput);
      toast.success('Add-on updated successfully');
      setIsEditAddonDialogOpen(false);
      resetAddonForm();
      fetchAddons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update add-on');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddon = async () => {
    if (!addonToDelete) return;

    try {
      setIsSubmitting(true);
      await eventsAPI.deleteAddon(eventId, addonToDelete);
      toast.success('Add-on deleted successfully');
      setDeleteAddonConfirmationOpen(false);
      setAddonToDelete(null);
      fetchAddons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete add-on');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAddonStatus = async (addonId: number) => {
    try {
      await eventsAPI.toggleAddonStatus(eventId, addonId);
      toast.success('Add-on status updated');
      fetchAddons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle add-on status');
    }
  };

  const openEditAddonDialog = (addon: Addon) => {
    setSelectedAddon(addon);
    setAddonForm({
      name: addon.name,
      description: addon.description || '',
      addon_type: addon.addon_type,
      price: parseFloat(addon.price.toString()),
      currency: addon.currency,
      unlimited_quantity: addon.unlimited_quantity,
      quantity_limit: addon.quantity_limit || 100,
      per_order_limit: addon.per_order_limit || 5,
      is_active: addon.is_active,
      is_visible: addon.is_visible,
    });
    setIsEditAddonDialogOpen(true);
  };

  // ==================== PROMO CODES HANDLERS ====================
  
  const resetPromoForm = () => {
    setPromoForm({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      max_discount_amount: undefined,
      min_order_value: undefined,
      applicable_to: 'all',
      usage_limit: undefined,
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    setSelectedPromo(null);
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPromoForm({ ...promoForm, code });
  };

  const handleCreatePromo = async () => {
    if (!promoForm.code) {
      toast.error('Promo code is required');
      return;
    }
    if (promoForm.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (promoForm.discount_type === 'percentage' && promoForm.discount_value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    try {
      setIsSubmitting(true);
      await eventsAPI.createPromoCode(eventId, promoForm);
      toast.success('Promo code created successfully');
      setIsPromoDialogOpen(false);
      resetPromoForm();
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePromo = async () => {
    if (!selectedPromo) return;

    try {
      setIsSubmitting(true);
      await eventsAPI.updatePromoCode(eventId, selectedPromo.id, promoForm as UpdatePromoCodeInput);
      toast.success('Promo code updated successfully');
      setIsEditPromoDialogOpen(false);
      resetPromoForm();
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromo = async () => {
    if (!promoToDelete) return;

    try {
      setIsSubmitting(true);
      await eventsAPI.deletePromoCode(eventId, promoToDelete);
      toast.success('Promo code deleted successfully');
      setDeletePromoConfirmationOpen(false);
      setPromoToDelete(null);
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete promo code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePromoStatus = async (promoId: number) => {
    try {
      await eventsAPI.togglePromoCodeStatus(eventId, promoId);
      toast.success('Promo code status updated');
      fetchPromoCodes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle promo code status');
    }
  };

  const openEditPromoDialog = (promo: PromoCode) => {
    setSelectedPromo(promo);
    setPromoForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: parseFloat(promo.discount_value.toString()),
      max_discount_amount: promo.max_discount_amount ? parseFloat(promo.max_discount_amount.toString()) : undefined,
      min_order_value: promo.min_order_value ? parseFloat(promo.min_order_value.toString()) : undefined,
      applicable_to: promo.applicable_to,
      usage_limit: promo.usage_limit || undefined,
      valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().slice(0, 16) : '',
      valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : '',
      is_active: promo.is_active,
    });
    setIsEditPromoDialogOpen(true);
  };

  // ==================== SETTINGS HANDLERS ====================
  
  const handleUpdateSettings = async (updates: UpdateEventSettingsInput) => {
    try {
      setSettingsSaving(true);
      const updatedSettings = await eventsAPI.updateEventSettings(eventId, updates);
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
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
            <TabsTrigger value="settings" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === 'inventory' && (
              <>
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
              </>
            )}
            {activeTab === 'addons' && (
              <Button
                onClick={() => { resetAddonForm(); setIsAddonDialogOpen(true); }}
                className="bg-[#0f172b] hover:bg-[#1d293d]"
                data-testid="add-addon-btn"
              >
                <Plus size={16} className="mr-2" /> Add Add-on
              </Button>
            )}
            {activeTab === 'promos' && (
              <Button
                onClick={() => { resetPromoForm(); setIsPromoDialogOpen(true); }}
                className="bg-[#0f172b] hover:bg-[#1d293d]"
                data-testid="add-promo-btn"
              >
                <Plus size={16} className="mr-2" /> Add Promo Code
              </Button>
            )}
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

        {/* Add-ons Tab */}
        <TabsContent value="addons" className="mt-0">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {addons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <ShoppingBag size={48} className="mb-4" />
                <p className="text-lg font-medium">No add-ons found</p>
                <p className="text-sm">Create add-ons to offer merchandise, parking, or extras</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Add-on Name</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Sold / Limit</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addons.map((addon) => (
                    <TableRow key={addon.id} className="hover:bg-slate-50/50" data-testid={`addon-row-${addon.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-[#1d293d]">{addon.name}</div>
                          {addon.description && (
                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{addon.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {addon.addon_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(parseFloat(addon.price.toString()))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {addon.unlimited_quantity ? (
                            <span className="text-sm text-slate-600">{addon.quantity_sold} / ∞</span>
                          ) : (
                            <>
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    addon.quantity_limit && addon.quantity_sold >= addon.quantity_limit ? 'bg-rose-500' :
                                    addon.quantity_limit && addon.quantity_sold / addon.quantity_limit > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                                  )}
                                  style={{ width: `${addon.quantity_limit ? Math.min((addon.quantity_sold / addon.quantity_limit) * 100, 100) : 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600">
                                {addon.quantity_sold} / {addon.quantity_limit}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('font-medium', addon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                          {addon.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`addon-actions-${addon.id}`}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEditAddonDialog(addon)}>
                              Edit Add-on
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAddonStatus(addon.id)}>
                              {addon.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => { setAddonToDelete(addon.id); setDeleteAddonConfirmationOpen(true); }}
                              className="text-rose-600"
                              disabled={addon.quantity_sold > 0}
                            >
                              Delete Add-on
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

        {/* Promo Codes Tab */}
        <TabsContent value="promos" className="mt-0">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {promoCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Percent size={48} className="mb-4" />
                <p className="text-lg font-medium">No promo codes found</p>
                <p className="text-sm">Create promo codes to offer discounts on tickets</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Discount</TableHead>
                    <TableHead className="font-semibold">Usage</TableHead>
                    <TableHead className="font-semibold">Validity</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id} className="hover:bg-slate-50/50" data-testid={`promo-row-${promo.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold text-[#1d293d] bg-slate-100 px-2 py-1 rounded">
                            {promo.code}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => { navigator.clipboard.writeText(promo.code); toast.success('Code copied!'); }}
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {promo.discount_type === 'percentage' 
                            ? `${promo.discount_value}% off` 
                            : formatCurrency(parseFloat(promo.discount_value.toString()))}
                        </div>
                        {promo.max_discount_amount && (
                          <div className="text-xs text-slate-500">Max: {formatCurrency(parseFloat(promo.max_discount_amount.toString()))}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {promo.usage_count} / {promo.usage_limit || '∞'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {promo.valid_from || promo.valid_until ? (
                          <div>
                            {formatDate(promo.valid_from)} - {formatDate(promo.valid_until)}
                          </div>
                        ) : (
                          'No limit'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('font-medium', promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                          {promo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`promo-actions-${promo.id}`}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openEditPromoDialog(promo)}>
                              Edit Promo Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePromoStatus(promo.id)}>
                              {promo.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => { setPromoToDelete(promo.id); setDeletePromoConfirmationOpen(true); }}
                              className="text-rose-600"
                            >
                              Delete Promo Code
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-0">
          {settingsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : settings ? (
            <div className="space-y-6">
              {/* Tax & Fees */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1d293d] mb-4">Tax & Fees</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Pass Fees to Attendees</Label>
                      <p className="text-xs text-slate-500">Add service fees on top of ticket price</p>
                    </div>
                    <Switch
                      checked={settings.pass_fees_to_attendees}
                      onCheckedChange={(checked) => handleUpdateSettings({ pass_fees_to_attendees: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Charge Tax</Label>
                      <p className="text-xs text-slate-500">Apply tax to ticket sales</p>
                    </div>
                    <Switch
                      checked={settings.charge_tax}
                      onCheckedChange={(checked) => handleUpdateSettings({ charge_tax: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  {settings.charge_tax && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Tax Type</Label>
                        <Select
                          value={settings.tax_type || 'vat'}
                          onValueChange={(value) => handleUpdateSettings({ tax_type: value })}
                          disabled={settingsSaving}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vat">VAT</SelectItem>
                            <SelectItem value="gst">GST</SelectItem>
                            <SelectItem value="sales_tax">Sales Tax</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={settings.tax_rate || 0}
                          onChange={(e) => handleUpdateSettings({ tax_rate: parseFloat(e.target.value) || 0 })}
                          disabled={settingsSaving}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Policy */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1d293d] mb-4">Refund Policy</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Refund Policy</Label>
                    <Select
                      value={settings.refund_policy}
                      onValueChange={(value) => handleUpdateSettings({ refund_policy: value })}
                      disabled={settingsSaving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_refunds">No Refunds</SelectItem>
                        <SelectItem value="full_refund">Full Refund</SelectItem>
                        <SelectItem value="partial_refund">Partial Refund</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(settings.refund_policy === 'partial_refund' || settings.refund_policy === 'custom') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Deadline (days before event)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={settings.refund_deadline_days || 0}
                          onChange={(e) => handleUpdateSettings({ refund_deadline_days: parseInt(e.target.value) || 0 })}
                          disabled={settingsSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Refund Percentage (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={settings.refund_percentage || 0}
                          onChange={(e) => handleUpdateSettings({ refund_percentage: parseFloat(e.target.value) || 0 })}
                          disabled={settingsSaving}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Sales Rules */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1d293d] mb-4">Ticket Sales Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Allow Transfers</Label>
                      <p className="text-xs text-slate-500">Allow attendees to transfer tickets</p>
                    </div>
                    <Switch
                      checked={settings.allow_transfers}
                      onCheckedChange={(checked) => handleUpdateSettings({ allow_transfers: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Allow Cancellations</Label>
                      <p className="text-xs text-slate-500">Allow attendees to cancel registrations</p>
                    </div>
                    <Switch
                      checked={settings.allow_cancellations}
                      onCheckedChange={(checked) => handleUpdateSettings({ allow_cancellations: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Lock Changes After Event Start</Label>
                      <p className="text-xs text-slate-500">Prevent modifications once event begins</p>
                    </div>
                    <Switch
                      checked={settings.lock_changes_after_event_start}
                      onCheckedChange={(checked) => handleUpdateSettings({ lock_changes_after_event_start: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                </div>
              </div>

              {/* Visibility Rules */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1d293d] mb-4">Visibility Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Hide Sold Out Tickets</Label>
                      <p className="text-xs text-slate-500">Don't show tickets with no availability</p>
                    </div>
                    <Switch
                      checked={settings.hide_sold_out_tickets}
                      onCheckedChange={(checked) => handleUpdateSettings({ hide_sold_out_tickets: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto-hide Past Tickets</Label>
                      <p className="text-xs text-slate-500">Hide tickets after sales end date</p>
                    </div>
                    <Switch
                      checked={settings.auto_hide_past_tickets}
                      onCheckedChange={(checked) => handleUpdateSettings({ auto_hide_past_tickets: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                </div>
              </div>

              {/* Capacity Rules */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1d293d] mb-4">Capacity Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Stop Sales When Full</Label>
                      <p className="text-xs text-slate-500">Automatically stop sales at capacity</p>
                    </div>
                    <Switch
                      checked={settings.stop_sales_when_full}
                      onCheckedChange={(checked) => handleUpdateSettings({ stop_sales_when_full: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Allow Admin Overselling</Label>
                      <p className="text-xs text-slate-500">Let admins sell beyond capacity</p>
                    </div>
                    <Switch
                      checked={settings.allow_admin_overselling}
                      onCheckedChange={(checked) => handleUpdateSettings({ allow_admin_overselling: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto-enable Waitlist</Label>
                      <p className="text-xs text-slate-500">Enable waitlist when sold out</p>
                    </div>
                    <Switch
                      checked={settings.auto_enable_waitlist}
                      onCheckedChange={(checked) => handleUpdateSettings({ auto_enable_waitlist: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                </div>
              </div>

              {/* Confirmation & Invoices */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-[#1d293d] mb-4">Confirmation & Invoices</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto-send Confirmation</Label>
                      <p className="text-xs text-slate-500">Send email on successful registration</p>
                    </div>
                    <Switch
                      checked={settings.auto_send_confirmation}
                      onCheckedChange={(checked) => handleUpdateSettings({ auto_send_confirmation: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Attach Invoice</Label>
                      <p className="text-xs text-slate-500">Include invoice PDF in confirmation</p>
                    </div>
                    <Switch
                      checked={settings.attach_invoice}
                      onCheckedChange={(checked) => handleUpdateSettings({ attach_invoice: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Show Tax Breakdown</Label>
                      <p className="text-xs text-slate-500">Display tax details on invoice</p>
                    </div>
                    <Switch
                      checked={settings.show_tax_breakdown}
                      onCheckedChange={(checked) => handleUpdateSettings({ show_tax_breakdown: checked })}
                      disabled={settingsSaving}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Settings size={48} className="mb-4" />
              <p className="text-lg font-medium">Unable to load settings</p>
              <Button variant="outline" onClick={fetchSettings} className="mt-4">
                Retry
              </Button>
            </div>
          )}
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
