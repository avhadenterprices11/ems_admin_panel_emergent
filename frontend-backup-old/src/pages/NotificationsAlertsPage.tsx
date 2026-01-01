import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Mail, MessageSquare, Smartphone, Globe, Zap, AlertTriangle, Shield,
  Users, Calendar, FileText, Award, TrendingUp, Clock, Activity, Database,
  Plus, Save, RefreshCw, Edit, Eye, ChevronRight, ChevronDown,
  CheckCircle2, XCircle, Settings, Languages
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../components/ui/utils';

type SectionType = 
  | 'notification-channels'
  | 'global-rules'
  | 'delivery-preferences'
  | 'admin-alerts'
  | 'system-health'
  | 'security-alerts'
  | 'event-notifications'
  | 'workflow-alerts'
  | 'jury-notifications'
  | 'user-preferences'
  | 'role-based-rules'
  | 'escalation-rules'
  | 'retry-failure'
  | 'quiet-hours'
  | 'consent-optout'
  | 'audit-logs'
  | 'retention-archival';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'inapp' | 'webhook';
  enabled: boolean;
  provider: string;
  rateLimit: number;
  status: 'active' | 'inactive' | 'error';
}

interface AdminAlert {
  id: string;
  name: string;
  trigger: string;
  recipients: string;
  channel: string;
  requireAck: boolean;
  status: 'active' | 'inactive';
}

interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  escalateTo: string;
  timing: string;
  priority: number;
  status: 'active' | 'inactive';
}

