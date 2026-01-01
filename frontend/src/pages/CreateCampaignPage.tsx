import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, MessageSquare, Smartphone, Calendar, Users, CheckCircle2,
  AlertCircle, Clock, Send, Shield, AlertTriangle, Info, Eye,
  UserCheck, Bell, Lock, FileText, Activity, Zap,
  Globe, GraduationCap, ArrowLeft, Settings, Target, Filter, X, Check
} from 'lucide-react';
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';

interface CreateCampaignPageProps {
  onBack?: () => void;
}

export function CreateCampaignPage({ onBack }: CreateCampaignPageProps) {
  const navigate = useNavigate();

  const [campaignData, setCampaignData] = useState({
    name: '',
    channel: 'email',
    sender: 'default',
    audienceSource: 'event',
    subject: '',
    scheduleType: 'now',
    date: '',
    gdpr: true,
    campaignIntent: '',
    priorityLevel: 'normal',
    approvalRequired: false,
    approverRole: '',
    respectTimezone: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    overrideQuietHours: false,
    maxSendsPerRecipient: 'no-limit',
    deduplicationStrategy: 'once',
    conflictResolutionRule: 'event-override',
    previewAs: '',
    testEmail: '',
    allowJuryOverride: false,
    testRun: false
  });

  const [highRiskFlags, setHighRiskFlags] = useState<string[]>([
    'multiple-role-overlap',
    'jury-confidentiality'
  ]);

  // Validation Logic
  const isCampaignValid = 
    campaignData.name.length > 0 && 
    campaignData.subject.length > 0 &&
    campaignData.campaignIntent.length > 0;

  const canSendNow = 
    isCampaignValid && 
    (!campaignData.approvalRequired || campaignData.approverRole) &&
    (highRiskFlags.length === 0 || campaignData.testRun);

  const handleSendNow = () => {
    toast.success('Campaign sent successfully');
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved');
  };

  const handleDiscard = () => {
    if (confirm('Discard all changes?')) {
      navigate('/communications');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* STICKY HEADER (Glass Morphism) */}
      <header className="sticky top-0 z-10 bg-[#f9f9f9]/90 backdrop-blur-sm border-b border-slate-200/60 px-8 py-4 mb-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-slate-500 mb-1">
              <button 
                onClick={() => navigate('/communications')}
                className="mr-2 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/communications')}>Communications</span>
              <span className="mx-1">/</span>
              <span className="cursor-pointer hover:text-slate-700" onClick={() => navigate('/communications')}>Campaigns</span>
              <span className="mx-1">/</span>
              <span className="text-slate-900">Create Campaign</span>
            </div>
            
            {/* Title & Description */}
            <h1 className="text-2xl font-bold text-[#1d293d] tracking-tight">Create Campaign</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Send scheduled messages to segments related to events, conferences, or people
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleDiscard}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={16} className="mr-2" />
              Discard
            </Button>
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <FileText size={16} className="mr-2" />
              Save Draft
            </Button>
            <Button 
              className="bg-[#0f172b] hover:bg-[#0f172b]/90 text-white min-w-[120px] shadow-sm" 
              onClick={handleSendNow}
              disabled={!canSendNow}
            >
              <Send size={16} className="mr-2" />
              {campaignData.scheduleType === 'now' ? 'Send Now' : 'Schedule Campaign'}
            </Button>
          </div>
        </div>
      </header>

      {/* TWO-COLUMN LAYOUT */}
      <div className="max-w-[1600px] mx-auto px-8 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* SECTION 1: CAMPAIGN BASICS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Campaign Basics</h3>
              </div>

              <div className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Campaign Name <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Summit 2024 - Early Bird Reminder" 
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                    className="bg-white"
                  />
                </div>

                {/* Channel & Sender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Channel <span className="text-red-500">*</span></Label>
                    <Select 
                      value={campaignData.channel}
                      onValueChange={(val) => setCampaignData({...campaignData, channel: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="sms">
                          <div className="flex items-center gap-2">
                            <Smartphone size={14} />
                            SMS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Sender Identity <span className="text-red-500">*</span></Label>
                    <Select 
                      value={campaignData.sender}
                      onValueChange={(val) => setCampaignData({...campaignData, sender: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">NISAU Events Team</SelectItem>
                        <SelectItem value="awards">Awards Committee</SelectItem>
                        <SelectItem value="finance">Finance Dept</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CAMPAIGN INTENT & GOVERNANCE */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Campaign Intent & Governance</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-slate-100 transition-colors">
                        <Info size={14} className="text-slate-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">Defines how this campaign behaves across consent, priority, and delivery rules</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-4">
                {/* Campaign Intent - 7 Options */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Campaign Intent <span className="text-red-500">*</span></Label>
                  <Select 
                    value={campaignData.campaignIntent}
                    onValueChange={(val) => setCampaignData({...campaignData, campaignIntent: val})}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select campaign type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event-ops">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          Event Operations (Transactional)
                        </div>
                      </SelectItem>
                      <SelectItem value="awards-jury">
                        <div className="flex items-center gap-2">
                          <Shield size={14} />
                          Awards & Jury Communication
                        </div>
                      </SelectItem>
                      <SelectItem value="dialogues">
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          Achievers Dialogues
                        </div>
                      </SelectItem>
                      <SelectItem value="alumni">
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} />
                          Alumni Engagement
                        </div>
                      </SelectItem>
                      <SelectItem value="marketing">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          Marketing & Promotion
                        </div>
                      </SelectItem>
                      <SelectItem value="announcements">
                        <div className="flex items-center gap-2">
                          <Bell size={14} />
                          Announcements / Policy
                        </div>
                      </SelectItem>
                      <SelectItem value="emergency">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} />
                          Emergency / Critical Update
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Level - 3 Radio Options */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Priority Level <span className="text-red-500">*</span></Label>
                  <RadioGroup 
                    value={campaignData.priorityLevel} 
                    onValueChange={(val) => setCampaignData({...campaignData, priorityLevel: val})}
                    className="space-y-3"
                  >
                    {/* Normal */}
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="normal" id="priority-normal" />
                      <Label htmlFor="priority-normal" className="font-normal cursor-pointer flex-1">
                        <span className="font-medium text-slate-900">Normal</span>
                        <p className="text-xs text-slate-500">Standard delivery priority</p>
                      </Label>
                    </div>
                    
                    {/* High */}
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="high" id="priority-high" />
                      <Label htmlFor="priority-high" className="font-normal cursor-pointer flex-1">
                        <span className="font-medium text-slate-900">High</span>
                        <p className="text-xs text-slate-500">Elevated priority for time-sensitive content</p>
                      </Label>
                    </div>
                    
                    {/* Critical */}
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
                      <RadioGroupItem value="critical" id="priority-critical" />
                      <Label htmlFor="priority-critical" className="font-normal cursor-pointer flex-1">
                        <span className="font-medium text-orange-900 flex items-center gap-2">
                          Critical
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-0 text-xs">
                            <Zap size={10} className="mr-1" />
                            Override
                          </Badge>
                        </span>
                        <p className="text-xs text-orange-700">Emergency use only - bypasses quiet hours and deduplication</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Approval Required Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="text-slate-400" size={18} />
                    <div>
                      <p className="text-sm text-slate-700">Approval Required</p>
                      <p className="text-xs text-slate-500">Requires admin approval before sending</p>
                    </div>
                  </div>
                  <Switch 
                    checked={campaignData.approvalRequired}
                    onCheckedChange={(val) => setCampaignData({...campaignData, approvalRequired: val})}
                  />
                </div>

                {/* Conditional Approver Role */}
                {campaignData.approvalRequired && (
                  <div className="space-y-2 pl-9">
                    <Label className="text-slate-700">Approver Role</Label>
                    <Select 
                      value={campaignData.approverRole}
                      onValueChange={(val) => setCampaignData({...campaignData, approverRole: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select approver role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                        <SelectItem value="comms-admin">Communications Admin</SelectItem>
                        <SelectItem value="awards-committee">Awards Committee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: AUDIENCE & SEGMENTATION */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Audience & Segmentation</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Audience Source */}
                  <div className="space-y-2">
                    <Label className="text-slate-700">Audience Source</Label>
                    <Select 
                      value={campaignData.audienceSource}
                      onValueChange={(val) => setCampaignData({...campaignData, audienceSource: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All People</SelectItem>
                        <SelectItem value="event">By Event</SelectItem>
                        <SelectItem value="conference">By Conference</SelectItem>
                        <SelectItem value="award">By Award Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional Event Selection */}
                  {campaignData.audienceSource === 'event' && (
                    <div className="space-y-2">
                      <Label className="text-slate-700">Select Event</Label>
                      <Select defaultValue="evt-1">
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="evt-1">Global Tech Summit 2024</SelectItem>
                          <SelectItem value="evt-2">Annual Meetup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Segment Filters (Empty State) */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Segment Filters</Label>
                  <div className="min-h-[100px] border-2 border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-slate-400">No filter criteria added yet</p>
                    <Button variant="outline" size="sm" className="bg-white">
                      <Filter size={14} className="mr-2" />
                      Add Filter Criteria
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: AUDIENCE CONFLICT HANDLING */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Audience Conflict Handling</h3>
              </div>

              <div className="space-y-4">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Conflict Detection Notice</p>
                      <p className="text-blue-700">Some recipients may belong to multiple segments (e.g., Attendee + Alumni + Jury).</p>
                    </div>
                  </div>
                </div>

                {/* Deduplication Strategy */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Deduplication Strategy</Label>
                  <RadioGroup 
                    value={campaignData.deduplicationStrategy} 
                    onValueChange={(val) => setCampaignData({...campaignData, deduplicationStrategy: val})}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="once" id="dedupe-once" />
                      <Label htmlFor="dedupe-once" className="font-normal cursor-pointer flex-1">
                        <span className="font-medium text-slate-900 flex items-center gap-2">
                          Send once per recipient
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-0 text-xs">Recommended</Badge>
                        </span>
                        <p className="text-xs text-slate-500">Each person receives the email only once, regardless of segment matches</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <RadioGroupItem value="multiple" id="dedupe-multiple" />
                      <Label htmlFor="dedupe-multiple" className="font-normal cursor-pointer flex-1">
                        <span className="font-medium text-slate-900">Allow multiple sends if matched by different rules</span>
                        <p className="text-xs text-slate-500">Person may receive duplicate emails - use with caution</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Conflict Resolution Rule */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Conflict Resolution Rule</Label>
                  <Select 
                    value={campaignData.conflictResolutionRule}
                    onValueChange={(val) => setCampaignData({...campaignData, conflictResolutionRule: val})}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Highest Priority Campaign Wins</SelectItem>
                      <SelectItem value="event-override">Event-based campaigns override marketing</SelectItem>
                      <SelectItem value="jury-override">Jury communications override all others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION 5: CONTENT */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Content</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Subject Line <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Enter email subject..." 
                    value={campaignData.subject}
                    onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700">Message Body</Label>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:underline">
                      Insert Personalization Token
                    </Button>
                  </div>
                  <Textarea 
                    className="min-h-[200px] bg-white" 
                    placeholder="Type your message here..." 
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: PREVIEW & TESTING */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Preview & Testing</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Preview As</Label>
                    <Select 
                      value={campaignData.previewAs}
                      onValueChange={(val) => setCampaignData({...campaignData, previewAs: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select recipient type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendee">
                          <div className="flex items-center gap-2">
                            <UserCheck size={14} />
                            Sample Attendee
                          </div>
                        </SelectItem>
                        <SelectItem value="speaker">
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            Sample Speaker
                          </div>
                        </SelectItem>
                        <SelectItem value="jury">
                          <div className="flex items-center gap-2">
                            <Shield size={14} />
                            Sample Jury Member
                          </div>
                        </SelectItem>
                        <SelectItem value="alumni">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={14} />
                            Sample Alumni
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Test Recipient (Internal Only)</Label>
                    <Input 
                      type="email"
                      placeholder="your.email@internal.com"
                      value={campaignData.testEmail}
                      onChange={(e) => setCampaignData({...campaignData, testEmail: e.target.value})}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => console.log('Preview clicked')}
                    disabled={!campaignData.previewAs}
                  >
                    <Eye size={14} className="mr-2" />
                    Preview Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setCampaignData({...campaignData, testRun: true});
                      toast.success('Test email sent successfully');
                    }}
                    disabled={!campaignData.testEmail}
                  >
                    <Send size={14} className="mr-2" />
                    Send Test Email
                  </Button>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <Info size={12} className="shrink-0" />
                    Test emails use real data tokens but no tracking or unsubscribe links
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 7: SCHEDULING */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Scheduling</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Send Type</Label>
                    <Select 
                      value={campaignData.scheduleType} 
                      onValueChange={(val) => setCampaignData({...campaignData, scheduleType: val})}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Send Immediately</SelectItem>
                        <SelectItem value="schedule">Schedule for Later</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {campaignData.scheduleType !== 'now' && (
                    <div className="space-y-2">
                      <Label className="text-slate-700">Date & Time</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-white">
                          <Calendar size={16} className="mr-2" /> Jan 24, 2025
                        </Button>
                        <Button variant="outline" className="w-[100px] justify-start text-left font-normal bg-white">
                          <Clock size={16} className="mr-2" /> 09:00
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 8: DELIVERY SAFETY & TIME CONTROLS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Delivery Safety & Time Controls</h3>
              </div>

              <div className="space-y-4">
                {/* Respect Timezone Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="text-slate-400" size={18} />
                    <div>
                      <p className="text-sm text-slate-700">Respect Recipient Timezone</p>
                      <p className="text-xs text-slate-500">Deliver at appropriate local time</p>
                    </div>
                  </div>
                  <Switch 
                    checked={campaignData.respectTimezone}
                    onCheckedChange={(val) => setCampaignData({...campaignData, respectTimezone: val})}
                  />
                </div>

                <Separator />

                {/* Quiet Hours */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Quiet Hours</Label>
                  <p className="text-xs text-slate-500 mb-2">Messages will not be sent during these hours in recipient's local timezone</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Start Time</Label>
                      <Select 
                        value={campaignData.quietHoursStart}
                        onValueChange={(val) => setCampaignData({...campaignData, quietHoursStart: val})}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20:00">20:00 (8:00 PM)</SelectItem>
                          <SelectItem value="21:00">21:00 (9:00 PM)</SelectItem>
                          <SelectItem value="22:00">22:00 (10:00 PM)</SelectItem>
                          <SelectItem value="23:00">23:00 (11:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">End Time</Label>
                      <Select 
                        value={campaignData.quietHoursEnd}
                        onValueChange={(val) => setCampaignData({...campaignData, quietHoursEnd: val})}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">06:00 (6:00 AM)</SelectItem>
                          <SelectItem value="07:00">07:00 (7:00 AM)</SelectItem>
                          <SelectItem value="08:00">08:00 (8:00 AM)</SelectItem>
                          <SelectItem value="09:00">09:00 (9:00 AM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Override Quiet Hours (Orange Warning) */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-orange-600" size={18} />
                    <div>
                      <p className="text-sm text-orange-900 font-medium">Override Quiet Hours</p>
                      <p className="text-xs text-orange-700">Allowed only for Critical campaigns</p>
                    </div>
                  </div>
                  <Switch 
                    checked={campaignData.overrideQuietHours}
                    onCheckedChange={(val) => setCampaignData({...campaignData, overrideQuietHours: val})}
                    disabled={campaignData.priorityLevel !== 'critical'}
                  />
                </div>

                <Separator />

                {/* Max Sends Per Recipient */}
                <div className="space-y-2">
                  <Label className="text-slate-700">Maximum Sends Per Recipient</Label>
                  <Select 
                    value={campaignData.maxSendsPerRecipient}
                    onValueChange={(val) => setCampaignData({...campaignData, maxSendsPerRecipient: val})}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-limit">No limit</SelectItem>
                      <SelectItem value="1-per-day">1 per day</SelectItem>
                      <SelectItem value="1-per-7-days">1 per 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION 9: COMPLIANCE */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Compliance</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Unsubscribe Group</Label>
                    <Select defaultValue="marketing">
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing & Updates</SelectItem>
                        <SelectItem value="transactional">Transactional (No Unsub)</SelectItem>
                        <SelectItem value="events">Event Notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="text-slate-400" size={18} />
                    <div>
                      <p className="text-sm text-slate-700">Enforce GDPR Consent Check</p>
                      <p className="text-xs text-slate-500">Verify recipients have given consent</p>
                    </div>
                  </div>
                  <Switch 
                    checked={campaignData.gdpr}
                    onCheckedChange={(val) => setCampaignData({...campaignData, gdpr: val})}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 10: COMPLIANCE & SUPPRESSION RULES */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="text-green-600" size={20} />
                <h3 className="font-bold text-[#1d293d]">Compliance & Suppression Rules</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">Automatically applied suppression rules:</p>
                
                <div className="space-y-2">
                  {/* Rule 1 */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Check className="text-green-600 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-green-900 font-medium">Exclude bounced email addresses</p>
                      <p className="text-xs text-green-700">Hard bounces are automatically removed</p>
                    </div>
                  </div>

                  {/* Rule 2 */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Check className="text-green-600 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-green-900 font-medium">Exclude unverified email addresses</p>
                      <p className="text-xs text-green-700">Only verified emails receive campaigns</p>
                    </div>
                  </div>

                  {/* Rule 3 */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Check className="text-green-600 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-green-900 font-medium">Respect individual communication consent</p>
                      <p className="text-xs text-green-700">Per-person consent preferences honored</p>
                    </div>
                  </div>

                  {/* Rule 4 */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Check className="text-green-600 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-green-900 font-medium">Enforce unsubscribe group rules</p>
                      <p className="text-xs text-green-700">Respects category-specific unsubscribes</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Jury Override Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Shield className="text-slate-400" size={18} />
                    <div>
                      <p className="text-sm text-slate-700">Allow Jury Communications Despite Marketing Unsubscribe</p>
                      <p className="text-xs text-slate-500">Applicable only for Awards & Jury campaigns</p>
                    </div>
                  </div>
                  <Switch 
                    checked={campaignData.allowJuryOverride}
                    onCheckedChange={(val) => setCampaignData({...campaignData, allowJuryOverride: val})}
                    disabled={campaignData.campaignIntent !== 'awards-jury'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            
            {/* PANEL 1: STATUS & READINESS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Status & Readiness</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0">
                    Draft
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Readiness Checklist</p>
                  
                  {/* 1. Campaign Name */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      {campaignData.name ? (
                        <Check className="text-green-600" size={14} />
                      ) : (
                        <AlertCircle className="text-orange-600" size={14} />
                      )}
                      <span className="text-sm text-slate-700">Campaign Name</span>
                    </div>
                    {campaignData.name && <CheckCircle2 className="text-green-600" size={14} />}
                  </div>

                  {/* 2. Subject Line */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      {campaignData.subject ? (
                        <Check className="text-green-600" size={14} />
                      ) : (
                        <AlertCircle className="text-orange-600" size={14} />
                      )}
                      <span className="text-sm text-slate-700">Subject Line</span>
                    </div>
                    {campaignData.subject && <CheckCircle2 className="text-green-600" size={14} />}
                  </div>

                  {/* 3. Audience Selected (Always Complete) */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Check className="text-green-600" size={14} />
                      <span className="text-sm text-slate-700">Audience Selected</span>
                    </div>
                    <CheckCircle2 className="text-green-600" size={14} />
                  </div>

                  {/* 4. Campaign Intent */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      {campaignData.campaignIntent ? (
                        <Check className="text-green-600" size={14} />
                      ) : (
                        <AlertCircle className="text-orange-600" size={14} />
                      )}
                      <span className="text-sm text-slate-700">Campaign Intent</span>
                    </div>
                    {campaignData.campaignIntent && <CheckCircle2 className="text-green-600" size={14} />}
                  </div>

                  {/* 5. Test Email Sent */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2">
                      {campaignData.testRun ? (
                        <Check className="text-green-600" size={14} />
                      ) : (
                        <AlertCircle className="text-orange-600" size={14} />
                      )}
                      <span className="text-sm text-slate-700">Test Email Sent</span>
                    </div>
                    {campaignData.testRun && <CheckCircle2 className="text-green-600" size={14} />}
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: ESTIMATED REACH */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-slate-400" size={20} />
                <h3 className="font-bold text-[#1d293d]">Estimated Reach</h3>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <span className="text-3xl font-bold text-[#1d293d]">1,250</span>
                <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">Recipients</span>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 text-center">
                Audience calculated based on current filters
              </div>
            </div>

            {/* PANEL 3: CAMPAIGN RISK SUMMARY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-orange-600" size={20} />
                <h3 className="font-bold text-[#1d293d]">Campaign Risk Summary</h3>
              </div>

              <div className="space-y-4">
                {/* Metadata */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created By</span>
                    <span className="text-slate-900">Admin User</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Edited By</span>
                    <span className="text-slate-900">Admin User</span>
                  </div>
                </div>

                <Separator />

                {/* Campaign Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Campaign Intent</span>
                    <Badge variant="outline" className="text-xs">
                      {campaignData.campaignIntent || 'Not set'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Approval Status</span>
                    <Badge 
                      variant="outline" 
                      className={campaignData.approvalRequired 
                        ? "bg-orange-50 text-orange-700 border-0" 
                        : "bg-slate-100 text-slate-600 border-0"
                      }
                    >
                      {campaignData.approvalRequired ? 'Required' : 'Not Required'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Est. Recipients</span>
                    <span className="text-slate-900 font-medium">1,250</span>
                  </div>
                </div>

                {/* High-Risk Flags */}
                {(highRiskFlags.length > 0 || campaignData.overrideQuietHours) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">High-Risk Flags</p>
                      
                      {highRiskFlags.includes('multiple-role-overlap') && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                          <AlertTriangle className="text-orange-600 shrink-0" size={12} />
                          <span className="text-xs text-orange-700">Multiple role overlap</span>
                        </div>
                      )}
                      
                      {highRiskFlags.includes('jury-confidentiality') && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                          <AlertTriangle className="text-orange-600 shrink-0" size={12} />
                          <span className="text-xs text-orange-700">Jury confidentiality</span>
                        </div>
                      )}
                      
                      {campaignData.overrideQuietHours && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                          <AlertTriangle className="text-orange-600 shrink-0" size={12} />
                          <span className="text-xs text-orange-700">Quiet hours overridden</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-600 hover:underline w-full justify-start">
                  <Activity size={12} className="mr-1" />
                  View Campaign Activity Log
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
