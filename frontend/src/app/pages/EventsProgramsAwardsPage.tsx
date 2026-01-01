import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Award, Users, Settings, Shield, FileText, Image, Mail,
  Activity, Network, Save, RefreshCw, Info, AlertTriangle, Plus, Edit,
  Copy, Lock, Unlock, ChevronDown, ChevronRight, CheckCircle2, AlertCircle,
  XCircle, Eye, EyeOff, UserCheck, Ticket, Mic, DollarSign, Clock,
  Globe, CheckSquare, Target, Layers, Trophy, Gavel, MessageSquare,
  Upload, Download, ExternalLink, ShieldCheck, Database
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

interface EventType {
  id: string;
  name: string;
  category: 'event' | 'program' | 'award';
  visibility: 'public' | 'private' | 'invite-only';
  supportsRegistration: boolean;
  supportsTickets: boolean;
  supportsJury: boolean;
  supportsSpeakers: boolean;
  supportsSponsors: boolean;
  defaultStatus: 'draft' | 'active' | 'archived';
  isLocked: boolean;
  activeCount: number;
}

interface AwardCategory {
  id: string;
  name: string;
  subcategories: string[];
  nominationType: 'open' | 'invited' | 'internal';
  visibility: 'public' | 'jury-only' | 'admin-only';
}

