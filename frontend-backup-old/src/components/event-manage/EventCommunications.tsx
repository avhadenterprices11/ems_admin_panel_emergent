import React, { useState } from 'react';
import {
  Plus,
  Mail,
  MessageSquare,
  Send,
  Clock,
  FileEdit,
  MoreHorizontal,
  Copy,
  Pause,
  Play,
  BarChart2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ResponsiveTable, MobileCardConfig } from '../ui/responsive-table';
import { CommsCampaignBuilder } from './communications/CommsCampaignBuilder';
import { CommsTemplateEditor } from './communications/CommsTemplateEditor';
import { CommsAudienceBuilder } from './communications/CommsAudienceBuilder';

interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS';
  status: 'Sent' | 'Scheduled' | 'Draft';
  sent: number;
  openRate: string;
  clickRate: string;
  date: string;
}

const mockCampaigns: Campaign[] = [
  { id: "CMP-001", name: "Welcome Guide & Schedule", type: "Email", status: "Sent", sent: 1250, openRate: "68%", clickRate: "42%", date: "Oct 20, 9:00 AM" },
  { id: "CMP-002", name: "Know Before You Go", type: "Email", status: "Scheduled", sent: 0, openRate: "-", clickRate: "-", date: "Oct 23, 10:00 AM" },
  { id: "CMP-003", name: "Event Starting Soon", type: "SMS", status: "Draft", sent: 0, openRate: "-", clickRate: "-", date: "-" }
];

