import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Activity, Flag, Shield, TrendingUp, Zap, Code, AlertOctagon,
  Database, Lock, Server, CheckCircle2, XCircle, AlertCircle, Info,
  AlertTriangle, Download, Save, X, Edit, Trash2, Eye, Search, Plus,
  RefreshCw, Filter, Clock, Users, Power, PowerOff, Ban, Pause, Play,
  StopCircle, Mail, FileText, Archive, Globe, Gauge, Wrench, Terminal, Bell,
  Copy
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

type SectionType = 
  | 'system-status'
  | 'feature-flags'
  | 'data-integrity'
  | 'rate-limits'
  | 'automation-jobs'
  | 'environment-mode'
  | 'global-overrides'
  | 'data-retention'
  | 'system-logs'
  | 'permissions-guard';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'admin-only';
  scope: 'global' | 'organization' | 'event';
  rollout: 'all-users' | 'selected-roles';
  module: string;
}

interface SystemLog {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  actionType: 'system-override' | 'feature-flag' | 'emergency-action' | 'config-change';
  module: string;
  details: string;
}

export const AdvancedSystemPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('system-status');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState<string | null>(null);
  const [showMaintenanceSchedule, setShowMaintenanceSchedule] = useState(false);

  const [settings, setSettings] = useState({
    // System Status
    platformStatus: 'healthy' as 'healthy' | 'degraded' | 'maintenance',
    maintenanceMode: false,
    maintenanceMessage: 'NISAU is currently undergoing scheduled maintenance. We\'ll be back shortly.',
    
    // Data Integrity
    hardDeleteProtection: true,
    requireConfirmationEvents: true,
    requireConfirmationAwards: true,
    requireConfirmationPayments: true,
    lockHistoricalRecords: true,
    
    // Rate Limits
    apiRateLimit: 1000,
    adminActionRateLimit: 100,
    emailSendRateLimit: 500,
    exportRateLimit: 50,
    
    // Automation
    backgroundJobsEnabled: true,
    retryFailedJobs: true,
    maxRetryCount: 3,
    jobFailureAlertRecipients: 'ops-team@nisau.com',
    
    // Environment
    environmentMode: 'production' as 'production' | 'staging',
    debugMode: false,
    verboseLogging: false,
    
    // Data Retention
    logRetentionDays: 90,
    emailRetentionDays: 365,
    submissionRetentionDays: 1095,
    autoCleanup: true,
    
    // Permissions
    restrictAdvancedAccess: true,
    requireTwoStepConfirmation: true
  });

  const [featureFlags] = useState<FeatureFlag[]>([
    { id: 'FF001', name: 'Awards Module', description: 'Enable awards and recognition system', status: 'enabled', scope: 'global', rollout: 'all-users', module: 'Awards' },
    { id: 'FF002', name: 'Jury Portal', description: 'Jury evaluation and scoring interface', status: 'enabled', scope: 'global', rollout: 'selected-roles', module: 'Awards' },
    { id: 'FF003', name: 'Bulk Email Sending', description: 'Send emails to multiple recipients at once', status: 'enabled', scope: 'global', rollout: 'all-users', module: 'Communications' },
    { id: 'FF004', name: 'Public Profiles', description: 'Allow users to have public-facing profiles', status: 'enabled', scope: 'organization', rollout: 'all-users', module: 'People' },
    { id: 'FF005', name: 'Ticket Add-ons', description: 'Additional products during ticket purchase', status: 'enabled', scope: 'event', rollout: 'all-users', module: 'Tickets' },
    { id: 'FF006', name: 'Advanced Reports', description: 'Custom report builder with SQL', status: 'admin-only', scope: 'global', rollout: 'selected-roles', module: 'Reports' },
    { id: 'FF007', name: 'API v3 (Beta)', description: 'Next-generation REST API', status: 'disabled', scope: 'global', rollout: 'selected-roles', module: 'APIs' },
    { id: 'FF008', name: 'Multi-Currency', description: 'Accept payments in multiple currencies', status: 'enabled', scope: 'global', rollout: 'all-users', module: 'Payments' }
  ]);

  const [systemLogs] = useState<SystemLog[]>([
    { id: 'LOG001', timestamp: '2024-12-20 14:32:15', admin: 'John Smith', action: 'Enabled maintenance mode', actionType: 'system-override', module: 'System', details: 'Scheduled database migration' },
    { id: 'LOG002', timestamp: '2024-12-20 14:15:22', admin: 'Sarah Johnson', action: 'Disabled feature: API v3 Beta', actionType: 'feature-flag', module: 'APIs', details: 'Performance issues detected' },
    { id: 'LOG003', timestamp: '2024-12-20 13:45:10', admin: 'Michael Chen', action: 'Paused all email sending', actionType: 'emergency-action', module: 'Communications', details: 'Emergency bounce rate spike' },
    { id: 'LOG004', timestamp: '2024-12-20 11:20:05', admin: 'Emma Wilson', action: 'Changed API rate limit to 1000/min', actionType: 'config-change', module: 'APIs', details: 'Increased capacity after scaling' }
  ]);

  const menuStructure = [
    {
      category: 'System Control',
      items: [
        { id: 'system-status' as SectionType, label: 'System Status & Health', status: 'configured', icon: Activity },
        { id: 'feature-flags' as SectionType, label: 'Feature Flags & Capabilities', status: 'configured', icon: Flag },
        { id: 'data-integrity' as SectionType, label: 'Data Integrity & Safety Locks', status: 'configured', icon: Shield }
      ]
    },
    {
      category: 'Performance & Safety',
      items: [
        { id: 'rate-limits' as SectionType, label: 'Rate Limits & Abuse Protection', status: 'configured', icon: TrendingUp },
        { id: 'automation-jobs' as SectionType, label: 'Automation & Background Jobs', status: 'configured', icon: Zap },
        { id: 'environment-mode' as SectionType, label: 'Environment & Mode Controls', status: 'configured', icon: Code }
      ]
    },
    {
      category: 'Emergency & Governance',
      items: [
        { id: 'global-overrides' as SectionType, label: 'Global Overrides & Emergency', status: 'configured', icon: AlertOctagon },
        { id: 'data-retention' as SectionType, label: 'Data Retention & Cleanup', status: 'configured', icon: Database },
        { id: 'system-logs' as SectionType, label: 'System Logs & Audit Trail', status: 'configured', icon: FileText },
        { id: 'permissions-guard' as SectionType, label: 'Advanced Permissions Guard', status: 'configured', icon: Lock }
      ]
    }
  ];

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Advanced settings saved successfully');
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    toast.info('Changes discarded');
    setHasChanges(false);
  };

  const getStatusDot = (status: string) => {
    return status === 'configured' ? 'bg-green-500' : 'bg-slate-300';
  };

  const filteredMenu = menuStructure.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(sidebarSearch.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Debug Mode Banner */}
      {settings.debugMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-medium z-50">
          ⚠️ DEBUG MODE ACTIVE — System performance may be affected
        </div>
      )}

      {/* Sticky Header */}
      <div className={cn(
        "bg-white border-b border-slate-200 sticky z-20",
        settings.debugMode ? "top-[36px]" : "top-0"
      )}>
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Advanced & System</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Advanced & System
              </h1>
              <p className="text-sm text-slate-500">
                Platform-wide controls, stability safeguards, and emergency operations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusIndicator status={settings.platformStatus} />
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Export System Report
              </Button>
              {settings.maintenanceMode && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Maintenance Active
                </Badge>
              )}
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
              {/* Sidebar Search */}
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <Input
                    placeholder="Search controls..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="pl-9 text-sm h-9"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredMenu.map((category, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {category.category}
                    </div>
                    {category.items.map((item) => {
                      const isActive = activeSection === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg mb-1 transition-all text-sm flex items-center gap-2",
                            isActive
                              ? "bg-blue-50 text-blue-900 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                          <span className="flex-1">{item.label}</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`} />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-span-9">
            {activeSection === 'system-status' && (
              <SystemStatusSection 
                settings={settings} 
                handleSettingChange={handleSettingChange}
                setShowMaintenanceSchedule={setShowMaintenanceSchedule}
              />
            )}

            {activeSection === 'feature-flags' && (
              <FeatureFlagsSection featureFlags={featureFlags} />
            )}

            {activeSection === 'data-integrity' && (
              <DataIntegritySection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'rate-limits' && (
              <RateLimitsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'automation-jobs' && (
              <AutomationJobsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'environment-mode' && (
              <EnvironmentModeSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'global-overrides' && (
              <GlobalOverridesSection setShowEmergencyConfirm={setShowEmergencyConfirm} />
            )}

            {activeSection === 'data-retention' && (
              <DataRetentionSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'system-logs' && (
              <SystemLogsSection systemLogs={systemLogs} />
            )}

            {activeSection === 'permissions-guard' && (
              <PermissionsGuardSection settings={settings} handleSettingChange={handleSettingChange} />
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30">
          <div className="max-w-[1600px] mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <AlertCircle size={20} className="text-amber-600" />
                <span className="font-medium">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <EmergencyConfirmDialog 
        open={showEmergencyConfirm !== null} 
        onOpenChange={() => setShowEmergencyConfirm(null)}
        actionId={showEmergencyConfirm}
      />
      <MaintenanceScheduleDialog 
        open={showMaintenanceSchedule} 
        onOpenChange={setShowMaintenanceSchedule}
      />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const SystemStatusSection = ({ settings, handleSettingChange, setShowMaintenanceSchedule }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System Status & Health Controls</h2>
            <p className="text-sm text-slate-500 mt-1">High-level system visibility and emergency readiness</p>
          </div>
          <StatusBadge status={settings.platformStatus} />
        </div>
        <p className="text-xs text-slate-500 mt-4">Last system check: 2 minutes ago</p>
      </div>

      {/* Current Status */}
      <ContentCard title="Platform Status" description="Current system health and operational state">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">System Operational</h4>
                <p className="text-sm text-green-700">All systems functioning normally</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Healthy
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Uptime" value="99.97%" status="good" />
            <MetricCard label="Response Time" value="142ms" status="good" />
            <MetricCard label="Error Rate" value="0.02%" status="good" />
          </div>
        </div>
      </ContentCard>

      {/* Maintenance Mode */}
      <ContentCard title="Maintenance Mode" description="Control platform accessibility">
        <div className="space-y-4">
          <SwitchField
            label="Enable Maintenance Mode"
            description="Restrict frontend access except for administrators"
            checked={settings.maintenanceMode}
            onCheckedChange={(val) => handleSettingChange('maintenanceMode', val)}
            badge={settings.maintenanceMode ? <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Active</Badge> : undefined}
          />

          {settings.maintenanceMode && (
            <>
              <FormField label="Maintenance Message">
                <Textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => handleSettingChange('maintenanceMessage', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">This message is shown to frontend users during maintenance</p>
              </FormField>

              <Button variant="outline" className="gap-2" onClick={() => setShowMaintenanceSchedule(true)}>
                <Clock size={16} />
                Schedule Maintenance Window
              </Button>
            </>
          )}
        </div>

        {settings.maintenanceMode && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Maintenance Mode Active</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Frontend access restricted (Admin access allowed)</li>
                  <li>• Ticket purchases disabled</li>
                  <li>• Event submissions paused</li>
                  <li>• Public APIs return 503 status</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </ContentCard>
    </div>
  );
};

const FeatureFlagsSection = ({ featureFlags }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Feature Flags & Capabilities</h2>
            <p className="text-sm text-slate-500 mt-1">Control feature rollout and module availability</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {featureFlags.length} Flags
          </Badge>
        </div>
      </div>

      {/* Feature Flags Table */}
      <ContentCard
        title="Feature Flags"
        description="Toggle features and capabilities across the platform"
        action={
          <Button className="gap-2">
            <Plus size={16} />
            Create Flag
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Feature</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Module</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Scope</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Rollout</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {featureFlags.map((flag: FeatureFlag) => (
                <FeatureFlagRow key={flag.id} flag={flag} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>Feature Rollout Strategy:</strong> Use feature flags to safely deploy new capabilities. 
            Start with "Selected Roles" before opening to "All Users".
          </div>
        </div>
      </div>
    </div>
  );
};

const DataIntegritySection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Data Integrity & Safety Locks</h2>
            <p className="text-sm text-slate-500 mt-1">Prevent accidental data loss and enforce confirmations</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Protection Mechanisms" description="Safety locks for critical operations">
        <div className="space-y-3">
          <SwitchField
            label="Hard Delete Protection"
            description="Prevent permanent deletion of records (soft delete only)"
            checked={settings.hardDeleteProtection}
            onCheckedChange={(val) => handleSettingChange('hardDeleteProtection', val)}
            badge={<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Critical</Badge>}
          />
          <SwitchField
            label="Require Confirmation for Event Deletions"
            description="Two-step confirmation before deleting events"
            checked={settings.requireConfirmationEvents}
            onCheckedChange={(val) => handleSettingChange('requireConfirmationEvents', val)}
            badge={<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Important</Badge>}
          />
          <SwitchField
            label="Require Confirmation for Award Deletions"
            description="Two-step confirmation before deleting awards"
            checked={settings.requireConfirmationAwards}
            onCheckedChange={(val) => handleSettingChange('requireConfirmationAwards', val)}
          />
          <SwitchField
            label="Require Confirmation for Payment Operations"
            description="Extra validation for refunds and cancellations"
            checked={settings.requireConfirmationPayments}
            onCheckedChange={(val) => handleSettingChange('requireConfirmationPayments', val)}
            badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Financial</Badge>}
          />
          <SwitchField
            label="Lock Historical Records"
            description="Prevent editing of records older than 90 days"
            checked={settings.lockHistoricalRecords}
            onCheckedChange={(val) => handleSettingChange('lockHistoricalRecords', val)}
          />
        </div>
      </ContentCard>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-900">
            <strong>Data Integrity:</strong> These protections are critical for compliance and audit requirements. 
            Disabling them may expose your organization to data loss risks.
          </div>
        </div>
      </div>
    </div>
  );
};

const RateLimitsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Rate Limits & Abuse Protection</h2>
            <p className="text-sm text-slate-500 mt-1">Control request rates to prevent abuse</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Rate Limit Configuration" description="Set maximum request rates per time window">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="API Rate Limit (requests/min)">
            <Input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Admin Action Rate Limit (actions/min)">
            <Input
              type="number"
              value={settings.adminActionRateLimit}
              onChange={(e) => handleSettingChange('adminActionRateLimit', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Email Send Rate Limit (emails/hour)">
            <Input
              type="number"
              value={settings.emailSendRateLimit}
              onChange={(e) => handleSettingChange('emailSendRateLimit', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Export Rate Limit (exports/hour)">
            <Input
              type="number"
              value={settings.exportRateLimit}
              onChange={(e) => handleSettingChange('exportRateLimit', parseInt(e.target.value))}
            />
          </FormField>
        </div>
      </ContentCard>
    </div>
  );
};

const AutomationJobsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Automation & Background Jobs</h2>
            <p className="text-sm text-slate-500 mt-1">Manage background processes and automation</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Job Configuration" description="Background job settings and failure handling">
        <div className="space-y-4">
          <SwitchField
            label="Background Jobs Enabled"
            description="Enable automated background task processing"
            checked={settings.backgroundJobsEnabled}
            onCheckedChange={(val) => handleSettingChange('backgroundJobsEnabled', val)}
          />
          <SwitchField
            label="Retry Failed Jobs"
            description="Automatically retry jobs that fail"
            checked={settings.retryFailedJobs}
            onCheckedChange={(val) => handleSettingChange('retryFailedJobs', val)}
          />
          
          <FormField label="Maximum Retry Count">
            <Input
              type="number"
              min={1}
              max={5}
              value={settings.maxRetryCount}
              onChange={(e) => handleSettingChange('maxRetryCount', parseInt(e.target.value))}
            />
          </FormField>

          <FormField label="Job Failure Alert Recipients">
            <Input
              value={settings.jobFailureAlertRecipients}
              onChange={(e) => handleSettingChange('jobFailureAlertRecipients', e.target.value)}
              placeholder="email@example.com"
            />
          </FormField>
        </div>
      </ContentCard>
    </div>
  );
};

const EnvironmentModeSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Environment & Mode Controls</h2>
            <p className="text-sm text-slate-500 mt-1">System environment and debugging configuration</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Environment Configuration" description="Current environment and mode settings">
        <div className="space-y-4">
          <FormField label="Environment Mode">
            <Select value={settings.environmentMode} onValueChange={(val) => handleSettingChange('environmentMode', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">
                  Production
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">Live</Badge>
                </SelectItem>
                <SelectItem value="staging">
                  Staging
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">Test</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <Separator />

          <SwitchField
            label="Debug Mode"
            description="Enable verbose debugging (impacts performance)"
            checked={settings.debugMode}
            onCheckedChange={(val) => handleSettingChange('debugMode', val)}
            badge={<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Warning</Badge>}
          />
          <SwitchField
            label="Verbose Logging"
            description="Log detailed application events"
            checked={settings.verboseLogging}
            onCheckedChange={(val) => handleSettingChange('verboseLogging', val)}
          />
        </div>
      </ContentCard>

      {settings.debugMode && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">⚠️ DEBUG MODE IS ENABLED</h4>
              <p className="text-sm text-red-800">
                Debug mode significantly impacts system performance and should only be used temporarily for troubleshooting.
                Disable debug mode when diagnosis is complete.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GlobalOverridesSection = ({ setShowEmergencyConfirm }: any) => {
  const emergencyActions = [
    { id: 'pause-email', label: 'Pause All Email Sending', icon: Mail, color: 'red' },
    { id: 'disable-tickets', label: 'Disable All Ticket Purchases', icon: Ban, color: 'red' },
    { id: 'lock-submissions', label: 'Lock All Form Submissions', icon: Lock, color: 'red' },
    { id: 'force-logout', label: 'Force Logout All Users', icon: Users, color: 'red' },
    { id: 'emergency-backup', label: 'Emergency Database Backup', icon: Database, color: 'red' },
    { id: 'trigger-failover', label: 'Trigger Failover Mode', icon: AlertOctagon, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Global Overrides & Emergency Controls</h2>
            <p className="text-sm text-slate-500 mt-1">Emergency actions for critical situations</p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Emergency Controls</Badge>
        </div>
      </div>

      {/* Critical Warning */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900 mb-2">⚠️ CRITICAL WARNING</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• These actions have immediate platform-wide impact</li>
              <li>• All actions are logged and audited</li>
              <li>• Use only in genuine emergencies</li>
              <li>• Requires two-step confirmation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Emergency Actions */}
      <ContentCard title="Emergency Actions" description="Immediate platform-wide controls">
        <div className="grid grid-cols-2 gap-4">
          {emergencyActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-4 px-4 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 justify-start"
                onClick={() => setShowEmergencyConfirm(action.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-red-900">{action.label}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ContentCard>
    </div>
  );
};

const DataRetentionSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Data Retention & Cleanup</h2>
            <p className="text-sm text-slate-500 mt-1">Configure automatic data cleanup policies</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Retention Periods" description="How long to keep different types of data">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Log Retention (days)">
              <Input
                type="number"
                value={settings.logRetentionDays}
                onChange={(e) => handleSettingChange('logRetentionDays', parseInt(e.target.value))}
              />
            </FormField>
            <FormField label="Email Retention (days)">
              <Input
                type="number"
                value={settings.emailRetentionDays}
                onChange={(e) => handleSettingChange('emailRetentionDays', parseInt(e.target.value))}
              />
            </FormField>
            <FormField label="Submission Retention (days)">
              <Input
                type="number"
                value={settings.submissionRetentionDays}
                onChange={(e) => handleSettingChange('submissionRetentionDays', parseInt(e.target.value))}
              />
            </FormField>
          </div>

          <Separator />

          <SwitchField
            label="Auto-Cleanup Enabled"
            description="Automatically delete data past retention period"
            checked={settings.autoCleanup}
            onCheckedChange={(val) => handleSettingChange('autoCleanup', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const SystemLogsSection = ({ systemLogs }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System Logs & Audit Trail</h2>
            <p className="text-sm text-slate-500 mt-1">Track all system-level actions and changes</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Last 50 Actions
          </Badge>
        </div>
      </div>

      {/* System Logs Table */}
      <ContentCard
        title="Recent System Actions"
        description="Administrative actions and system changes"
        action={
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export All Logs
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Admin</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Module</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Details</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {systemLogs.map((log: SystemLog) => (
                <SystemLogRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const PermissionsGuardSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Advanced Permissions Guard</h2>
            <p className="text-sm text-slate-500 mt-1">Extra security for advanced settings access</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Guard Configuration" description="Additional security measures">
        <div className="space-y-3">
          <SwitchField
            label="Restrict Advanced Access"
            description="Limit advanced settings to specific admin roles"
            checked={settings.restrictAdvancedAccess}
            onCheckedChange={(val) => handleSettingChange('restrictAdvancedAccess', val)}
            badge={<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Security</Badge>}
          />
          <SwitchField
            label="Require Two-Step Confirmation"
            description="Extra confirmation for critical changes"
            checked={settings.requireTwoStepConfirmation}
            onCheckedChange={(val) => handleSettingChange('requireTwoStepConfirmation', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const FeatureFlagRow = ({ flag }: { flag: FeatureFlag }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-purple-600" />
          <div>
            <div className="font-medium text-slate-900">{flag.name}</div>
            <div className="text-xs text-slate-500">{flag.description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          flag.module === 'Awards' ? 'bg-purple-50 text-purple-700 border-purple-200' :
          flag.module === 'Communications' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          flag.module === 'People' ? 'bg-green-50 text-green-700 border-green-200' :
          flag.module === 'Tickets' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          flag.module === 'Reports' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
          flag.module === 'APIs' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
          flag.module === 'Payments' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-slate-50 text-slate-700 border-slate-200'
        }>
          {flag.module}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          flag.scope === 'global' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          flag.scope === 'organization' ? 'bg-green-50 text-green-700 border-green-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }>
          {flag.scope.charAt(0).toUpperCase() + flag.scope.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          flag.rollout === 'all-users' ? 'bg-green-50 text-green-700 border-green-200' :
          'bg-amber-50 text-amber-700 border-amber-200'
        }>
          {flag.rollout === 'all-users' ? 'All Users' : 'Selected Roles'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {flag.status === 'enabled' && (
          <Switch checked={true} />
        )}
        {flag.status === 'admin-only' && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1">
            <Lock size={10} />
            Admin Only
          </Badge>
        )}
        {flag.status === 'disabled' && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
            <Ban size={10} />
            Disabled
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Copy size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-red-600">
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const SystemLogRow = ({ log }: { log: SystemLog }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <span className="text-sm text-slate-700 font-mono">{log.timestamp}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-slate-400" />
          <span className="text-sm text-slate-700">{log.admin}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-slate-900">{log.action}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          log.actionType === 'system-override' ? 'bg-red-50 text-red-700 border-red-200' :
          log.actionType === 'feature-flag' ? 'bg-purple-50 text-purple-700 border-purple-200' :
          log.actionType === 'emergency-action' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-blue-50 text-blue-700 border-blue-200'
        }>
          {log.actionType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
          {log.module}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600 truncate max-w-xs block">{log.details}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Eye size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Download size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const StatusIndicator = ({ status }: { status: 'healthy' | 'degraded' | 'maintenance' }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{
      backgroundColor: status === 'healthy' ? '#f0fdf4' : status === 'degraded' ? '#fef3c7' : '#fee2e2',
      borderColor: status === 'healthy' ? '#86efac' : status === 'degraded' ? '#fcd34d' : '#fca5a5'
    }}>
      <div className={`w-2 h-2 rounded-full ${
        status === 'healthy' ? 'bg-green-500' :
        status === 'degraded' ? 'bg-amber-500' :
        'bg-red-500'
      }`} />
      <span className="text-sm font-medium" style={{
        color: status === 'healthy' ? '#166534' : status === 'degraded' ? '#92400e' : '#991b1b'
      }}>
        {status === 'healthy' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Maintenance'}
      </span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: 'healthy' | 'degraded' | 'maintenance' }) => {
  return (
    <Badge variant="outline" className={
      status === 'healthy' ? 'bg-green-50 text-green-700 border-green-200' :
      status === 'degraded' ? 'bg-amber-50 text-amber-700 border-amber-200' :
      'bg-red-50 text-red-700 border-red-200'
    }>
      {status === 'healthy' && <CheckCircle2 size={10} className="mr-1" />}
      {status === 'degraded' && <AlertTriangle size={10} className="mr-1" />}
      {status === 'maintenance' && <Wrench size={10} className="mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const MetricCard = ({ label, value, status }: any) => {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600'
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${statusColors[status as keyof typeof statusColors]}`}>
        {value}
      </div>
    </div>
  );
};

const ContentCard = ({ title, description, action, children }: any) => {
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

const FormField = ({ label, children }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
};

const SwitchField = ({ label, description, checked, onCheckedChange, badge }: any) => {
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

const EmergencyConfirmDialog = ({ open, onOpenChange, actionId }: any) => {
  const handleConfirm = () => {
    toast.success('Emergency action executed');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            Confirm Emergency Action
          </DialogTitle>
          <DialogDescription>
            This action will have immediate platform-wide impact
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-700 mb-4">
            Are you sure you want to proceed? This action is logged and audited.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              Type <strong>CONFIRM</strong> to proceed
            </p>
            <Input className="mt-2" placeholder="Type CONFIRM" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
          >
            Execute Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MaintenanceScheduleDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance Window</DialogTitle>
          <DialogDescription>
            Plan and schedule system maintenance
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label>Maintenance Message</Label>
            <Textarea rows={3} placeholder="Scheduled maintenance for system upgrades..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Maintenance window scheduled');
            onOpenChange(false);
          }}>
            Schedule Maintenance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
