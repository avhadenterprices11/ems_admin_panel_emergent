import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ResponsiveTable, MobileCardConfig } from '../ui/responsive-table';
import { ExportDialog, ExportColumn, ExportOptions } from '../common/ExportDialog';
import { ImportDialog, ImportField, ImportMode } from '../common/ImportDialog';

interface Registration {
  id: string;
  name: string;
  email: string;
  ticket: string;
  date: string;
  payment: 'Paid' | 'Free' | 'Pending' | 'Failed';
  status: 'Approved' | 'Pending' | 'Cancelled';
}

const initialRegistrations: Registration[] = [
  { id: "REG-8392", name: "Alice Freeman", email: "alice@example.com", ticket: "General Admission", date: "Oct 24, 2023", payment: "Paid", status: "Approved" },
  { id: "REG-8393", name: "Bob Smith", email: "bob@company.co", ticket: "VIP Access", date: "Oct 24, 2023", payment: "Paid", status: "Approved" },
  { id: "REG-8394", name: "Charlie Davis", email: "charlie@school.edu", ticket: "Student Pass", date: "Oct 25, 2023", payment: "Free", status: "Pending" },
  { id: "REG-8395", name: "Diana Prince", email: "diana@amazon.com", ticket: "General Admission", date: "Oct 25, 2023", payment: "Failed", status: "Cancelled" }
];

const ticketTypes = ["General Admission", "VIP Access", "Student Pass", "Virtual Pass"];

