import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Upload,
  Download,
  UserPlus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { 
  eventsAPI, 
  Registration, 
  RegistrationStats, 
  CreateRegistrationInput,
  Ticket,
} from '../../api/events.api';
import { toast } from 'sonner';
import { cn } from '../ui/utils';

interface EventRegistrationsProps {
  eventId: number;
}

export const EventRegistrations: React.FC<EventRegistrationsProps> = ({ eventId }) => {
  // Data state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateRegistrationInput>({
    registrant_name: '',
    registrant_email: '',
    registrant_phone: '',
    ticket_id: undefined,
    quantity: 1,
    payment_status: 'paid',
    payment_method: 'manual',
    status: 'completed',
  });

  const [errors, setErrors] = useState({
    registrant_name: false,
    registrant_email: false,
  });

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const result = await eventsAPI.getRegistrations(eventId, params);
      setRegistrations(result.registrations);
      setTotal(result.total);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await eventsAPI.getRegistrationStats(eventId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch tickets for dropdown
  const fetchTickets = async () => {
    try {
      const ticketsData = await eventsAPI.getTickets(eventId);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
    fetchTickets();
  }, [eventId]);

  useEffect(() => {
    fetchRegistrations();
  }, [page, activeFilter, searchQuery]);

  // Validation
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const isFormValid = formData.registrant_name.trim() !== '' && validateEmail(formData.registrant_email);

  // Reset form
  const resetForm = () => {
    setFormData({
      registrant_name: '',
      registrant_email: '',
      registrant_phone: '',
      ticket_id: undefined,
      quantity: 1,
      payment_status: 'paid',
      payment_method: 'manual',
      status: 'completed',
    });
    setErrors({ registrant_name: false, registrant_email: false });
  };

  // Handle save registration
  const handleSave = async () => {
    const newErrors = {
      registrant_name: !formData.registrant_name.trim(),
      registrant_email: !formData.registrant_email.trim() || !validateEmail(formData.registrant_email),
    };

    setErrors(newErrors);

    if (!newErrors.registrant_name && !newErrors.registrant_email) {
      try {
        setIsSubmitting(true);
        await eventsAPI.createRegistration(eventId, formData);
        toast.success('Registration created successfully');
        setIsAddOpen(false);
        resetForm();
        fetchRegistrations();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to create registration');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (registrationId: number, status: string) => {
    try {
      await eventsAPI.updateRegistrationStatus(eventId, registrationId, status);
      toast.success('Status updated successfully');
      fetchRegistrations();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (registrationId: number, paymentStatus: string) => {
    try {
      await eventsAPI.updateRegistrationPaymentStatus(eventId, registrationId, paymentStatus);
      toast.success('Payment status updated successfully');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Map backend status to display status
  const getDisplayStatus = (status: string): 'Approved' | 'Pending' | 'Cancelled' => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'Approved';
      case 'pending':
      case 'started':
        return 'Pending';
      case 'cancelled':
      case 'refunded':
      case 'expired':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  // Map backend payment status to display
  const getDisplayPaymentStatus = (status?: string): 'Paid' | 'Free' | 'Pending' | 'Failed' => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'free':
        return 'Free';
      case 'pending':
        return 'Pending';
      case 'failed':
      case 'refunded':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        {/* Left Side: Search + Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search by name, email, or order ID..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              data-testid="registration-search-input"
            />
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" 
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            data-testid="add-registration-btn"
          >
            <UserPlus size={16} className="mr-2" /> Add Registration
          </Button>
        </div>
      </div>

      {/* Quick Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Badge
          variant={activeFilter === 'all' ? 'secondary' : 'outline'}
          className={cn(
            'cursor-pointer px-4 py-1.5 rounded-full',
            activeFilter === 'all' 
              ? 'bg-[#0f172b] text-white hover:bg-[#1d293d]' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
          )}
          onClick={() => handleFilterChange('all')}
          data-testid="filter-all"
        >
          All Registrations ({stats?.total || 0})
        </Badge>
        <Badge
          variant={activeFilter === 'pending' ? 'secondary' : 'outline'}
          className={cn(
            'cursor-pointer px-4 py-1.5 rounded-full',
            activeFilter === 'pending' 
              ? 'bg-[#0f172b] text-white hover:bg-[#1d293d]' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
          )}
          onClick={() => handleFilterChange('pending')}
          data-testid="filter-pending"
        >
          Pending Approval ({stats?.pending || 0})
        </Badge>
        <Badge
          variant={activeFilter === 'incomplete' ? 'secondary' : 'outline'}
          className={cn(
            'cursor-pointer px-4 py-1.5 rounded-full',
            activeFilter === 'incomplete' 
              ? 'bg-[#0f172b] text-white hover:bg-[#1d293d]' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
          )}
          onClick={() => handleFilterChange('incomplete')}
          data-testid="filter-incomplete"
        >
          Incomplete ({stats?.incomplete || 0})
        </Badge>
        <Badge
          variant={activeFilter === 'cancelled' ? 'secondary' : 'outline'}
          className={cn(
            'cursor-pointer px-4 py-1.5 rounded-full',
            activeFilter === 'cancelled' 
              ? 'bg-[#0f172b] text-white hover:bg-[#1d293d]' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
          )}
          onClick={() => handleFilterChange('cancelled')}
          data-testid="filter-cancelled"
        >
          Cancelled ({stats?.cancelled || 0})
        </Badge>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
        {registrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <UserPlus size={48} className="mb-4" />
            <p className="text-lg font-medium">No registrations found</p>
            <p className="text-sm">Add registrations or adjust your filters</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[40px]">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-[#253154] font-bold">Registrant</TableHead>
                <TableHead className="text-[#253154] font-bold">Ticket Type</TableHead>
                <TableHead className="text-[#253154] font-bold">Date</TableHead>
                <TableHead className="text-[#253154] font-bold">Payment</TableHead>
                <TableHead className="text-[#253154] font-bold">Status</TableHead>
                <TableHead className="text-right text-[#253154] font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => {
                const displayStatus = getDisplayStatus(reg.status);
                const displayPayment = getDisplayPaymentStatus(reg.payment_status);
                
                return (
                  <TableRow key={reg.id} className="hover:bg-slate-50/60" data-testid={`registration-row-${reg.id}`}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {reg.registrant_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-[#1d293d]">
                            {reg.registrant_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {reg.registrant_email || reg.registration_code}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {reg.ticket_name || 'No ticket'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {formatDate(reg.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('font-normal border-0', 
                        displayPayment === 'Paid' || displayPayment === 'Free'
                          ? 'bg-emerald-50 text-emerald-600' :
                        displayPayment === 'Pending'
                          ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      )}>
                        {displayPayment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {displayStatus === 'Approved' && (
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0">
                          <CheckCircle2 size={12} className="mr-1" /> Approved
                        </Badge>
                      )}
                      {displayStatus === 'Pending' && (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-0">
                          <Clock size={12} className="mr-1" /> Pending
                        </Badge>
                      )}
                      {displayStatus === 'Cancelled' && (
                        <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0">
                          <XCircle size={12} className="mr-1" /> Cancelled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" data-testid={`registration-actions-${reg.id}`}>
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(reg.id, 'approved')}>
                            Approve Registration
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(reg.id, 'pending')}>
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(reg.id, 'cancelled')}>
                            Cancel Registration
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePaymentStatusUpdate(reg.id, 'paid')}>
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePaymentStatusUpdate(reg.id, 'pending')}>
                            Mark Payment Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePaymentStatusUpdate(reg.id, 'failed')}>
                            Mark Payment Failed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {registrations.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} registrations</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Registration Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[540px] flex flex-col p-0 gap-0 overflow-hidden max-h-[90vh]">
          <DialogHeader className="p-6 border-b border-slate-100 flex-shrink-0">
            <DialogTitle>Add New Registration</DialogTitle>
            <DialogDescription>
              Manually add an attendee to the event list.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar-light">
            <div className="p-6 space-y-6">
              {/* Section 1: Registrant Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 border-b pb-2">
                  Registrant Details
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.registrant_name}
                    onChange={(e) => setFormData({...formData, registrant_name: e.target.value})}
                    className={errors.registrant_name ? "border-red-300 focus-visible:ring-red-200" : ""}
                    placeholder="e.g. John Doe"
                    data-testid="registration-name-input"
                  />
                  {errors.registrant_name && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle size={12} className="mr-1"/> Name is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.registrant_email}
                    onChange={(e) => setFormData({...formData, registrant_email: e.target.value})}
                    className={errors.registrant_email ? "border-red-300 focus-visible:ring-red-200" : ""}
                    placeholder="john@example.com"
                    data-testid="registration-email-input"
                  />
                  {errors.registrant_email && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle size={12} className="mr-1"/> Valid email is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.registrant_phone}
                    onChange={(e) => setFormData({...formData, registrant_phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Section 2: Ticket Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 border-b pb-2">
                  Ticket Details
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="ticketType">Ticket Type</Label>
                    <Select
                      value={formData.ticket_id?.toString() || 'none'}
                      onValueChange={(val) => setFormData({...formData, ticket_id: val === 'none' ? undefined : parseInt(val)})}
                    >
                      <SelectTrigger id="ticketType">
                        <SelectValue placeholder="Select ticket (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No ticket</SelectItem>
                        {tickets.map(ticket => (
                          <SelectItem key={ticket.id} value={ticket.id.toString()}>
                            {ticket.name} - ${parseFloat(ticket.price.toString()).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Payment & Status */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 border-b pb-2">
                  Payment & Status
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={formData.payment_status}
                      onValueChange={(val) => setFormData({...formData, payment_status: val})}
                    >
                      <SelectTrigger id="paymentStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(val) => setFormData({...formData, payment_method: val})}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Registration Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({...formData, status: val})}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-[#0f172b]"
              onClick={handleSave}
              disabled={!isFormValid || isSubmitting}
              data-testid="save-registration-btn"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
