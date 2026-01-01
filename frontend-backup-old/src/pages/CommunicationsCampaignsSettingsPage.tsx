import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Send, Users, Settings, Zap, Target, Clock, CheckSquare, BarChart3,
  ShieldAlert, Activity, Save, RefreshCw, Info, AlertTriangle, Plus, Edit,
  Eye, Play, Pause, CheckCircle2, AlertCircle, XCircle, Globe, Lock, Unlock,
  Download, Filter, Search, MoreVertical, FileText, Smartphone, MessageSquare,
  ExternalLink, User, Calendar, TrendingUp, ShieldCheck, Database, Power,
  Trash2, Copy, ChevronRight, Layers
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

type SectionType = 'overview' | 'templates' | 'senders' | 'campaign-defaults' | 'automation' | 'audience' | 'delivery' | 'approval' | 'analytics' | 'compliance' | 'logs';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'transactional' | 'campaign' | 'system';
  linkedEvents: string[];
  language: string;
  status: 'draft' | 'active' | 'archived';
  lastEdited: string;
}

interface SenderIdentity {
  id: string;
  displayName: string;
  email: string;
  replyTo: string;
  linkedBrand: string;
  status: 'verified' | 'pending' | 'failed';
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  scope: 'global' | 'event' | 'program';
  status: 'active' | 'paused';
}

interface AudienceSegment {
  id: string;
  name: string;
  criteria: string;
  count: number;
  lastUpdated: string;
}

export const CommunicationsCampaignsSettingsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);

  const [settings, setSettings] = useState({
    // Global
    globalKillSwitch: false,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,

    // Campaign Defaults
    defaultSenderIdentity: 'primary',
    defaultReplyTo: 'noreply@nisau.org',
    defaultTimezone: 'Europe/London',
    defaultLanguage: 'en',
    autoAppendFooter: true,
    autoAppendUnsubscribe: true,

    // Delivery Rules
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    dailySendLimit: 50,
    campaignThrottling: true,

    // Approval
    approvalRequired: true,
    approvalLevel: 'single',
    autoApproveSystem: true,
    approvalSLA: 24,

    // Compliance
    gdprConsentRequired: true,
    autoSuppressOnBounce: true,
    proofOfConsentStorage: true
  });

  const [templates] = useState<EmailTemplate[]>([
    { id: 'T001', name: 'Event Registration Confirmation', type: 'transactional', linkedEvents: ['Conference 2024'], language: 'en', status: 'active', lastEdited: '2024-12-15' },
    { id: 'T002', name: 'Award Nomination Received', type: 'transactional', linkedEvents: ['Alumni Awards 2024'], language: 'en', status: 'active', lastEdited: '2024-12-10' },
    { id: 'T003', name: 'Monthly Newsletter', type: 'campaign', linkedEvents: [], language: 'en', status: 'active', lastEdited: '2024-12-01' },
    { id: 'T004', name: 'Event Reminder - 24h', type: 'system', linkedEvents: ['All Events'], language: 'en', status: 'active', lastEdited: '2024-11-28' }
  ]);

  const [senders] = useState<SenderIdentity[]>([
    { id: 'S001', displayName: 'NISAU Events', email: 'events@nisau.org', replyTo: 'support@nisau.org', linkedBrand: 'Events', status: 'verified' },
    { id: 'S002', displayName: 'NISAU Awards', email: 'awards@nisau.org', replyTo: 'support@nisau.org', linkedBrand: 'Awards', status: 'verified' },
    { id: 'S003', displayName: 'NISAU Communications', email: 'hello@nisau.org', replyTo: 'hello@nisau.org', linkedBrand: 'General', status: 'pending' }
  ]);

  const [automationRules] = useState<AutomationRule[]>([
    { id: 'R001', name: 'Registration Confirmation', trigger: 'Registration completed', action: 'Send template T001', scope: 'global', status: 'active' },
    { id: 'R002', name: 'Award Nomination Acknowledgment', trigger: 'Nomination submitted', action: 'Send template T002', scope: 'event', status: 'active' },
    { id: 'R003', name: 'Event Reminder - 24h', trigger: 'Event - 24 hours', action: 'Send reminder', scope: 'global', status: 'active' },
    { id: 'R004', name: 'Winner Announcement', trigger: 'Winner declared', action: 'Send winner email', scope: 'program', status: 'paused' }
  ]);

  const [segments] = useState<AudienceSegment[]>([
    { id: 'SEG001', name: 'All Attendees', criteria: 'Role: Attendee', count: 1247, lastUpdated: '2024-12-20' },
    { id: 'SEG002', name: 'Award Nominees', criteria: 'Role: Nominee', count: 84, lastUpdated: '2024-12-15' },
    { id: 'SEG003', name: 'Verified Alumni', criteria: 'Role: Alumni, Verified: Yes', count: 623, lastUpdated: '2024-12-10' },
    { id: 'SEG004', name: 'London Region', criteria: 'Location: London', count: 412, lastUpdated: '2024-12-05' }
  ]);

  const [statistics] = useState({
    templatesActive: 24,
    senderDomainsVerified: 3,
    automationsEnabled: 12,
    pendingApprovals: 2,
    deliveryRate: 98.7,
    openRate: 42.3,
    clickRate: 12.8,
    bounceRate: 1.2
  });

  const sidebarItems = [
    { id: 'overview' as SectionType, icon: Layers, label: 'Overview', description: 'System status' },
    { id: 'templates' as SectionType, icon: FileText, label: 'Email Templates', description: 'Reusable content' },
    { id: 'senders' as SectionType, icon: Send, label: 'Sender Identities', description: 'Brand & domains' },
    { id: 'campaign-defaults' as SectionType, icon: Settings, label: 'Campaign Defaults', description: 'System-wide settings' },
    { id: 'automation' as SectionType, icon: Zap, label: 'Automation & Triggers', description: 'Event-driven rules' },
    { id: 'audience' as SectionType, icon: Target, label: 'Audience & Segmentation', description: 'Targeting rules' },
    { id: 'delivery' as SectionType, icon: Clock, label: 'Delivery Rules', description: 'Timing & volume' },
    { id: 'approval' as SectionType, icon: CheckSquare, label: 'Approval Workflows', description: 'Governance' },
    { id: 'analytics' as SectionType, icon: BarChart3, label: 'Tracking & Analytics', description: 'Performance' },
    { id: 'compliance' as SectionType, icon: ShieldAlert, label: 'Compliance & Suppression', description: 'Legal safety' },
    { id: 'logs' as SectionType, icon: Activity, label: 'System Logs', description: 'Audit trail' }
  ];

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Communications settings saved successfully');
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    toast.info('Unsaved changes discarded');
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Communications & Campaigns</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Communications & Campaigns
              </h1>
              <p className="text-sm text-slate-500">
                Multi-channel, multi-role compliant communications system with automation and analytics
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

      {/* Layout Container */}
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden sticky top-24">
              {/* Sidebar Header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">Communications System</h3>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {sidebarItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-3 rounded-lg mb-1 transition-all",
                        isActive
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={16} className={cn("mt-0.5", isActive ? "text-blue-600" : "text-slate-400")} />
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-medium mb-0.5", isActive ? "text-blue-900" : "text-slate-900")}>
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-span-9">
            {activeSection === 'overview' && (
              <OverviewSection settings={settings} statistics={statistics} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'templates' && (
              <TemplatesSection templates={templates} setShowCreateTemplate={setShowCreateTemplate} />
            )}

            {activeSection === 'senders' && (
              <SendersSection senders={senders} />
            )}

            {activeSection === 'campaign-defaults' && (
              <CampaignDefaultsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'automation' && (
              <AutomationSection rules={automationRules} setShowCreateRule={setShowCreateRule} />
            )}

            {activeSection === 'audience' && (
              <AudienceSection segments={segments} />
            )}

            {activeSection === 'delivery' && (
              <DeliverySection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'approval' && (
              <ApprovalSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'analytics' && (
              <AnalyticsSection statistics={statistics} />
            )}

            {activeSection === 'compliance' && (
              <ComplianceSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'logs' && (
              <LogsSection />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateTemplateDialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate} />
      <CreateRuleDialog open={showCreateRule} onOpenChange={setShowCreateRule} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = ({ settings, statistics, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Active Templates"
          value={statistics.templatesActive}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Verified Domains"
          value={statistics.senderDomainsVerified}
          icon={ShieldCheck}
          color="green"
        />
        <StatCard
          label="Automations Enabled"
          value={statistics.automationsEnabled}
          icon={Zap}
          color="purple"
        />
        <StatCard
          label="Pending Approvals"
          value={statistics.pendingApprovals}
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* Global Kill Switch - DANGER ZONE */}
      <ContentPanel
        title="Global Kill Switch"
        description="Emergency override to stop ALL outgoing communications"
      >
        <div className="p-6 border-2 border-red-300 rounded-lg bg-red-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Power size={24} className="text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-red-900">Emergency Communications Shutdown</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Activate to immediately halt ALL outgoing emails, SMS, and notifications. Use only in emergency situations.
                  </p>
                </div>
                <Switch
                  checked={settings.globalKillSwitch}
                  onCheckedChange={(val) => {
                    if (val) {
                      const confirmed = window.confirm('⚠️ WARNING: This will STOP ALL communications immediately. Are you sure?');
                      if (confirmed) {
                        handleSettingChange('globalKillSwitch', val);
                        toast.error('Communications STOPPED - Kill switch activated');
                      }
                    } else {
                      handleSettingChange('globalKillSwitch', val);
                      toast.success('Communications resumed - Kill switch deactivated');
                    }
                  }}
                />
              </div>
              {settings.globalKillSwitch && (
                <div className="mt-4 p-3 bg-red-200 border border-red-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-900 shrink-0" />
                    <p className="text-sm font-semibold text-red-900">
                      🚨 KILL SWITCH ACTIVE - All communications are currently BLOCKED
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentPanel>

      {/* Channel Enablement */}
      <ContentPanel
        title="Communication Channels"
        description="Enable or disable specific communication channels"
      >
        <div className="space-y-4">
          <ChannelToggle
            icon={Mail}
            label="Email Communications"
            description="Transactional, campaign, and system emails"
            checked={settings.emailEnabled}
            onCheckedChange={(val) => handleSettingChange('emailEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Primary Channel</Badge>}
          />
          <Separator />
          <ChannelToggle
            icon={Smartphone}
            label="SMS Communications"
            description="Text message notifications and alerts"
            checked={settings.smsEnabled}
            onCheckedChange={(val) => handleSettingChange('smsEnabled', val)}
            badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Beta</Badge>}
          />
          <Separator />
          <ChannelToggle
            icon={MessageSquare}
            label="WhatsApp Communications"
            description="WhatsApp business messaging"
            checked={settings.whatsappEnabled}
            onCheckedChange={(val) => handleSettingChange('whatsappEnabled', val)}
            badge={<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">Coming Soon</Badge>}
          />
        </div>
      </ContentPanel>

      {/* System Health */}
      <ContentPanel title="System Health" description="Real-time status of communication infrastructure">
        <div className="grid grid-cols-2 gap-4">
          <HealthIndicator
            label="Email Delivery Service"
            status="healthy"
            details="All systems operational"
          />
          <HealthIndicator
            label="Template Rendering"
            status="healthy"
            details="Processing normally"
          />
          <HealthIndicator
            label="Automation Engine"
            status="healthy"
            details="All triggers active"
          />
          <HealthIndicator
            label="Analytics Tracking"
            status="healthy"
            details="Data collection active"
          />
        </div>
      </ContentPanel>
    </div>
  );
};

const TemplatesSection = ({ templates, setShowCreateTemplate }: any) => {
  return (
    <div className="space-y-6">
      <ContentPanel
        title="Email Templates"
        description="Reusable content templates for transactional, campaign, and system emails"
        action={
          <Button onClick={() => setShowCreateTemplate(true)} className="gap-2">
            <Plus size={16} />
            Create Template
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Template Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Linked Events</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Language</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Last Edited</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {templates.map((template: EmailTemplate) => (
                <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-900">{template.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      template.type === 'transactional' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      template.type === 'campaign' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {template.linkedEvents.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        template.linkedEvents.map((event, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            {event}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                      {template.language.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      template.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      template.status === 'draft' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {template.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                      {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{template.lastEdited}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Copy size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentPanel>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>Template Types:</strong> Transactional (order confirmations, receipts), Campaign (newsletters, announcements), System (automated reminders, notifications).
          </div>
        </div>
      </div>
    </div>
  );
};

const SendersSection = ({ senders }: any) => {
  return (
    <div className="space-y-6">
      <ContentPanel
        title="Sender Identities"
        description="Verified email addresses and brand identities for sending communications"
        action={
          <Button className="gap-2">
            <Plus size={16} />
            Add Sender
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Display Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">From Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Reply-To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Linked Brand</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {senders.map((sender: SenderIdentity) => (
                <tr key={sender.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{sender.displayName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {sender.email}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-600">
                      {sender.replyTo}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {sender.linkedBrand}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      sender.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                      sender.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {sender.status === 'verified' && <ShieldCheck size={10} className="mr-1" />}
                      {sender.status === 'pending' && <Clock size={10} className="mr-1" />}
                      {sender.status === 'failed' && <XCircle size={10} className="mr-1" />}
                      {sender.status.charAt(0).toUpperCase() + sender.status.slice(1)}
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
      </ContentPanel>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>Domain Verification Required:</strong> You must verify ownership of email domains via DNS records before sending from that address. Pending senders cannot send emails.
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignDefaultsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentPanel
      title="Campaign Defaults"
      description="System-wide default settings for all new campaigns"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Default Sender Identity</Label>
            <Select value={settings.defaultSenderIdentity} onValueChange={(val) => handleSettingChange('defaultSenderIdentity', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">NISAU Events</SelectItem>
                <SelectItem value="awards">NISAU Awards</SelectItem>
                <SelectItem value="general">NISAU Communications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Default Reply-To</Label>
            <Input
              value={settings.defaultReplyTo}
              onChange={(e) => handleSettingChange('defaultReplyTo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Default Timezone</Label>
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
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Default Language</Label>
            <Select value={settings.defaultLanguage} onValueChange={(val) => handleSettingChange('defaultLanguage', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Auto-Append Settings</h3>
          <SwitchSetting
            label="Auto-Append Footer"
            description="Automatically add organization footer to all emails"
            checked={settings.autoAppendFooter}
            onCheckedChange={(val) => handleSettingChange('autoAppendFooter', val)}
          />
          <SwitchSetting
            label="Auto-Append Unsubscribe Link"
            description="Automatically add unsubscribe link to campaign emails"
            checked={settings.autoAppendUnsubscribe}
            onCheckedChange={(val) => handleSettingChange('autoAppendUnsubscribe', val)}
          />
        </div>
      </div>
    </ContentPanel>
  );
};

const AutomationSection = ({ rules, setShowCreateRule }: any) => {
  return (
    <div className="space-y-6">
      <ContentPanel
        title="Automation & Triggers"
        description="Event-driven communication rules and automated workflows"
        action={
          <Button onClick={() => setShowCreateRule(true)} className="gap-2">
            <Plus size={16} />
            Create Rule
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Rule Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Trigger</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Scope</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rules.map((rule: AutomationRule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-600" />
                      <span className="font-medium text-slate-900">{rule.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{rule.trigger}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {rule.action}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      rule.scope === 'global' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      rule.scope === 'event' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }>
                      {rule.scope.charAt(0).toUpperCase() + rule.scope.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      rule.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {rule.status === 'active' && <Play size={10} className="mr-1" />}
                      {rule.status === 'paused' && <Pause size={10} className="mr-1" />}
                      {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        {rule.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentPanel>
    </div>
  );
};

const AudienceSection = ({ segments }: any) => {
  return (
    <div className="space-y-6">
      <ContentPanel
        title="Audience & Segmentation"
        description="Pre-defined audience segments for targeted campaigns"
        action={
          <Button className="gap-2">
            <Plus size={16} />
            Create Segment
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Segment Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Criteria</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Count</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Last Updated</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {segments.map((segment: AudienceSegment) => (
                <tr key={segment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-blue-600" />
                      <span className="font-medium text-slate-900">{segment.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{segment.criteria}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {segment.count.toLocaleString()} people
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{segment.lastUpdated}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Download size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentPanel>
    </div>
  );
};

const DeliverySection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentPanel
      title="Delivery Rules"
      description="Configure timing, volume limits, and delivery optimization"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Quiet Hours</h3>
          <SwitchSetting
            label="Enable Quiet Hours"
            description="Prevent email sending during specified hours"
            checked={settings.quietHoursEnabled}
            onCheckedChange={(val) => handleSettingChange('quietHoursEnabled', val)}
          />
          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Start Time</Label>
                <Input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">End Time</Label>
                <Input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Volume Limits</h3>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Daily Send Limit (per recipient)</Label>
            <Input
              type="number"
              value={settings.dailySendLimit}
              onChange={(e) => handleSettingChange('dailySendLimit', parseInt(e.target.value))}
            />
            <p className="text-xs text-slate-500">Maximum emails one recipient can receive per day</p>
          </div>

          <SwitchSetting
            label="Enable Campaign Throttling"
            description="Spread large campaigns over time to avoid spam detection"
            checked={settings.campaignThrottling}
            onCheckedChange={(val) => handleSettingChange('campaignThrottling', val)}
          />
        </div>
      </div>
    </ContentPanel>
  );
};

const ApprovalSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentPanel
      title="Approval Workflows"
      description="Governance controls for campaign approval before sending"
    >
      <div className="space-y-6">
        <SwitchSetting
          label="Approval Required for Campaigns"
          description="All campaigns must be approved before sending"
          checked={settings.approvalRequired}
          onCheckedChange={(val) => handleSettingChange('approvalRequired', val)}
        />

        {settings.approvalRequired && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Approval Level</Label>
              <Select value={settings.approvalLevel} onValueChange={(val) => handleSettingChange('approvalLevel', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Approver</SelectItem>
                  <SelectItem value="multi">Multi-Stage Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SwitchSetting
              label="Auto-Approve System Emails"
              description="Transactional and system emails bypass approval"
              checked={settings.autoApproveSystem}
              onCheckedChange={(val) => handleSettingChange('autoApproveSystem', val)}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Approval SLA (hours)</Label>
              <Input
                type="number"
                value={settings.approvalSLA}
                onChange={(e) => handleSettingChange('approvalSLA', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500">Maximum time allowed for approval decision</p>
            </div>
          </>
        )}
      </div>
    </ContentPanel>
  );
};

const AnalyticsSection = ({ statistics }: any) => {
  return (
    <div className="space-y-6">
      <ContentPanel
        title="Tracking & Analytics"
        description="Performance metrics and engagement insights"
      >
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            label="Delivery Rate"
            value={`${statistics.deliveryRate}%`}
            trend="up"
            description="Successfully delivered emails"
            color="green"
          />
          <MetricCard
            label="Open Rate"
            value={`${statistics.openRate}%`}
            trend="up"
            description="Recipients who opened emails"
            color="blue"
          />
          <MetricCard
            label="Click Rate"
            value={`${statistics.clickRate}%`}
            trend="down"
            description="Recipients who clicked links"
            color="purple"
          />
          <MetricCard
            label="Bounce Rate"
            value={`${statistics.bounceRate}%`}
            trend="down"
            description="Failed delivery attempts"
            color="red"
          />
        </div>
      </ContentPanel>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>Analytics Note:</strong> Metrics are calculated across all campaigns sent in the last 30 days. Open tracking requires pixel support. Click tracking requires link rewriting.
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplianceSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentPanel
      title="Compliance & Suppression"
      description="Legal compliance settings and automated suppression rules"
    >
      <div className="space-y-4">
        <SwitchSetting
          label="GDPR Consent Required"
          description="Require explicit consent before sending marketing emails"
          checked={settings.gdprConsentRequired}
          onCheckedChange={(val) => handleSettingChange('gdprConsentRequired', val)}
          badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
        />

        <SwitchSetting
          label="Auto-Suppress on Bounce"
          description="Automatically suppress hard bounces from future campaigns"
          checked={settings.autoSuppressOnBounce}
          onCheckedChange={(val) => handleSettingChange('autoSuppressOnBounce', val)}
        />

        <SwitchSetting
          label="Store Proof of Consent"
          description="Maintain audit trail of consent opt-ins"
          checked={settings.proofOfConsentStorage}
          onCheckedChange={(val) => handleSettingChange('proofOfConsentStorage', val)}
        />
      </div>
    </ContentPanel>
  );
};

const LogsSection = () => {
  const logs = [
    { id: 1, timestamp: '2024-12-20 14:32:15', action: 'Campaign Sent', actor: 'Sarah Johnson', entity: 'Monthly Newsletter', status: 'success' },
    { id: 2, timestamp: '2024-12-20 13:15:22', action: 'Template Created', actor: 'Admin', entity: 'Welcome Email', status: 'success' },
    { id: 3, timestamp: '2024-12-20 11:42:10', action: 'Sender Verified', actor: 'System', entity: 'events@nisau.org', status: 'success' },
    { id: 4, timestamp: '2024-12-20 10:20:05', action: 'Campaign Failed', actor: 'System', entity: 'Event Reminder', status: 'failed' },
    { id: 5, timestamp: '2024-12-19 16:55:33', action: 'Automation Triggered', actor: 'System', entity: 'Registration Confirmation', status: 'success' },
    { id: 6, timestamp: '2024-12-19 14:12:18', action: 'Segment Updated', actor: 'Priya Patel', entity: 'London Region', status: 'success' },
    { id: 7, timestamp: '2024-12-19 11:30:42', action: 'Approval Granted', actor: 'David Chen', entity: 'Award Announcement', status: 'success' },
    { id: 8, timestamp: '2024-12-19 09:15:11', action: 'Template Deleted', actor: 'Admin', entity: 'Old Welcome Email', status: 'success' },
    { id: 9, timestamp: '2024-12-18 17:22:55', action: 'Campaign Sent', actor: 'Sarah Johnson', entity: 'Weekly Update', status: 'success' },
    { id: 10, timestamp: '2024-12-18 15:10:33', action: 'Sender Added', actor: 'Admin', entity: 'hello@nisau.org', status: 'success' }
  ];

  return (
    <ContentPanel
      title="System Logs"
      description="Complete audit trail of all communication system activities"
    >
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Action</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Entity</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-slate-600">{log.timestamp}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">{log.action}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{log.actor}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{log.entity}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={
                    log.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }>
                    {log.status === 'success' && <CheckCircle2 size={10} className="mr-1" />}
                    {log.status === 'failed' && <XCircle size={10} className="mr-1" />}
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContentPanel>
  );
};

// ==================== HELPER COMPONENTS ====================

const ContentPanel = ({ title, description, action, children }: any) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-600 font-medium">{label}</span>
        <Icon size={16} className={iconColorClasses[color as keyof typeof iconColorClasses]} />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
};

const ChannelToggle = ({ icon: Icon, label, description, checked, onCheckedChange, badge }: any) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-slate-900">{label}</span>
            {badge}
          </div>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

const HealthIndicator = ({ label, status, details }: any) => {
  const statusConfig = {
    healthy: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    down: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div className={`p-4 border ${config.border} ${config.bg} rounded-lg`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={config.color} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm">{label}</p>
          <p className="text-xs text-slate-600">{details}</p>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend, description, color }: any) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200'
  };

  const textColorClasses = {
    green: 'text-green-900',
    blue: 'text-blue-900',
    purple: 'text-purple-900',
    red: 'text-red-900'
  };

  return (
    <div className={`p-6 border rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-slate-600 font-medium">{label}</span>
        {trend && (
          <TrendingUp size={16} className={trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'} />
        )}
      </div>
      <div className={`text-3xl font-bold mb-1 ${textColorClasses[color as keyof typeof textColorClasses]}`}>
        {value}
      </div>
      <p className="text-xs text-slate-600">{description}</p>
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

const CreateTemplateDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Email Template</DialogTitle>
          <DialogDescription>
            Create a new reusable email template
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template Name *</Label>
            <Input placeholder="e.g., Welcome Email" />
          </div>

          <div className="space-y-2">
            <Label>Template Type *</Label>
            <Select defaultValue="transactional">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transactional">Transactional</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language *</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Template created successfully');
            onOpenChange(false);
          }}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateRuleDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Automation Rule</DialogTitle>
          <DialogDescription>
            Set up an automated email trigger
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rule Name *</Label>
            <Input placeholder="e.g., Post-Event Follow-up" />
          </div>

          <div className="space-y-2">
            <Label>Trigger Event *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration">Registration completed</SelectItem>
                <SelectItem value="nomination">Nomination submitted</SelectItem>
                <SelectItem value="event-24h">Event - 24 hours</SelectItem>
                <SelectItem value="winner">Winner declared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Scope *</Label>
            <Select defaultValue="global">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="event">Event-specific</SelectItem>
                <SelectItem value="program">Program-specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Automation rule created successfully');
            onOpenChange(false);
          }}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