export const EventsProgramsAwardsPage = () => {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddEventType, setShowAddEventType] = useState(false);
  const [showAddAwardCategory, setShowAddAwardCategory] = useState(false);

  const [settings, setSettings] = useState({
    // Global Event Defaults
    defaultEventStatus: 'draft',
    defaultTimezone: 'Europe/London',
    defaultCurrency: 'GBP',
    defaultLanguage: 'en',
    defaultRegistrationMode: 'open',
    defaultCapacityBehavior: 'waitlist',
    defaultEventPrivacy: 'public',
    autoGenerateRegistrationForm: true,
    autoCreateEmailTemplates: true,
    autoCreateReminders: true,
    autoGenerateCertificates: false,

    // Registration & Attendee Rules
    lateRegistrationAllowed: true,
    approvalWorkflow: 'none',
    maxRegistrationsPerPerson: 5,
    allowMultiplePerEvent: false,
    duplicateDetectionMethod: 'email',
    autoMergeDuplicates: true,
    allowRoleOverlap: true,

    // Program Structure
    programCanContainEvents: true,
    programCanContainAwards: true,
    programCanContainDialogues: true,
    enableMultiYear: true,
    sharedPeoplePool: true,
    sharedJuryPool: true,
    sharedBranding: true,
    sharedCommunicationRules: false,

    // Awards & Jury
    nominationLimitPerPerson: 3,
    blockSelfNomination: true,
    blockSameOrgReview: true,
    scoreType: 'weighted',
    scoreVisibility: 'private-until-final',
    autoCalculateFinalScore: true,

    // Speakers & VIPs
    speakerApprovalRequired: true,
    speakerProfileVisibility: 'website',
    speakerDocumentUploads: true,
    speakerTravelTracking: false,

    // Media & Assets
    allowedFileTypes: 'pdf,doc,docx,jpg,png',
    maxUploadSizeMB: 10,
    mediaApprovalRequired: false,
    autoPublishGallery: false,
    autoIssueCertificates: true,
    certificateDelivery: 'email',

    // Communication
    reminderSchedule: 'standard',
    postEventFollowups: true,
    juryEmailsNoMarketing: true,
    awardEmailsOverrideUnsubscribe: true,
    emergencyNotificationsAllowed: true,

    // Compliance
    gdprConsentRequired: true,
    dataRetentionPolicy: '7-years',
    auditLogsEnabled: true,
    changeHistoryEnabled: true
  });

  const [eventTypes] = useState<EventType[]>([
    {
      id: 'ET001',
      name: 'Conference',
      category: 'event',
      visibility: 'public',
      supportsRegistration: true,
      supportsTickets: true,
      supportsJury: false,
      supportsSpeakers: true,
      supportsSponsors: true,
      defaultStatus: 'draft',
      isLocked: true,
      activeCount: 3
    },
    {
      id: 'ET002',
      name: 'Award Ceremony',
      category: 'award',
      visibility: 'public',
      supportsRegistration: true,
      supportsTickets: false,
      supportsJury: true,
      supportsSpeakers: false,
      supportsSponsors: true,
      defaultStatus: 'draft',
      isLocked: true,
      activeCount: 2
    },
    {
      id: 'ET003',
      name: 'Dialogue Session',
      category: 'event',
      visibility: 'invite-only',
      supportsRegistration: true,
      supportsTickets: false,
      supportsJury: false,
      supportsSpeakers: true,
      supportsSponsors: false,
      defaultStatus: 'draft',
      isLocked: false,
      activeCount: 0
    },
    {
      id: 'ET004',
      name: 'Workshop',
      category: 'event',
      visibility: 'public',
      supportsRegistration: true,
      supportsTickets: true,
      supportsJury: false,
      supportsSpeakers: true,
      supportsSponsors: false,
      defaultStatus: 'draft',
      isLocked: false,
      activeCount: 1
    }
  ]);

  const [awardCategories] = useState<AwardCategory[]>([
    {
      id: 'AC001',
      name: 'Student Excellence Awards',
      subcategories: ['Academic Achievement', 'Research Innovation', 'Community Service'],
      nominationType: 'open',
      visibility: 'public'
    },
    {
      id: 'AC002',
      name: 'Alumni Leadership Awards',
      subcategories: ['Industry Leadership', 'Social Impact', 'Entrepreneurship'],
      nominationType: 'invited',
      visibility: 'jury-only'
    }
  ]);

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Events, Programs & Awards settings saved successfully');
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    toast.info('Unsaved changes discarded');
    setHasChanges(false);
  };

  const getOverallStatus = () => {
    const configuredCount = eventTypes.length;
    if (configuredCount >= 3 && settings.gdprConsentRequired) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 size={12} className="mr-1" />Configured</Badge>;
    }
    return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><AlertCircle size={12} className="mr-1" />Partial</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Events, Programs & Awards</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-slate-900">
                  Events, Programs & Awards
                </h1>
                {getOverallStatus()}
              </div>
              <p className="text-sm text-slate-500">
                Event governance, program structure, award categories, and workflow engine configuration
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw size={16} />
                  Reset
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Section 1: Event & Program Types */}
          <SectionCard
            icon={Calendar}
            title="Event & Program Types"
            description="Define reusable system-level event and program templates (foundation layer)"
            status={eventTypes.length >= 3 ? 'configured' : 'not-set'}
            badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Foundation</Badge>}
            action={
              <Button onClick={() => setShowAddEventType(true)} variant="outline" size="sm" className="gap-2">
                <Plus size={14} />
                Create New Type
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Type Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Visibility</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Features</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {eventTypes.map((type) => (
                      <EventTypeRow key={type.id} type={type} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy size={14} />
                  Clone Type
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Lock size={14} />
                  Lock Type
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Global Event Defaults */}
          <SectionCard
            icon={Settings}
            title="Global Event Defaults"
            description="Auto-applied settings for all new events and programs"
            status="configured"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Default Event Status">
                  <Select value={settings.defaultEventStatus} onValueChange={(val) => handleSettingChange('defaultEventStatus', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Default Timezone">
                  <Select value={settings.defaultTimezone} onValueChange={(val) => handleSettingChange('defaultTimezone', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Default Currency">
                  <Select value={settings.defaultCurrency} onValueChange={(val) => handleSettingChange('defaultCurrency', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Default Language">
                  <Select value={settings.defaultLanguage} onValueChange={(val) => handleSettingChange('defaultLanguage', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Registration & Capacity Defaults</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Registration Mode">
                    <Select value={settings.defaultRegistrationMode} onValueChange={(val) => handleSettingChange('defaultRegistrationMode', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="approval">Approval Required</SelectItem>
                        <SelectItem value="invite-only">Invite-Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Capacity Behavior">
                    <Select value={settings.defaultCapacityBehavior} onValueChange={(val) => handleSettingChange('defaultCapacityBehavior', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hard-limit">Hard Limit</SelectItem>
                        <SelectItem value="waitlist">Waitlist Enabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Event Privacy">
                    <Select value={settings.defaultEventPrivacy} onValueChange={(val) => handleSettingChange('defaultEventPrivacy', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="invite-only">Invite-Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Auto-Generation Settings</h3>
                <SwitchSetting
                  label="Auto-Generate Registration Form"
                  description="Create default registration form on event creation"
                  checked={settings.autoGenerateRegistrationForm}
                  onCheckedChange={(val) => handleSettingChange('autoGenerateRegistrationForm', val)}
                />
                <SwitchSetting
                  label="Auto-Create Email Templates"
                  description="Generate confirmation & reminder templates"
                  checked={settings.autoCreateEmailTemplates}
                  onCheckedChange={(val) => handleSettingChange('autoCreateEmailTemplates', val)}
                />
                <SwitchSetting
                  label="Auto-Create Reminders"
                  description="Set up standard reminder schedule"
                  checked={settings.autoCreateReminders}
                  onCheckedChange={(val) => handleSettingChange('autoCreateReminders', val)}
                />
                <SwitchSetting
                  label="Auto-Generate Certificates"
                  description="Create certificates for attendees"
                  checked={settings.autoGenerateCertificates}
                  onCheckedChange={(val) => handleSettingChange('autoGenerateCertificates', val)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Registration & Attendee Rules */}
          <SectionCard
            icon={Users}
            title="Registration & Attendee Rules"
            description="Control registration behavior, approvals, duplicates, and role management"
            status="configured"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <SwitchSetting
                  label="Allow Late Registration"
                  description="People can register after the registration deadline"
                  checked={settings.lateRegistrationAllowed}
                  onCheckedChange={(val) => handleSettingChange('lateRegistrationAllowed', val)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Approval & Limits</h3>
                
                <FormField label="Approval Workflow">
                  <Select value={settings.approvalWorkflow} onValueChange={(val) => handleSettingChange('approvalWorkflow', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Auto-Approve)</SelectItem>
                      <SelectItem value="single">Single Approver</SelectItem>
                      <SelectItem value="multi">Multi-Stage Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Max Registrations Per Person" helper="Limit simultaneous active registrations per person">
                  <Input
                    type="number"
                    value={settings.maxRegistrationsPerPerson}
                    onChange={(e) => handleSettingChange('maxRegistrationsPerPerson', parseInt(e.target.value))}
                  />
                </FormField>

                <SwitchSetting
                  label="Allow Multiple Registrations Per Event"
                  description="Same person can register multiple times (e.g., different ticket types)"
                  checked={settings.allowMultiplePerEvent}
                  onCheckedChange={(val) => handleSettingChange('allowMultiplePerEvent', val)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Duplicate Detection</h3>
                
                <FormField label="Detection Method">
                  <Select value={settings.duplicateDetectionMethod} onValueChange={(val) => handleSettingChange('duplicateDetectionMethod', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Address</SelectItem>
                      <SelectItem value="phone">Phone Number</SelectItem>
                      <SelectItem value="both">Email OR Phone</SelectItem>
                      <SelectItem value="name-email">Name + Email</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <SwitchSetting
                  label="Auto-Merge Duplicates"
                  description="Automatically merge duplicate registrations"
                  checked={settings.autoMergeDuplicates}
                  onCheckedChange={(val) => handleSettingChange('autoMergeDuplicates', val)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Role Management</h3>
                <SwitchSetting
                  label="Allow Role Overlap"
                  description="Same person can be Attendee + Speaker + Jury in one event"
                  checked={settings.allowRoleOverlap}
                  onCheckedChange={(val) => handleSettingChange('allowRoleOverlap', val)}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-900">
                    <strong>Registration Architecture:</strong> These settings control the foundation of your registration system. 
                    Changes affect event registration forms, capacity management, and attendee workflows.
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Section 4: Program Structure */}
          <SectionCard
            icon={Layers}
            title="Program Structure"
            description="Define how multi-event programs work and what they can contain"
            status="configured"
            badge={<Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">Advanced</Badge>}
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Program Containment Rules</h3>
                <SwitchSetting
                  label="Programs Can Contain Events"
                  description="Multi-event programs (e.g., Conference Series)"
                  checked={settings.programCanContainEvents}
                  onCheckedChange={(val) => handleSettingChange('programCanContainEvents', val)}
                />
                <SwitchSetting
                  label="Programs Can Contain Awards"
                  description="Awards can be part of larger program"
                  checked={settings.programCanContainAwards}
                  onCheckedChange={(val) => handleSettingChange('programCanContainAwards', val)}
                />
                <SwitchSetting
                  label="Programs Can Contain Dialogues"
                  description="Private dialogue sessions within programs"
                  checked={settings.programCanContainDialogues}
                  onCheckedChange={(val) => handleSettingChange('programCanContainDialogues', val)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Program Features</h3>
                <SwitchSetting
                  label="Enable Multi-Year Programs"
                  description="Programs can span multiple calendar years"
                  checked={settings.enableMultiYear}
                  onCheckedChange={(val) => handleSettingChange('enableMultiYear', val)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Shared Resources</h3>
                <p className="text-xs text-slate-500">Resources shared across all events in a program</p>
                <SwitchSetting
                  label="Shared People Pool"
                  description="Speakers, jury, volunteers shared across program events"
                  checked={settings.sharedPeoplePool}
                  onCheckedChange={(val) => handleSettingChange('sharedPeoplePool', val)}
                />
                <SwitchSetting
                  label="Shared Jury Pool"
                  description="Jury members can evaluate across all program awards"
                  checked={settings.sharedJuryPool}
                  onCheckedChange={(val) => handleSettingChange('sharedJuryPool', val)}
                />
                <SwitchSetting
                  label="Shared Branding"
                  description="Logos, colors, templates applied to all program events"
                  checked={settings.sharedBranding}
                  onCheckedChange={(val) => handleSettingChange('sharedBranding', val)}
                />
                <SwitchSetting
                  label="Shared Communication Rules"
                  description="Consent and unsubscribe rules unified across program"
                  checked={settings.sharedCommunicationRules}
                  onCheckedChange={(val) => handleSettingChange('sharedCommunicationRules', val)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 5: Award Categories & Jury */}
          <SectionCard
            icon={Award}
            title="Award Categories & Jury Rules"
            description="Define award structures, nomination rules, and scoring methodology"
            status="configured"
            action={
              <Button onClick={() => setShowAddAwardCategory(true)} variant="outline" size="sm" className="gap-2">
                <Plus size={14} />
                Add Category
              </Button>
            }
          >
            <div className="space-y-6">
              {/* Award Categories Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Category Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Subcategories</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Nomination Type</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Visibility</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {awardCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Trophy size={14} className="text-amber-600" />
                            <span className="font-medium text-slate-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {category.subcategories.map((sub, idx) => (
                              <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            category.nominationType === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                            category.nominationType === 'invited' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }>
                            {category.nominationType.charAt(0).toUpperCase() + category.nominationType.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            category.visibility === 'public' ? 'bg-green-50 text-green-700 border-green-200' :
                            category.visibility === 'jury-only' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }>
                            {category.visibility === 'jury-only' ? 'Jury-Only' :
                             category.visibility === 'admin-only' ? 'Admin-Only' :
                             'Public'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8">
                            <Edit size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Nomination Rules */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Nomination Rules</h3>
                
                <FormField label="Nomination Limit Per Person" helper="Maximum nominations one person can submit">
                  <Input
                    type="number"
                    value={settings.nominationLimitPerPerson}
                    onChange={(e) => handleSettingChange('nominationLimitPerPerson', parseInt(e.target.value))}
                  />
                </FormField>

                <SwitchSetting
                  label="Block Self-Nomination"
                  description="People cannot nominate themselves"
                  checked={settings.blockSelfNomination}
                  onCheckedChange={(val) => handleSettingChange('blockSelfNomination', val)}
                  badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
                />

                <SwitchSetting
                  label="Block Same-Organization Review"
                  description="Jury cannot review nominees from their organization"
                  checked={settings.blockSameOrgReview}
                  onCheckedChange={(val) => handleSettingChange('blockSameOrgReview', val)}
                  badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
                />
              </div>

              <Separator />

              {/* Scoring Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Scoring Configuration</h3>
                
                <FormField label="Score Type">
                  <Select value={settings.scoreType} onValueChange={(val) => handleSettingChange('scoreType', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple Average</SelectItem>
                      <SelectItem value="weighted">Weighted Average</SelectItem>
                      <SelectItem value="median">Median Score</SelectItem>
                      <SelectItem value="rubric">Rubric-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Score Visibility">
                  <Select value={settings.scoreVisibility} onValueChange={(val) => handleSettingChange('scoreVisibility', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (Admin Only)</SelectItem>
                      <SelectItem value="private-until-final">Private Until Final</SelectItem>
                      <SelectItem value="jury-visible">Visible to All Jury</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <SwitchSetting
                  label="Auto-Calculate Final Score"
                  description="Automatically compute final scores when all jury submit"
                  checked={settings.autoCalculateFinalScore}
                  onCheckedChange={(val) => handleSettingChange('autoCalculateFinalScore', val)}
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-900">
                    <strong>Jury Integrity:</strong> Block self-nomination and same-organization reviews are critical for maintaining 
                    award credibility and avoiding conflicts of interest.
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Section 6: Speakers & VIP Management */}
          <SectionCard
            icon={Mic}
            title="Speakers & VIP Management"
            description="Speaker approval workflows, profile visibility, and travel tracking"
            status="configured"
          >
            <div className="space-y-4">
              <SwitchSetting
                label="Speaker Approval Required"
                description="Speakers must be approved before appearing on event pages"
                checked={settings.speakerApprovalRequired}
                onCheckedChange={(val) => handleSettingChange('speakerApprovalRequired', val)}
              />

              <FormField label="Speaker Profile Visibility">
                <Select value={settings.speakerProfileVisibility} onValueChange={(val) => handleSettingChange('speakerProfileVisibility', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Public Website</SelectItem>
                    <SelectItem value="attendees-only">Attendees Only</SelectItem>
                    <SelectItem value="private">Private (Admin Only)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <SwitchSetting
                label="Enable Speaker Document Uploads"
                description="Speakers can upload presentations, bios, headshots"
                checked={settings.speakerDocumentUploads}
                onCheckedChange={(val) => handleSettingChange('speakerDocumentUploads', val)}
              />

              <SwitchSetting
                label="Enable Travel Tracking"
                description="Track speaker travel arrangements and reimbursements"
                checked={settings.speakerTravelTracking}
                onCheckedChange={(val) => handleSettingChange('speakerTravelTracking', val)}
              />
            </div>
          </SectionCard>

          {/* Section 7: Media & Assets */}
          <SectionCard
            icon={Image}
            title="Media & Assets"
            description="File uploads, media galleries, and certificate generation"
            status="configured"
          >
            <div className="space-y-4">
              <FormField label="Allowed File Types" helper="Comma-separated file extensions">
                <Input
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                  placeholder="pdf,doc,docx,jpg,png"
                />
              </FormField>

              <FormField label="Max Upload Size (MB)">
                <Input
                  type="number"
                  value={settings.maxUploadSizeMB}
                  onChange={(e) => handleSettingChange('maxUploadSizeMB', parseInt(e.target.value))}
                />
              </FormField>

              <SwitchSetting
                label="Media Approval Required"
                description="Admin must approve media before it appears in galleries"
                checked={settings.mediaApprovalRequired}
                onCheckedChange={(val) => handleSettingChange('mediaApprovalRequired', val)}
              />

              <SwitchSetting
                label="Auto-Publish Event Gallery"
                description="Event photos automatically published post-event"
                checked={settings.autoPublishGallery}
                onCheckedChange={(val) => handleSettingChange('autoPublishGallery', val)}
              />

              <Separator />

              <h3 className="text-sm font-semibold text-slate-900">Certificate Settings</h3>

              <SwitchSetting
                label="Auto-Issue Certificates"
                description="Automatically generate certificates for attendees post-event"
                checked={settings.autoIssueCertificates}
                onCheckedChange={(val) => handleSettingChange('autoIssueCertificates', val)}
              />

              <FormField label="Certificate Delivery">
                <Select value={settings.certificateDelivery} onValueChange={(val) => handleSettingChange('certificateDelivery', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="download">Download Link</SelectItem>
                    <SelectItem value="both">Email + Download</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </SectionCard>

          {/* Section 8: Communication Rules */}
          <SectionCard
            icon={Mail}
            title="Communication Rules"
            description="Email reminders, follow-ups, and notification policies"
            status="configured"
          >
            <div className="space-y-4">
              <FormField label="Reminder Schedule">
                <Select value={settings.reminderSchedule} onValueChange={(val) => handleSettingChange('reminderSchedule', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (1 week, 1 day before)</SelectItem>
                    <SelectItem value="aggressive">Aggressive (2 weeks, 1 week, 1 day before)</SelectItem>
                    <SelectItem value="minimal">Minimal (1 day before only)</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <SwitchSetting
                label="Send Post-Event Follow-Ups"
                description="Automatic thank you and survey emails after event"
                checked={settings.postEventFollowups}
                onCheckedChange={(val) => handleSettingChange('postEventFollowups', val)}
              />

              <SwitchSetting
                label="Jury Emails Exclude Marketing"
                description="Jury members only receive award-related emails, no campaigns"
                checked={settings.juryEmailsNoMarketing}
                onCheckedChange={(val) => handleSettingChange('juryEmailsNoMarketing', val)}
              />

              <SwitchSetting
                label="Award Emails Override Unsubscribe"
                description="Critical award notifications sent even if user unsubscribed from marketing"
                checked={settings.awardEmailsOverrideUnsubscribe}
                onCheckedChange={(val) => handleSettingChange('awardEmailsOverrideUnsubscribe', val)}
              />

              <SwitchSetting
                label="Allow Emergency Notifications"
                description="Send urgent notifications for last-minute event changes"
                checked={settings.emergencyNotificationsAllowed}
                onCheckedChange={(val) => handleSettingChange('emergencyNotificationsAllowed', val)}
              />
            </div>
          </SectionCard>

          {/* Section 9: Compliance & Data Governance */}
          <SectionCard
            icon={Shield}
            title="Compliance & Data Governance"
            description="GDPR compliance, data retention, audit logs, and change tracking"
            status="configured"
          >
            <div className="space-y-4">
              <SwitchSetting
                label="GDPR Consent Required"
                description="Explicit consent required for data processing"
                checked={settings.gdprConsentRequired}
                onCheckedChange={(val) => handleSettingChange('gdprConsentRequired', val)}
                badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
              />

              <FormField label="Data Retention Policy">
                <Select value={settings.dataRetentionPolicy} onValueChange={(val) => handleSettingChange('dataRetentionPolicy', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-years">3 Years</SelectItem>
                    <SelectItem value="5-years">5 Years</SelectItem>
                    <SelectItem value="7-years">7 Years (Recommended)</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <SwitchSetting
                label="Enable Audit Logs"
                description="Track all changes to events, registrations, and awards"
                checked={settings.auditLogsEnabled}
                onCheckedChange={(val) => handleSettingChange('auditLogsEnabled', val)}
              />

              <SwitchSetting
                label="Enable Change History"
                description="Maintain version history for all event data"
                checked={settings.changeHistoryEnabled}
                onCheckedChange={(val) => handleSettingChange('changeHistoryEnabled', val)}
              />

              <Separator />

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Dependency Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Events</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Programs</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Active Awards</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">2</Badge>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Dialogs */}
      <AddEventTypeDialog open={showAddEventType} onOpenChange={setShowAddEventType} />
      <AddAwardCategoryDialog open={showAddAwardCategory} onOpenChange={setShowAddAwardCategory} />
    </div>
  );
};

// ==================== EVENT TYPE ROW COMPONENT ====================

const EventTypeRow = ({ type }: { type: EventType }) => {
  const getCategoryBadge = (category: string) => {
    const configs = {
      event: 'bg-blue-50 text-blue-700 border-blue-200',
      award: 'bg-purple-50 text-purple-700 border-purple-200',
      program: 'bg-green-50 text-green-700 border-green-200'
    };
    return configs[category as keyof typeof configs];
  };

  const getVisibilityBadge = (visibility: string) => {
    const configs = {
      public: 'bg-green-50 text-green-700 border-green-200',
      private: 'bg-red-50 text-red-700 border-red-200',
      'invite-only': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return configs[visibility as keyof typeof configs];
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{type.name}</span>
          {type.isLocked && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Lock size={14} className="text-purple-600" />
                </TooltipTrigger>
                <TooltipContent>System Type (Locked)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={getCategoryBadge(type.category)}>
          {type.category.charAt(0).toUpperCase() + type.category.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={getVisibilityBadge(type.visibility)}>
          {type.visibility === 'invite-only' ? 'Invite-Only' : type.visibility.charAt(0).toUpperCase() + type.visibility.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {type.supportsRegistration && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                    <UserCheck size={12} className="text-green-700" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Registration</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {type.supportsTickets && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                    <Ticket size={12} className="text-blue-700" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Ticketing</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {type.supportsJury && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                    <Gavel size={12} className="text-purple-700" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Jury System</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {type.supportsSpeakers && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                    <Mic size={12} className="text-orange-700" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Speakers</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {type.supportsSponsors && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center">
                    <DollarSign size={12} className="text-amber-700" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Sponsors</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {type.activeCount > 0 ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            {type.activeCount} Active
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
            None
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Edit size={14} />
          </Button>
          {!type.isLocked && (
            <Button variant="ghost" size="sm" className="h-8 text-red-600">
              <XCircle size={14} />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ==================== HELPER COMPONENTS ====================

const SectionCard = ({ icon: Icon, title, description, status, badge, action, children }: any) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'configured':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs"><CheckCircle2 size={10} className="mr-1" />Configured</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs"><AlertCircle size={10} className="mr-1" />Partial</Badge>;
      case 'not-set':
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs"><XCircle size={10} className="mr-1" />Not Set</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Icon size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                {badge}
                {status && getStatusBadge()}
              </div>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

const FormField = ({ label, helper, children }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
};

const SwitchSetting = ({ label, description, checked, onCheckedChange, badge }: any) => {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <label className="text-sm font-medium text-slate-900">{label}</label>
          {badge}
        </div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

// ==================== DIALOGS ====================

const AddEventTypeDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Event Type</DialogTitle>
          <DialogDescription>
            Define a new reusable event or program template
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type Name *</Label>
            <Input placeholder="e.g., Webinar" />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select defaultValue="event">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="program">Program</SelectItem>
                <SelectItem value="award">Award</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visibility *</Label>
            <Select defaultValue="public">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="invite-only">Invite-Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supported Features</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="registration" defaultChecked />
                <label htmlFor="registration" className="text-sm">Registration</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="tickets" />
                <label htmlFor="tickets" className="text-sm">Ticketing</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="speakers" />
                <label htmlFor="speakers" className="text-sm">Speakers</label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Event type created successfully');
            onOpenChange(false);
          }}>
            Create Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddAwardCategoryDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Award Category</DialogTitle>
          <DialogDescription>
            Create a new award category with subcategories
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category Name *</Label>
            <Input placeholder="e.g., Faculty Excellence Awards" />
          </div>

          <div className="space-y-2">
            <Label>Subcategories</Label>
            <Input placeholder="Comma-separated (e.g., Teaching, Research, Service)" />
          </div>

          <div className="space-y-2">
            <Label>Nomination Type *</Label>
            <Select defaultValue="open">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visibility *</Label>
            <Select defaultValue="public">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="jury-only">Jury-Only</SelectItem>
                <SelectItem value="admin-only">Admin-Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Award category added successfully');
            onOpenChange(false);
          }}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
