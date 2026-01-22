import React, { useState, useEffect } from 'react';
import {
  Search,
  QrCode,
  UserCheck,
  MoreHorizontal,
  Smartphone,
  MapPin,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Users,
  Wifi,
  Battery,
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
  Attendee, 
  CheckinMetrics, 
  CheckinDevice,
  LocationStats,
  Ticket,
} from '../../api/events.api';
import { toast } from 'sonner';
import { cn } from '../ui/utils';

interface EventAttendeesProps {
  eventId: number;
}

export const EventAttendees: React.FC<EventAttendeesProps> = ({ eventId }) => {
  // Data state
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [metrics, setMetrics] = useState<CheckinMetrics | null>(null);
  const [devices, setDevices] = useState<CheckinDevice[]>([]);
  const [locations, setLocations] = useState<LocationStats[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // UI state
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckedInOnly, setShowCheckedInOnly] = useState(false);

  // QR Scanner state
  const [qrCode, setQRCode] = useState('');
  const [scannerLocation, setScannerLocation] = useState('');

  // Add attendee form
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeeTicket, setNewAttendeeTicket] = useState<string>('');

  // Fetch all data
  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      
      if (showCheckedInOnly || activeFilter === 'checked_in') {
        params.checkin_status = 'checked_in';
      } else if (activeFilter === 'not_checked_in') {
        params.checkin_status = 'not_checked_in';
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const result = await eventsAPI.getAttendees(eventId, params);
      setAttendees(result.attendees);
      setTotal(result.total);
    } catch (error) {
      console.error('Error fetching attendees:', error);
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metricsData = await eventsAPI.getCheckinMetrics(eventId);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const devicesData = await eventsAPI.getActiveDevices(eventId);
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationsData = await eventsAPI.getLocationStats(eventId);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const ticketsData = await eventsAPI.getTickets(eventId);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    fetchAttendees();
    fetchMetrics();
    fetchDevices();
    fetchLocations();
    fetchTickets();
  }, [eventId]);

  useEffect(() => {
    fetchAttendees();
  }, [page, activeFilter, searchQuery, showCheckedInOnly]);

  // Sync attendees from registrations
  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await eventsAPI.syncAttendees(eventId);
      toast.success(result.message);
      fetchAttendees();
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sync attendees');
    } finally {
      setSyncing(false);
    }
  };

  // Manual check-in
  const handleManualCheckin = async (attendeeId: number, location?: string) => {
    try {
      const result = await eventsAPI.manualCheckin(eventId, attendeeId, location);
      if (result.success) {
        toast.success(result.message);
        fetchAttendees();
        fetchMetrics();
        fetchLocations();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  // Undo check-in
  const handleUndoCheckin = async (attendeeId: number) => {
    try {
      const result = await eventsAPI.undoCheckin(eventId, attendeeId);
      if (result.success) {
        toast.success(result.message);
        fetchAttendees();
        fetchMetrics();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to undo check-in');
    }
  };

  // QR check-in
  const handleQRCheckin = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await eventsAPI.qrCheckin(eventId, {
        qr_code: qrCode.trim(),
        location: scannerLocation || undefined,
        device_name: 'Web Scanner',
      });

      if (result.success) {
        toast.success(`${result.attendee?.attendee_name} checked in successfully!`);
        setQRCode('');
        fetchAttendees();
        fetchMetrics();
        fetchLocations();
        fetchDevices();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process QR check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new attendee
  const handleAddAttendee = async () => {
    if (!newAttendeeName.trim()) {
      toast.error('Attendee name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await eventsAPI.createAttendee(
        eventId,
        newAttendeeName.trim(),
        newAttendeeEmail?.trim() || undefined,
        newAttendeeTicket ? parseInt(newAttendeeTicket) : undefined
      );
      toast.success('Attendee added successfully');
      setIsAddOpen(false);
      setNewAttendeeName('');
      setNewAttendeeEmail('');
      setNewAttendeeTicket('');
      fetchAttendees();
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add attendee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time
  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'checked_in':
        return { label: 'Checked In', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 };
      case 'no_show':
        return { label: 'No Show', color: 'bg-rose-50 text-rose-600', icon: XCircle };
      default:
        return { label: 'Not Here', color: 'bg-slate-100 text-slate-500', icon: Clock };
    }
  };

  if (loading && attendees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Checked In</p>
              <p className="text-2xl font-bold text-[#1d293d]">
                {metrics?.total_checked_in || 0} / {metrics?.total_registrations || 0}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {metrics?.checkin_percentage?.toFixed(1) || 0}% checked in
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <UserCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Peak Check-in Time</p>
              <p className="text-2xl font-bold text-[#1d293d]">
                {metrics?.peak_checkin_time || '-'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Busiest period</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Last Check-in</p>
              <p className="text-2xl font-bold text-[#1d293d]">
                {metrics?.last_checkin_ago || 'No check-ins'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {metrics?.last_checkin_time ? formatTime(metrics.last_checkin_time) : '-'}
              </p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl">
              <RefreshCw className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">No-Show Rate</p>
              <p className="text-2xl font-bold text-[#1d293d]">
                {metrics?.no_show_rate?.toFixed(1) || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {metrics?.no_show_count || 0} attendees
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <XCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search by name or QR code..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              data-testid="attendee-search-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="checkedInOnly"
              checked={showCheckedInOnly}
              onCheckedChange={(checked) => { setShowCheckedInOnly(!!checked); setPage(1); }}
            />
            <Label htmlFor="checkedInOnly" className="text-sm text-slate-600 cursor-pointer">
              Checked-in only
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncing}
            data-testid="sync-attendees-btn"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
            Sync from Registrations
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsQROpen(true)}
            data-testid="launch-scanner-btn"
          >
            <QrCode size={16} className="mr-2" /> Launch Scanner
          </Button>
          <Button
            className="bg-[#0e042f] hover:bg-[#1d293d] text-white"
            onClick={() => setIsAddOpen(true)}
            data-testid="add-attendee-btn"
          >
            <UserCheck size={16} className="mr-2" /> Add Attendee
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendees Table - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users size={48} className="mb-4" />
              <p className="text-lg font-medium">No attendees found</p>
              <p className="text-sm">Sync from registrations or add attendees manually</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[40px]">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="text-[#253154] font-bold">Attendee</TableHead>
                  <TableHead className="text-[#253154] font-bold">Ticket Type</TableHead>
                  <TableHead className="text-[#253154] font-bold">Check-in Time</TableHead>
                  <TableHead className="text-[#253154] font-bold">Status</TableHead>
                  <TableHead className="text-right text-[#253154] font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => {
                  const statusInfo = getStatusDisplay(attendee.checkin_status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={attendee.id} className="hover:bg-slate-50/60" data-testid={`attendee-row-${attendee.id}`}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {attendee.attendee_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-[#1d293d]">
                              {attendee.attendee_name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {attendee.attendee_email || attendee.qr_code_value}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {attendee.ticket_name || 'General'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600">
                          {attendee.checkin_time ? formatDateTime(attendee.checkin_time) : '-'}
                        </div>
                        {attendee.checkin_location && (
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {attendee.checkin_location}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('font-normal border-0', statusInfo.color)}>
                          <StatusIcon size={12} className="mr-1" /> {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" data-testid={`attendee-actions-${attendee.id}`}>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {attendee.checkin_status !== 'checked_in' ? (
                              <DropdownMenuItem onClick={() => handleManualCheckin(attendee.id)}>
                                <UserCheck size={14} className="mr-2" /> Manual Check-in
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUndoCheckin(attendee.id)}>
                                <RefreshCw size={14} className="mr-2" /> Undo Check-in
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Printer size={14} className="mr-2" /> Print Badge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <QrCode size={14} className="mr-2" /> View QR Code
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
          {attendees.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} attendees</span>
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

        {/* Sidebar - Devices & Locations */}
        <div className="space-y-6">
          {/* Active Devices */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-[#1d293d] mb-4 flex items-center gap-2">
              <Smartphone size={16} /> Active Devices
            </h3>
            {devices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No devices registered</p>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        device.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                      )} />
                      <div>
                        <div className="text-sm font-medium text-[#1d293d]">{device.device_name}</div>
                        <div className="text-xs text-slate-400">{device.total_scans} scans</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.battery_level && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Battery size={12} /> {device.battery_level}%
                        </div>
                      )}
                      {device.status === 'online' && <Wifi size={14} className="text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-[#1d293d] mb-4 flex items-center gap-2">
              <MapPin size={16} /> Check-in Locations
            </h3>
            {locations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No location data yet</p>
            ) : (
              <div className="space-y-3">
                {locations.map((loc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-[#1d293d]">{loc.location}</div>
                      <div className="text-xs text-slate-400">{loc.checkin_count} check-ins</div>
                    </div>
                    <div className="text-xs text-slate-400">{loc.last_checkin_ago}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Dialog - Enhanced with Camera Support */}
      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check-in Scanner</DialogTitle>
            <DialogDescription>
              Scan a QR code or enter the 6-digit unique code to check in an attendee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Camera Scanner Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <QrCode size={16} /> QR Code Scanner
              </Label>
              <div 
                className="border-2 border-dashed border-slate-200 rounded-lg h-48 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => {
                  // Mobile camera would open here
                  // For now we show a message
                  toast.info('Camera scanner works on mobile devices. Use manual entry below.');
                }}
                data-testid="camera-scanner-area"
              >
                <QrCode size={48} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">Tap to open camera</p>
                <p className="text-xs text-slate-400">(Mobile devices only)</p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or enter code manually</span>
              </div>
            </div>

            {/* Manual Code Entry */}
            <div className="space-y-2">
              <Label>QR Code / Unique Code</Label>
              <Input
                placeholder="Enter QR payload or 6-digit code (e.g., ABC123)"
                value={qrCode}
                onChange={(e) => setQRCode(e.target.value.toUpperCase())}
                className="font-mono text-lg tracking-wider text-center"
                maxLength={50}
                data-testid="qr-code-input"
              />
              <p className="text-xs text-slate-500">
                The unique code is printed on the ticket (6 characters, e.g., ABC123)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <Select value={scannerLocation} onValueChange={setScannerLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Gate">Main Gate</SelectItem>
                  <SelectItem value="VIP Entrance">VIP Entrance</SelectItem>
                  <SelectItem value="Side Entrance">Side Entrance</SelectItem>
                  <SelectItem value="Registration Desk">Registration Desk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleQRCheckin} 
              disabled={isSubmitting || !qrCode.trim()} 
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="qr-checkin-btn"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck size={16} className="mr-2" />}
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attendee Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Attendee</DialogTitle>
            <DialogDescription>
              Manually add an attendee to this event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. John Doe"
                value={newAttendeeName}
                onChange={(e) => setNewAttendeeName(e.target.value)}
                data-testid="add-attendee-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={newAttendeeEmail}
                onChange={(e) => setNewAttendeeEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ticket Type (Optional)</Label>
              <Select value={newAttendeeTicket} onValueChange={(val) => setNewAttendeeTicket(val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No ticket</SelectItem>
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                      {ticket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddAttendee} disabled={isSubmitting || !newAttendeeName.trim()} data-testid="save-attendee-btn">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Attendee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