export const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ticketType: 'General Admission',
    quantity: '1',
    paymentStatus: 'Paid' as Registration['payment'],
    paymentMethod: 'Manual',
    status: 'Approved' as Registration['status']
  });

  const [errors, setErrors] = useState({
    fullName: false,
    email: false
  });

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const isFormValid = formData.fullName.trim() !== '' && validateEmail(formData.email);

  const handleSave = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      email: !formData.email.trim() || !validateEmail(formData.email)
    };

    setErrors(newErrors);

    if (!newErrors.fullName && !newErrors.email) {
      const newRegistration: Registration = {
        id: `REG-${8396 + registrations.length}`,
        name: formData.fullName,
        email: formData.email,
        ticket: formData.ticketType,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        payment: formData.paymentStatus,
        status: formData.status
      };

      setRegistrations([newRegistration, ...registrations]);
      setIsAddOpen(false);

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        ticketType: 'General Admission',
        quantity: '1',
        paymentStatus: 'Paid',
        paymentMethod: 'Manual',
        status: 'Approved'
      });
      setErrors({ fullName: false, email: false });
    }
  };

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting registrations", options);
  };

  const handleImportData = async (file: File, mode: ImportMode) => {
    console.log("Importing", file, mode);
  };

  const mobileConfig: MobileCardConfig<Registration> = {
    idField: (reg) => reg.id,
    titleField: (reg) => reg.name,
    valueField: (reg) => (
      <span className="text-slate-900 font-medium text-xs">
        {reg.ticket}
      </span>
    ),
    statusField: (reg) => {
      if (reg.status === 'Approved')
        return <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 text-[10px] px-2 py-0 h-5">Approved</Badge>;
      if (reg.status === 'Pending')
        return <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 text-[10px] px-2 py-0 h-5">Pending</Badge>;
      return <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0 text-[10px] px-2 py-0 h-5">Cancelled</Badge>;
    },
    expandedFields: [
      { label: "Email", value: (r) => r.email },
      { label: "Date", value: (r) => r.date },
      {
        label: "Payment",
        value: (r) => (
          <Badge variant="outline" className={`font-normal border-0 text-[10px] px-2 py-0 h-5 ${
            r.payment === 'Paid' || r.payment === 'Free'
              ? 'bg-emerald-50 text-emerald-600' :
            r.payment === 'Pending'
              ? 'bg-amber-50 text-amber-600' :
            'bg-rose-50 text-rose-600'
          }`}>
            {r.payment}
          </Badge>
        )
      },
    ],
    actions: (reg) => (
      <div className="flex gap-2 w-full">
        <Button size="sm" variant="outline" className="flex-1">
          View Details
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Edit
        </Button>
      </div>
    )
  };

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'Registration ID' },
    { id: 'name', label: 'Registrant Name' },
    { id: 'email', label: 'Email' },
    { id: 'ticket', label: 'Ticket Type' },
    { id: 'date', label: 'Registration Date' },
    { id: 'payment', label: 'Payment Status' },
    { id: 'status', label: 'Status' }
  ];

  const importFields: ImportField[] = [
    { id: 'name', label: 'Registrant Name', required: true, type: 'text' },
    { id: 'email', label: 'Email Address', required: true, type: 'email' },
    { id: 'ticket', label: 'Ticket Type', required: true, type: 'select', options: ticketTypes },
    { id: 'status', label: 'Status', required: false, type: 'select', options: ['Approved', 'Pending', 'Cancelled'] }
  ];

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
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" onClick={() => setIsImportDialogOpen(true)}>
            <Upload size={16} className="mr-2" /> Import
          </Button>
          <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" onClick={() => setIsExportDialogOpen(true)}>
            <Download size={16} className="mr-2" /> Export
          </Button>
          <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" onClick={() => setIsAddOpen(true)}>
            <UserPlus size={16} className="mr-2" /> Add Registration
          </Button>
        </div>
      </div>

      {/* Quick Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Badge
          variant="secondary"
          className="bg-[#0f172b] text-white hover:bg-[#1d293d] cursor-pointer px-4 py-1.5 rounded-full"
        >
          All Registrations
        </Badge>
        <Badge
          variant="outline"
          className="bg-white hover:bg-slate-50 cursor-pointer px-4 py-1.5 rounded-full border-slate-200 text-slate-600"
        >
          Pending Approval (12)
        </Badge>
        <Badge
          variant="outline"
          className="bg-white hover:bg-slate-50 cursor-pointer px-4 py-1.5 rounded-full border-slate-200 text-slate-600"
        >
          Incomplete (5)
        </Badge>
        <Badge
          variant="outline"
          className="bg-white hover:bg-slate-50 cursor-pointer px-4 py-1.5 rounded-full border-slate-200 text-slate-600"
        >
          Cancelled
        </Badge>
      </div>

      {/* Responsive Table */}
      <ResponsiveTable
        data={registrations}
        mobileConfig={mobileConfig}
        renderDesktop={() => (
          <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
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
                {registrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-slate-50/60">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {reg.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[#1d293d]">
                            {reg.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {reg.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {reg.ticket}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {reg.date}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-normal border-0 ${
                        reg.payment === 'Paid' || reg.payment === 'Free'
                          ? 'bg-emerald-50 text-emerald-600' :
                        reg.payment === 'Pending'
                          ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {reg.payment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reg.status === 'Approved' && (
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0">
                          <CheckCircle2 size={12} className="mr-1" /> Approved
                        </Badge>
                      )}
                      {reg.status === 'Pending' && (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-0">
                          <Clock size={12} className="mr-1" /> Pending
                        </Badge>
                      )}
                      {reg.status === 'Cancelled' && (
                        <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0">
                          <XCircle size={12} className="mr-1" /> Cancelled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <MoreHorizontal size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing 1-{registrations.length} of 1,250 registrations</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </div>
        )}
      />

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
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={errors.fullName ? "border-red-300 focus-visible:ring-red-200" : ""}
                    placeholder="e.g. John Doe"
                  />
                  {errors.fullName && (
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? "border-red-300 focus-visible:ring-red-200" : ""}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle size={12} className="mr-1"/> Valid email is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                      value={formData.ticketType}
                      onValueChange={(val) => setFormData({...formData, ticketType: val})}
                    >
                      <SelectTrigger id="ticketType">
                        <SelectValue placeholder="Select ticket" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
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
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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
                      value={formData.paymentStatus}
                      onValueChange={(val) => setFormData({...formData, paymentStatus: val as Registration['payment']})}
                    >
                      <SelectTrigger id="paymentStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(val) => setFormData({...formData, paymentMethod: val})}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">Manual Entry</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Registration Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({...formData, status: val as Registration['status']})}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
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
              disabled={!isFormValid}
            >
              Save Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        columns={exportColumns}
        onExport={handleExportData}
        entityName="registrations"
      />

      {/* Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        fields={importFields}
        onImport={handleImportData}
        moduleName="registrations"
      />
    </div>
  );
};