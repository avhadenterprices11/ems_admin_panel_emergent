import React, { useState } from 'react';
import {
  Search,
  QrCode,
  UserCheck,
  Printer,
  RotateCcw,
  Clock,
  Check,
  Smartphone,
  Wifi,
  WifiOff,
  MapPin
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ResponsiveTable, MobileCardConfig } from '../ui/responsive-table';
import { ExportDialog, ExportColumn, ExportOptions } from '../common/ExportDialog';
import { ImportDialog, ImportField, ImportMode } from '../common/ImportDialog';

interface Attendee {
  id: string;
  name: string;
  ticket: string;
  status: 'Checked In' | 'Not Checked In';
  time: string;
  device: string;
}

const mockAttendees: Attendee[] = [
  { id: "ATT-001", name: "Alice Freeman", ticket: "General Admission", status: "Checked In", time: "09:42 AM", device: "Scanner 1" },
  { id: "ATT-002", name: "Bob Smith", ticket: "VIP Access", status: "Checked In", time: "09:15 AM", device: "Admin App" },
  { id: "ATT-003", name: "Charlie Davis", ticket: "Student Pass", status: "Not Checked In", time: "-", device: "-" },
  { id: "ATT-004", name: "Diana Prince", ticket: "General Admission", status: "Not Checked In", time: "-", device: "-" }
];

interface DeviceItemProps {
  name: string;
  status: 'online' | 'offline';
  battery: number;
  checkins: number;
}

const DeviceItem = ({ name, status, battery, checkins }: DeviceItemProps) => (
  <div className="p-3 border border-slate-100 rounded-lg bg-slate-50/50">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <Smartphone size={14} className="text-slate-400" />
        <span className="text-sm font-medium text-[#1d293d] truncate w-[120px]">
          {name}
        </span>
      </div>
      {status === 'online' ? (
        <Wifi size={14} className="text-emerald-500" />
      ) : (
        <WifiOff size={14} className="text-slate-300" />
      )}
    </div>
    <div className="flex justify-between text-xs text-slate-500">
      <span>Battery: {battery > 0 ? `${battery}%` : '-'}</span>
      <span>{checkins} scans</span>
    </div>
  </div>
);