export const NotificationsAlertsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('notification-channels');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core', 'admin', 'event', 'user', 'escalation', 'compliance'])
  );

  const [settings, setSettings] = useState({
    // Global
    globalNotificationsEnabled: true,
    businessHoursOnly: false,
    maxNotificationsPerDay: 50,

    // Channels
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: false,
    pushEnabled: true,
    inappEnabled: true,
    webhookEnabled: false,

    // Delivery
    deliveryMode: 'parallel',
    emailTimeout: 30,
    smsTimeout: 10,

    // Priority
    criticalChannel: 'email+sms',
    highChannel: 'email',
    normalChannel: 'inapp',

    // Escalation
    escalationEnabled: true,
    retryCount: 3,
    backoffStrategy: 'exponential',

    // Quiet Hours
    quietHoursEnabled: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    emergencyOverride: true,

    // Consent
    gdprEnforcement: true,
    channelConsent: true,
    systemAlertsExempt: true
  });

  const [channels] = useState<NotificationChannel[]>([
    { id: 'CH001', name: 'Primary Email', type: 'email', enabled: true, provider: 'SendGrid', rateLimit: 1000, status: 'active' },
    { id: 'CH002', name: 'Transactional SMS', type: 'sms', enabled: true, provider: 'Twilio', rateLimit: 100, status: 'active' },
    { id: 'CH003', name: 'WhatsApp Business', type: 'whatsapp', enabled: false, provider: 'Twilio', rateLimit: 50, status: 'inactive' },
    { id: 'CH004', name: 'Push Notifications', type: 'push', enabled: true, provider: 'FCM', rateLimit: 5000, status: 'active' },
    { id: 'CH005', name: 'In-App Alerts', type: 'inapp', enabled: true, provider: 'Internal', rateLimit: 10000, status: 'active' }
  ]);

  const [adminAlerts] = useState<AdminAlert[]>([
    { id: 'AA001', name: 'New User Signup', trigger: 'user.created', recipients: 'Admin Team', channel: 'Email', requireAck: false, status: 'active' },
    { id: 'AA002', name: 'Failed Payment', trigger: 'payment.failed', recipients: 'Finance Team', channel: 'Email + SMS', requireAck: true, status: 'active' },
    { id: 'AA003', name: 'Compliance Violation', trigger: 'compliance.violation', recipients: 'Compliance Team', channel: 'Email + SMS', requireAck: true, status: 'active' }
  ]);

  const [escalationRules] = useState<EscalationRule[]>([
    { id: 'ER001', name: 'Critical Alert Escalation', condition: 'Not acknowledged in 15 min', escalateTo: 'Super Admin', timing: '15 minutes', priority: 1, status: 'active' },
    { id: 'ER002', name: 'Payment Failure Escalation', condition: 'Not resolved in 2 hours', escalateTo: 'Finance Director', timing: '2 hours', priority: 2, status: 'active' },
    { id: 'ER003', name: 'System Health Escalation', condition: 'Not acknowledged in 5 min', escalateTo: 'Engineering Lead', timing: '5 minutes', priority: 1, status: 'active' }
  ]);

  const menuStructure = [
    {
      id: 'core',
      category: 'Core Notification System',
      items: [
        { id: 'notification-channels' as SectionType, label: 'Notification Channels', status: 'configured' },
        { id: 'global-rules' as SectionType, label: 'Global Notification Rules', status: 'configured' },
        { id: 'delivery-preferences' as SectionType, label: 'Delivery Preferences', status: 'configured' }
      ]
    },
    {
      id: 'admin',
      category: 'Admin & System Alerts',
      items: [
        { id: 'admin-alerts' as SectionType, label: 'Admin Alerts', status: 'configured' },
        { id: 'system-health' as SectionType, label: 'System Health Alerts', status: 'configured' },
        { id: 'security-alerts' as SectionType, label: 'Security Alerts', status: 'attention' }
      ]
    },
    {
      id: 'event',
      category: 'Event & Workflow Alerts',
      items: [
        { id: 'event-notifications' as SectionType, label: 'Event Notifications', status: 'configured' },
        { id: 'workflow-alerts' as SectionType, label: 'Application & Workflow Alerts', status: 'configured' },
        { id: 'jury-notifications' as SectionType, label: 'Award & Jury Notifications', status: 'configured' }
      ]
    },
    {
      id: 'user',
      category: 'User & Role-based Alerts',
      items: [
        { id: 'user-preferences' as SectionType, label: 'User Notification Preferences', status: 'configured' },
        { id: 'role-based-rules' as SectionType, label: 'Role-based Notification Rules', status: 'configured' }
      ]
    },
    {
      id: 'escalation',
      category: 'Escalation & Reliability',
      items: [
        { id: 'escalation-rules' as SectionType, label: 'Escalation Rules', status: 'configured' },
        { id: 'retry-failure' as SectionType, label: 'Retry & Failure Handling', status: 'configured' },
        { id: 'quiet-hours' as SectionType, label: 'Quiet Hours & Throttling', status: 'configured' }
      ]
    },
    {
      id: 'compliance',
      category: 'Compliance & Auditing',
      items: [
        { id: 'consent-optout' as SectionType, label: 'Consent & Opt-out Rules', status: 'configured' },
        { id: 'audit-logs' as SectionType, label: 'Notification Audit Logs', status: 'configured' },
        { id: 'retention-archival' as SectionType, label: 'Retention & Archival Rules', status: 'configured' }
      ]
    }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1000);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle2 size={12} className="text-green-600" />;
      case 'attention':
        return <AlertTriangle size={12} className="text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Notifications & Alerts</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Notifications & Alerts
              </h1>
              <p className="text-sm text-slate-500">
                Configure notification channels, alerts, escalation policies, and delivery rules
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 size={12} className="mr-1" />
                Configured
              </Badge>
              {hasChanges && (
                <Button variant="ghost" onClick={() => setHasChanges(false)} className="gap-2">
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
      <div className="flex max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 min-h-[calc(100vh-137px)] sticky top-[137px] overflow-y-auto">
          <div className="p-4">
            {menuStructure.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              return (
                <div key={category.id} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 uppercase hover:bg-slate-50 rounded transition-colors"
                  >
                    <span>{category.category}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 space-y-1">
                      {category.items.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors",
                              isActive
                                ? "bg-slate-900 text-white"
                                : "text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <span>{item.label}</span>
                            {getStatusBadge(item.status)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Notification Channels */}
          {activeSection === 'notification-channels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Notification Channels</h2>
                  <p className="text-sm text-slate-500">Configure delivery channels for notifications and alerts</p>
                </div>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Channel
                </Button>
              </div>

              {/* Channels Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Enabled</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Rate Limit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {channels.map((channel) => {
                      const typeColors = {
                        email: 'bg-blue-50 text-blue-700 border-blue-200',
                        sms: 'bg-purple-50 text-purple-700 border-purple-200',
                        whatsapp: 'bg-green-50 text-green-700 border-green-200',
                        push: 'bg-orange-50 text-orange-700 border-orange-200',
                        inapp: 'bg-slate-50 text-slate-700 border-slate-200',
                        webhook: 'bg-pink-50 text-pink-700 border-pink-200'
                      };

                      return (
                        <tr key={channel.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-900">{channel.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={typeColors[channel.type]}>
                              {channel.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Switch checked={channel.enabled} onCheckedChange={() => {}} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">{channel.provider}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">{channel.rateLimit.toLocaleString()}/hr</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={
                              channel.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                              channel.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }>
                              {channel.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                              {channel.status === 'error' && <XCircle size={10} className="mr-1" />}
                              {channel.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8">
                                <Settings size={14} className="mr-1" />
                                Configure
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Activity size={14} className="mr-1" />
                                Logs
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Channel Toggles */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Enable/Disable Channels</h3>
                <div className="space-y-3">
                  <SwitchField
                    label="Email Enabled"
                    description="Send notifications via email"
                    checked={settings.emailEnabled}
                    onCheckedChange={(val) => handleSettingChange('emailEnabled', val)}
                    badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Primary</Badge>}
                  />
                  <SwitchField
                    label="SMS Enabled"
                    description="Send notifications via SMS/text message"
                    checked={settings.smsEnabled}
                    onCheckedChange={(val) => handleSettingChange('smsEnabled', val)}
                  />
                  <SwitchField
                    label="WhatsApp Enabled"
                    description="Send notifications via WhatsApp Business"
                    checked={settings.whatsappEnabled}
                    onCheckedChange={(val) => handleSettingChange('whatsappEnabled', val)}
                    badge={<Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">Beta</Badge>}
                  />
                  <SwitchField
                    label="Push Notifications Enabled"
                    description="Send push notifications to mobile devices"
                    checked={settings.pushEnabled}
                    onCheckedChange={(val) => handleSettingChange('pushEnabled', val)}
                  />
                  <SwitchField
                    label="In-App Alerts Enabled"
                    description="Show alerts within the application interface"
                    checked={settings.inappEnabled}
                    onCheckedChange={(val) => handleSettingChange('inappEnabled', val)}
                  />
                  <SwitchField
                    label="Webhook Enabled"
                    description="Send notifications to external webhook endpoints"
                    checked={settings.webhookEnabled}
                    onCheckedChange={(val) => handleSettingChange('webhookEnabled', val)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Admin Alerts */}
          {activeSection === 'admin-alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Admin Alerts</h2>
                  <p className="text-sm text-slate-500">Configure alerts sent to administrators and staff</p>
                </div>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Admin Alert
                </Button>
              </div>

              {/* Admin Alerts Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Trigger</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Recipients</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Channel</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Require Ack</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900">{alert.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-mono">
                            {alert.trigger}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{alert.recipients}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            {alert.channel}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {alert.requireAck ? (
                            <CheckCircle2 size={16} className="text-green-600 inline" />
                          ) : (
                            <XCircle size={16} className="text-slate-400 inline" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={
                            alert.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }>
                            {alert.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Eye size={14} className="mr-1" />
                              Test
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Escalation Rules */}
          {activeSection === 'escalation-rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Escalation Rules</h2>
                  <p className="text-sm text-slate-500">Define escalation policies for unacknowledged or unresolved alerts</p>
                </div>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Escalation Rule
                </Button>
              </div>

              {/* Escalation Enabled */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <SwitchField
                  label="Escalation Enabled"
                  description="Automatically escalate critical alerts when not acknowledged in time"
                  checked={settings.escalationEnabled}
                  onCheckedChange={(val) => handleSettingChange('escalationEnabled', val)}
                  badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
                />
              </div>

              {/* Escalation Rules Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Escalate To</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Timing</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Priority</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {escalationRules.map((rule) => {
                      const priorityColors = {
                        1: 'bg-red-50 text-red-700 border-red-200',
                        2: 'bg-orange-50 text-orange-700 border-orange-200',
                        3: 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      };

                      return (
                        <tr key={rule.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-900">{rule.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">{rule.condition}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp size={14} className="text-slate-400" />
                              <span className="text-sm text-slate-900 font-medium">{rule.escalateTo}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-sm text-slate-600">{rule.timing}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className={priorityColors[rule.priority as keyof typeof priorityColors]}>
                              P{rule.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className={
                              rule.status === 'active'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }>
                              {rule.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8">
                                <Edit size={14} className="mr-1" />
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Retry Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Retry Count">
                  <Input
                    type="number"
                    value={settings.retryCount}
                    onChange={(e) => handleSettingChange('retryCount', parseInt(e.target.value))}
                  />
                </FormField>

                <FormField label="Backoff Strategy">
                  <Select value={settings.backoffStrategy} onValueChange={(val) => handleSettingChange('backoffStrategy', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exponential">Exponential Backoff</SelectItem>
                      <SelectItem value="linear">Linear Backoff</SelectItem>
                      <SelectItem value="fixed">Fixed Interval</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {(activeSection !== 'notification-channels' && activeSection !== 'admin-alerts' && activeSection !== 'escalation-rules') && (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Settings className="text-slate-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {menuStructure.flatMap(cat => cat.items).find(item => item.id === activeSection)?.label}
              </h3>
              <p className="text-sm text-slate-500">
                Configuration options for this section will be displayed here
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Reusable Components
const FormField = ({ label, required, children }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
};

const SwitchField = ({ label, description, checked, onCheckedChange, badge }: any) => {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Label className="text-sm font-medium text-slate-700">{label}</Label>
          {badge}
        </div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};