const TemplateCard = ({ name, type, onEdit }: { name: string; type: 'Email' | 'SMS'; onEdit: () => void }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2 rounded-lg ${type === 'Email' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
        {type === 'Email' ? <Mail size={20} /> : <MessageSquare size={20} />}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-rose-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <h4 className="font-bold text-[#1d293d] mb-1">{name}</h4>
    <p className="text-xs text-slate-500">Last edited 2 days ago</p>
  </div>
);

export const EventCommunications = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create-campaign' | 'create-template' | 'create-segment'>('list');

  if (viewMode === 'create-campaign') {
    return <CommsCampaignBuilder onCancel={() => setViewMode('list')} onSave={() => setViewMode('list')} />;
  }

  if (viewMode === 'create-template') {
    return <CommsTemplateEditor onCancel={() => setViewMode('list')} onSave={() => setViewMode('list')} />;
  }

  if (viewMode === 'create-segment') {
    return <CommsAudienceBuilder onCancel={() => setViewMode('list')} onSave={() => setViewMode('list')} />;
  }

  const mobileConfig: MobileCardConfig<Campaign> = {
    idField: (camp) => camp.id,
    titleField: (camp) => camp.name,
    valueField: (camp) => (
      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
        {camp.type === 'Email' ? <Mail size={14} /> : <MessageSquare size={14} />}
        {camp.type}
      </div>
    ),
    statusField: (camp) => (
      <Badge variant="outline" className={`font-normal border-0 px-2 py-0 h-5 text-[10px] ${
        camp.status === 'Sent' ? 'bg-emerald-50 text-emerald-600' :
        camp.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
        'bg-slate-100 text-slate-500'
      }`}>
        {camp.status}
      </Badge>
    ),
    expandedFields: [
      { label: "Date", value: (c) => c.date },
      { label: "Recipients", value: (c) => c.sent > 0 ? c.sent.toLocaleString() : '-' },
      {
        label: "Performance",
        value: (c) => c.status === 'Sent' ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              <span className="font-bold">{c.openRate}</span> Open
            </span>
            <span className="text-slate-600">
              <span className="font-bold">{c.clickRate}</span> Click
            </span>
          </div>
        ) : <span className="text-xs text-slate-400">No data yet</span>
      }
    ],
    actions: (camp) => (
      <Button size="sm" variant="outline" className="w-full" onClick={() => setViewMode('create-campaign')}>
        Manage Campaign
      </Button>
    )
  };

  return (
    <Tabs defaultValue="campaigns" className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <TabsList className="bg-white border border-slate-200 justify-start h-10 p-1">
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-slate-100">
            All Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-100">
            Templates
          </TabsTrigger>
          <TabsTrigger value="audience" className="data-[state=active]:bg-slate-100">
            Audience Segments
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100">
            Settings
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button className="bg-[#0f172b]" onClick={() => setViewMode('create-campaign')}>
            <Plus size={16} className="mr-2" /> New Campaign
          </Button>
        </div>
      </div>

      {/* Tab 1: All Campaigns */}
      <TabsContent value="campaigns" className="space-y-6">
        <ResponsiveTable
          data={mockCampaigns}
          mobileConfig={mobileConfig}
          renderDesktop={() => (
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="text-[#253154] font-bold">Campaign Name</TableHead>
                    <TableHead className="text-[#253154] font-bold">Type</TableHead>
                    <TableHead className="text-[#253154] font-bold">Status</TableHead>
                    <TableHead className="text-[#253154] font-bold">Recipients</TableHead>
                    <TableHead className="text-[#253154] font-bold">Performance</TableHead>
                    <TableHead className="text-right text-[#253154] font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCampaigns.map((camp) => (
                    <TableRow key={camp.id} className="hover:bg-slate-50/60">
                      <TableCell>
                        <div className="font-medium text-[#1d293d]">
                          {camp.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {camp.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          {camp.type === 'Email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                          {camp.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-normal border-0 ${
                          camp.status === 'Sent' ? 'bg-emerald-50 text-emerald-600' :
                          camp.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {camp.status === 'Sent' && <Send size={12} className="mr-1" />}
                          {camp.status === 'Scheduled' && <Clock size={12} className="mr-1" />}
                          {camp.status === 'Draft' && <FileEdit size={12} className="mr-1" />}
                          {camp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {camp.sent > 0 ? camp.sent.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {camp.status === 'Sent' ? (
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-600">
                              <span className="font-bold">{camp.openRate}</span> Open
                            </span>
                            <span className="text-slate-600">
                              <span className="font-bold">{camp.clickRate}</span> Click
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            No data yet
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewMode('create-campaign')}>
                              <FileEdit className="mr-2 h-4 w-4" /> Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            {camp.status === 'Scheduled' ? (
                              <DropdownMenuItem>
                                <Pause className="mr-2 h-4 w-4" /> Pause
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" /> Resume
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <BarChart2 className="mr-2 h-4 w-4" /> View Performance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      {/* Tab 2: Templates */}
      <TabsContent value="templates" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TemplateCard name="Registration Confirmation" type="Email" onEdit={() => setViewMode('create-template')} />
          <TemplateCard name="Event Reminder (24h)" type="Email" onEdit={() => setViewMode('create-template')} />
          <TemplateCard name="Badge QR Code" type="Email" onEdit={() => setViewMode('create-template')} />
          <TemplateCard name="Feedback Request" type="Email" onEdit={() => setViewMode('create-template')} />
          <TemplateCard name="Urgent Update" type="SMS" onEdit={() => setViewMode('create-template')} />
          <div
            className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 hover:bg-slate-50 cursor-pointer text-slate-400 flex-col gap-2"
            onClick={() => setViewMode('create-template')}
          >
            <Plus size={24} />
            <span className="font-medium">Create Template</span>
          </div>
        </div>
      </TabsContent>

      {/* Tab 3: Audience Segments */}
      <TabsContent value="audience" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-[#1d293d]">All Attendees</h4>
                <p className="text-xs text-slate-500">Everyone with a valid ticket</p>
              </div>
              <Badge variant="secondary">1,250</Badge>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-800 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('create-segment')}>
                Edit Segment
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-[#1d293d]">VIP Ticket Holders</h4>
                <p className="text-xs text-slate-500">Attendees with VIP Access pass</p>
              </div>
              <Badge variant="secondary">100</Badge>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('create-segment')}>
                Edit Segment
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-[#1d293d]">Not Checked In</h4>
                <p className="text-xs text-slate-500">Attendees yet to arrive</p>
              </div>
              <Badge variant="secondary">708</Badge>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '56%' }} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('create-segment')}>
                Edit Segment
              </Button>
            </div>
          </div>

          <div
            className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 hover:bg-slate-50 cursor-pointer text-slate-400 flex-col gap-2 min-h-[200px]"
            onClick={() => setViewMode('create-segment')}
          >
            <Plus size={24} />
            <span className="font-medium">Create New Segment</span>
          </div>
        </div>
      </TabsContent>

      {/* Tab 4: Settings */}
      <TabsContent value="settings" className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-lg text-[#1d293d]">Sender Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label>Default Sender Name</Label>
              <Input placeholder="Global Tech Summit Team" />
            </div>
            <div className="grid gap-2">
              <Label>Reply-To Email</Label>
              <Input placeholder="support@techsummit.com" />
            </div>
            <div className="grid gap-2">
              <Label>SMS Sender ID</Label>
              <Input placeholder="NISAU" maxLength={11} />
              <p className="text-xs text-slate-500">Max 11 alphanumeric characters.</p>
            </div>
          </div>

          <Separator />

          <h3 className="font-bold text-lg text-[#1d293d]">Delivery Rules</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quiet Hours</Label>
                <p className="text-sm text-slate-500">
                  Do not send SMS between 10 PM and 8 AM local time.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Email Channel</Label>
                <p className="text-sm text-slate-500">
                  Allow sending email campaigns.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable SMS Channel</Label>
                <p className="text-sm text-slate-500">
                  Allow sending SMS campaigns (Additional costs apply).
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Opt-out Handling</Label>
                <p className="text-sm text-slate-500">
                  Automatically exclude unsubscribed users.
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>

          <Separator />

          <div>
            <Button variant="outline">
              <ExternalLink size={16} className="mr-2" /> View Delivery Logs
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};