export const EventAttendees = () => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleExportData = async (options: ExportOptions) => {
    console.log("Exporting attendees", options);
  };

  const handleImportData = async (file: File, mode: ImportMode) => {
    console.log("Importing", file, mode);
  };

  const mobileConfig: MobileCardConfig<Attendee> = {
    idField: (att) => att.id,
    titleField: (att) => att.name,
    valueField: (att) => (
      <span className="text-slate-900 font-medium text-xs">
        {att.ticket}
      </span>
    ),
    statusField: (att) => (
      att.status === 'Checked In' ? (
        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0 text-[10px] px-2 py-0 h-5">
          <Check size={10} className="mr-1" /> Checked In
        </Badge>
      ) : (
        <Badge variant="outline" className="text-slate-400 border-slate-200 text-[10px] px-2 py-0 h-5">
          Not Here
        </Badge>
      )
    ),
    expandedFields: [
      { label: "Check-in Time", value: (att) => att.time },
      { label: "Device", value: (att) => att.device },
    ],
    actions: (att) => (
      <Button
        size="sm"
        variant="outline"
        className={`w-full ${
          att.status === 'Checked In'
            ? 'text-amber-600 border-amber-200 bg-amber-50'
            : 'text-emerald-600 border-emerald-200 bg-emerald-50'
        }`}
      >
        {att.status === 'Checked In' ? (
          <>
            <RotateCcw size={14} className="mr-2" /> Undo Check-in
          </>
        ) : (
          <>
            <UserCheck size={14} className="mr-2" /> Check In
          </>
        )}
      </Button>
    )
  };

  const exportColumns: ExportColumn[] = [
    { id: 'id', label: 'Attendee ID' },
    { id: 'name', label: 'Name' },
    { id: 'ticket', label: 'Ticket Type' },
    { id: 'status', label: 'Check-in Status' },
    { id: 'time', label: 'Check-in Time' },
    { id: 'device', label: 'Check-in Device' }
  ];

  const importFields: ImportField[] = [
    { id: 'name', label: 'Attendee Name', required: true, type: 'text' },
    { id: 'ticket', label: 'Ticket Type', required: true, type: 'select', options: ['General Admission', 'VIP Access', 'Student Pass'] },
    { id: 'status', label: 'Status', required: false, type: 'select', options: ['Checked In', 'Not Checked In'] }
  ];

  return (
    <div className="space-y-6">
      {/* Top Section: Live Status + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Check-in Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#1d293d]">Live Check-in Status</h3>
              <p className="text-slate-500 text-sm">Real-time attendance tracking</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System Active
            </div>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-[#1d293d]">542</span>
            <span className="text-lg text-slate-400 mb-1">/ 1,250</span>
          </div>

          <Progress value={43} className="h-3 mb-4" />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block">Peak Check-in</span>
              <span className="font-medium">9:00 - 9:30 AM</span>
            </div>
            <div>
              <span className="text-slate-500 block">Last Check-in</span>
              <span className="font-medium">2 mins ago</span>
            </div>
            <div>
              <span className="text-slate-500 block">No-show Rate</span>
              <span className="font-medium">0.5%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-[#1d293d] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-[#0f172b]">
                <QrCode className="mr-2" size={16} /> Launch Scanner
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="mr-2" size={16} /> Manual Check-in
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="mr-2" size={16} /> Print Badge
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Attendee List + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Attendee List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Search attendees..."
                  className="pl-9 bg-slate-50 border-slate-200"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="show-checked-in" />
                <label
                  htmlFor="show-checked-in"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Show Checked-in Only
                </label>
              </div>
            </div>
            <div className="flex items-center">
              <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                Import List
              </Button>
              <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl ml-2" size="sm" onClick={() => setIsExportDialogOpen(true)}>
                Export List
              </Button>
            </div>
          </div>

          {/* Attendee Table */}
          <ResponsiveTable
            data={mockAttendees}
            mobileConfig={mobileConfig}
            renderDesktop={() => (
              <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-[#253154] font-bold">Attendee</TableHead>
                      <TableHead className="text-[#253154] font-bold">Ticket Type</TableHead>
                      <TableHead className="text-[#253154] font-bold">Check-in Time</TableHead>
                      <TableHead className="text-[#253154] font-bold">Status</TableHead>
                      <TableHead className="text-right text-[#253154] font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAttendees.map((att) => (
                      <TableRow key={att.id} className="hover:bg-slate-50/60">
                        <TableCell>
                          <div className="font-medium text-[#1d293d]">
                            {att.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {att.id}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {att.ticket}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {att.status === 'Checked In' ? (
                            <div className="flex items-center gap-1">
                              <Clock size={12} /> {att.time}
                              <span className="text-[10px] text-slate-400 ml-1">
                                ({att.device})
                              </span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {att.status === 'Checked In' ? (
                            <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0">
                              <Check size={12} className="mr-1" /> Checked In
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200">
                              Not Here
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {att.status === 'Checked In' ? (
                              <RotateCcw
                                size={16}
                                className="text-slate-400 hover:text-amber-600"
                              />
                            ) : (
                              <UserCheck
                                size={16}
                                className="text-emerald-600 hover:text-emerald-700"
                              />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Devices */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4">Active Devices</h3>
            <div className="space-y-4">
              <DeviceItem
                name="Main Entrance Scanner 1"
                status="online"
                battery={85}
                checkins={240}
              />
              <DeviceItem
                name="Main Entrance Scanner 2"
                status="online"
                battery={42}
                checkins={185}
              />
              <DeviceItem
                name="VIP Desk Tablet"
                status="offline"
                battery={0}
                checkins={45}
              />
              <DeviceItem
                name="Staff Mobile App (Sarah)"
                status="online"
                battery={90}
                checkins={72}
              />
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Devices
            </Button>
          </div>

          {/* Location Logs */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1d293d] mb-4">Location Logs</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-700">North Gate</span>
                  <div className="text-xs text-slate-500">
                    320 check-ins (Last: 1m ago)
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-700">VIP Entrance</span>
                  <div className="text-xs text-slate-500">
                    120 check-ins (Last: 5m ago)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        columns={exportColumns}
        onExport={handleExportData}
        entityName="attendees"
      />

      {/* Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        fields={importFields}
        onImport={handleImportData}
        moduleName="attendees"
      />
    </div>
  );
};