import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Clock, Zap, Ban, Settings, AlertTriangle, Activity, Save, Eye, Play,
  RefreshCw, Info, Plus, Edit, Download, Upload, Trash2, CheckCircle2, XCircle,
  AlertCircle, Globe, Mail, Smartphone, Bell, MessageSquare, Webhook, User,
  Calendar, Target, Lock, Unlock, TrendingUp, Filter, Search, MoreVertical,
  ChevronRight, ChevronDown, Pause, Check, X
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

type TabType = 'quiet-hours' | 'rate-limiting' | 'suppression' | 'channel-safety' | 'fallback' | 'abuse' | 'audit';

interface RegionRule {
  id: string;
  region: string;
  timezone: string;
  allowedWindow: string;
  blockedWindow: string;
  overrideRoles: string[];
  status: 'active' | 'paused';
}

interface SuppressionEntry {
  id: string;
  listName: string;
  type: 'email' | 'phone' | 'domain' | 'user-id';
  source: 'manual' | 'bounce' | 'complaint' | 'api';
  autoExpiry: string;
  status: 'active' | 'expired';
}

interface RateLimitRule {
  id: string;
  entityType: string;
  maxActions: number;
  timeWindow: string;
  scope: string;
  enforcementMode: 'block' | 'throttle' | 'alert';
  status: 'active' | 'paused';
}

export const DeliverySafetyControlsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('quiet-hours');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [showAddSuppression, setShowAddSuppression] = useState(false);

  const [settings, setSettings] = useState({
    // Quiet Hours
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    quietHoursTimezone: 'global',
    quietHoursDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    holidayOverride: false,
    emergencyBypass: true,
    applyToAllChannels: true,

    // Rate Limiting
    rateLimitingEnabled: true,
    defaultMessagesPerHour: 100,
    defaultMessagesPerDay: 500,
    burstLimit: 10,
    burstWindow: 5,
    cooldownDuration: 60,

    // Channel Limits
    emailRPM: 60,
    emailRPH: 1000,
    smsRPM: 10,
    smsRPH: 100,
    pushRPM: 100,
    pushRPH: 5000,

    // Suppression
    autoSuppressAfterBounces: 3,
    autoSuppressAfterComplaints: 1,
    tempSuppressionDuration: 30,
    permanentSuppressionEnabled: true,

    // Channel Safety
    keywordBlockingEnabled: true,
    regexBlockingEnabled: false,
    maxMessageSize: 5120,
    attachmentRestrictionsEnabled: true,

    // Approval Requirements
    requireApprovalForBulk: true,
    bulkThreshold: 10000,
    autoExpireApprovals: true,

    // Retry Logic
    retryAttempts: 3,
    retryIntervals: '1,5,15',
    exponentialBackoff: true,
    maxRetryWindow: 24,

    // Abuse Prevention
    volumeSpikeDetection: true,
    geoAnomalyDetection: true,
    autoLockCampaigns: true,
    lockDuration: 24
  });

  const [regionRules] = useState<RegionRule[]>([
    { id: 'R001', region: 'United Kingdom', timezone: 'Europe/London', allowedWindow: '08:00 - 22:00', blockedWindow: '22:00 - 08:00', overrideRoles: ['Admin', 'Operations'], status: 'active' },
    { id: 'R002', region: 'India', timezone: 'Asia/Kolkata', allowedWindow: '09:00 - 21:00', blockedWindow: '21:00 - 09:00', overrideRoles: ['Admin'], status: 'active' },
    { id: 'R003', region: 'United States (EST)', timezone: 'America/New_York', allowedWindow: '08:00 - 20:00', blockedWindow: '20:00 - 08:00', overrideRoles: ['Admin', 'Operations'], status: 'paused' }
  ]);

  const [suppressionList] = useState<SuppressionEntry[]>([
    { id: 'S001', listName: 'Hard Bounces', type: 'email', source: 'bounce', autoExpiry: 'Never', status: 'active' },
    { id: 'S002', listName: 'Spam Complaints', type: 'email', source: 'complaint', autoExpiry: 'Never', status: 'active' },
    { id: 'S003', listName: 'Manual Exclusions', type: 'email', source: 'manual', autoExpiry: '90 days', status: 'active' },
    { id: 'S004', listName: 'Invalid Phone Numbers', type: 'phone', source: 'bounce', autoExpiry: 'Never', status: 'active' }
  ]);

  const [rateLimitRules] = useState<RateLimitRule[]>([
    { id: 'RL001', entityType: 'User', maxActions: 100, timeWindow: '1 hour', scope: 'Organization', enforcementMode: 'throttle', status: 'active' },
    { id: 'RL002', entityType: 'Campaign', maxActions: 50000, timeWindow: '1 day', scope: 'Campaign', enforcementMode: 'block', status: 'active' },
    { id: 'RL003', entityType: 'API Key', maxActions: 1000, timeWindow: '1 minute', scope: 'API', enforcementMode: 'throttle', status: 'active' }
  ]);

  const tabs = [
    { id: 'quiet-hours' as TabType, icon: Clock, label: 'Quiet Hours & Time Windows' },
    { id: 'rate-limiting' as TabType, icon: Zap, label: 'Rate Limiting' },
    { id: 'suppression' as TabType, icon: Ban, label: 'Suppression Rules' },
    { id: 'channel-safety' as TabType, icon: Shield, label: 'Channel Safety Rules' },
    { id: 'fallback' as TabType, icon: Settings, label: 'Fallback & Failure Handling' },
    { id: 'abuse' as TabType, icon: AlertTriangle, label: 'Abuse Prevention' },
    { id: 'audit' as TabType, icon: Activity, label: 'Audit & Monitoring' }
  ];

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Delivery & Safety settings saved successfully');
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
            <span className="text-slate-900 font-medium">Delivery & Safety Controls</span>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Delivery & Safety Controls
              </h1>
              <p className="text-sm text-slate-500">
                Advanced delivery rules, rate limits, suppression management, and safety controls
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Eye size={16} />
                View Audit Logs
              </Button>
              <Button variant="outline" className="gap-2">
                <Play size={16} />
                Test Delivery Rules
              </Button>
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

          {/* Horizontal Tabs */}
          <div className="border-b-2 border-slate-200 bg-slate-50 -mx-8 px-8">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-0.5",
                      isActive
                        ? "text-blue-600 border-blue-500"
                        : "text-slate-600 border-transparent hover:text-slate-900"
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {activeTab === 'quiet-hours' && (
          <QuietHoursTab
            settings={settings}
            handleSettingChange={handleSettingChange}
            regionRules={regionRules}
            setShowAddRegion={setShowAddRegion}
          />
        )}

        {activeTab === 'rate-limiting' && (
          <RateLimitingTab
            settings={settings}
            handleSettingChange={handleSettingChange}
            rateLimitRules={rateLimitRules}
          />
        )}

        {activeTab === 'suppression' && (
          <SuppressionTab
            settings={settings}
            handleSettingChange={handleSettingChange}
            suppressionList={suppressionList}
            setShowAddSuppression={setShowAddSuppression}
          />
        )}

        {activeTab === 'channel-safety' && (
          <ChannelSafetyTab settings={settings} handleSettingChange={handleSettingChange} />
        )}

        {activeTab === 'fallback' && (
          <FallbackTab settings={settings} handleSettingChange={handleSettingChange} />
        )}

        {activeTab === 'abuse' && (
          <AbusePreventionTab settings={settings} handleSettingChange={handleSettingChange} />
        )}

        {activeTab === 'audit' && (
          <AuditTab />
        )}
      </div>

      {/* Dialogs */}
      <AddRegionDialog open={showAddRegion} onOpenChange={setShowAddRegion} />
      <AddSuppressionDialog open={showAddSuppression} onOpenChange={setShowAddSuppression} />
    </div>
  );
};

// ==================== TAB COMPONENTS ====================

const QuietHoursTab = ({ settings, handleSettingChange, regionRules, setShowAddRegion }: any) => {
  return (
    <div className="space-y-6">
      {/* Global Quiet Hours */}
      <ContentCard title="Global Quiet Hours" description="Configure default quiet hours applied to all communications">
        <div className="space-y-5">
          <SwitchField
            label="Enable Quiet Hours"
            description="Prevent sending communications during specified hours"
            checked={settings.quietHoursEnabled}
            onCheckedChange={(val) => handleSettingChange('quietHoursEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Active</Badge>}
          />

          {settings.quietHoursEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Time">
                  <Input type="time" value={settings.quietHoursStart} onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)} />
                </FormField>
                <FormField label="End Time">
                  <Input type="time" value={settings.quietHoursEnd} onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)} />
                </FormField>
              </div>

              <FormField label="Timezone">
                <Select value={settings.quietHoursTimezone} onValueChange={(val) => handleSettingChange('quietHoursTimezone', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global Organization Timezone</SelectItem>
                    <SelectItem value="user">User's Timezone (Recommended)</SelectItem>
                    <SelectItem value="region">Region-Based Rules</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Days of Week">
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <Badge key={day} variant="outline" className="cursor-pointer bg-blue-50 text-blue-700 border-blue-200">
                      {day}
                    </Badge>
                  ))}
                </div>
              </FormField>

              <Separator />

              <div className="space-y-2">
                <SwitchField
                  label="Holiday Override"
                  description="Extend quiet hours on public holidays"
                  checked={settings.holidayOverride}
                  onCheckedChange={(val) => handleSettingChange('holidayOverride', val)}
                />
                <SwitchField
                  label="Emergency Bypass"
                  description="Allow critical system alerts during quiet hours"
                  checked={settings.emergencyBypass}
                  onCheckedChange={(val) => handleSettingChange('emergencyBypass', val)}
                  badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
                />
                <SwitchField
                  label="Apply to All Channels"
                  description="Email, SMS, Push, WhatsApp, System Alerts"
                  checked={settings.applyToAllChannels}
                  onCheckedChange={(val) => handleSettingChange('applyToAllChannels', val)}
                />
              </div>
            </>
          )}
        </div>
      </ContentCard>

      {/* Regional Time Windows */}
      <ContentCard
        title="Regional Time Windows"
        description="Override quiet hours for specific regions and timezones"
        action={
          <Button onClick={() => setShowAddRegion(true)} variant="outline" size="sm" className="gap-2">
            <Plus size={14} />
            Add Region Rule
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timezone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Allowed Window</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Blocked Window</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Override Roles</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {regionRules.map((rule: RegionRule) => (
                <RegionRuleRow key={rule.id} rule={rule} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const RateLimitingTab = ({ settings, handleSettingChange, rateLimitRules }: any) => {
  return (
    <div className="space-y-6">
      {/* Global Rate Limits */}
      <ContentCard title="Global Rate Limits" description="Default limits applied across all users and channels">
        <div className="space-y-5">
          <SwitchField
            label="Enable Rate Limiting"
            description="Protect system resources and prevent abuse"
            checked={settings.rateLimitingEnabled}
            onCheckedChange={(val) => handleSettingChange('rateLimitingEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Enabled</Badge>}
          />

          {settings.rateLimitingEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Messages per User per Hour">
                  <Input type="number" value={settings.defaultMessagesPerHour} onChange={(e) => handleSettingChange('defaultMessagesPerHour', parseInt(e.target.value))} />
                </FormField>
                <FormField label="Messages per User per Day">
                  <Input type="number" value={settings.defaultMessagesPerDay} onChange={(e) => handleSettingChange('defaultMessagesPerDay', parseInt(e.target.value))} />
                </FormField>
              </div>

              <Separator />

              <h3 className="text-sm font-semibold text-slate-900">Burst Protection</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Burst Limit">
                  <Input type="number" value={settings.burstLimit} onChange={(e) => handleSettingChange('burstLimit', parseInt(e.target.value))} />
                  <p className="text-xs text-slate-500 mt-1">Max messages in burst window</p>
                </FormField>
                <FormField label="Burst Window (minutes)">
                  <Input type="number" value={settings.burstWindow} onChange={(e) => handleSettingChange('burstWindow', parseInt(e.target.value))} />
                </FormField>
                <FormField label="Cooldown Duration (seconds)">
                  <Input type="number" value={settings.cooldownDuration} onChange={(e) => handleSettingChange('cooldownDuration', parseInt(e.target.value))} />
                </FormField>
              </div>
            </>
          )}
        </div>
      </ContentCard>

      {/* Per-Channel Limits */}
      <ContentCard title="Per-Channel Rate Limits" description="Specific limits for each communication channel">
        <div className="space-y-4">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={20} className="text-blue-600" />
              <h4 className="font-semibold text-slate-900">Email</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="RPM (Requests per Minute)">
                <Input type="number" value={settings.emailRPM} onChange={(e) => handleSettingChange('emailRPM', parseInt(e.target.value))} />
              </FormField>
              <FormField label="RPH (Requests per Hour)">
                <Input type="number" value={settings.emailRPH} onChange={(e) => handleSettingChange('emailRPH', parseInt(e.target.value))} />
              </FormField>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <Smartphone size={20} className="text-green-600" />
              <h4 className="font-semibold text-slate-900">SMS</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="RPM (Requests per Minute)">
                <Input type="number" value={settings.smsRPM} onChange={(e) => handleSettingChange('smsRPM', parseInt(e.target.value))} />
              </FormField>
              <FormField label="RPH (Requests per Hour)">
                <Input type="number" value={settings.smsRPH} onChange={(e) => handleSettingChange('smsRPH', parseInt(e.target.value))} />
              </FormField>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <Bell size={20} className="text-purple-600" />
              <h4 className="font-semibold text-slate-900">Push Notifications</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="RPM (Requests per Minute)">
                <Input type="number" value={settings.pushRPM} onChange={(e) => handleSettingChange('pushRPM', parseInt(e.target.value))} />
              </FormField>
              <FormField label="RPH (Requests per Hour)">
                <Input type="number" value={settings.pushRPH} onChange={(e) => handleSettingChange('pushRPH', parseInt(e.target.value))} />
              </FormField>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* Rate Limit Rules Table */}
      <ContentCard
        title="Entity-Specific Rate Limit Rules"
        description="Custom rate limits for specific entities and scopes"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Plus size={14} />
            Add Rule
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Entity Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Max Actions</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Time Window</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Scope</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Enforcement</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rateLimitRules.map((rule: RateLimitRule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-600" />
                      <span className="font-medium text-slate-900">{rule.entityType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-slate-700">{rule.maxActions.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{rule.timeWindow}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {rule.scope}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      rule.enforcementMode === 'block' ? 'bg-red-50 text-red-700 border-red-200' :
                      rule.enforcementMode === 'throttle' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                      {rule.enforcementMode.charAt(0).toUpperCase() + rule.enforcementMode.slice(1)}
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
                    <Button variant="ghost" size="sm" className="h-8">
                      <Edit size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>Rate Limiting Strategy:</strong> Block immediately stops requests, Throttle queues and delays them, Alert logs but allows requests. Choose based on your abuse prevention needs.
          </div>
        </div>
      </div>
    </div>
  );
};

const SuppressionTab = ({ settings, handleSettingChange, suppressionList, setShowAddSuppression }: any) => {
  return (
    <div className="space-y-6">
      {/* Auto-Suppression Rules */}
      <ContentCard title="Auto-Suppression Rules" description="Automatic suppression triggers based on delivery failures">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Auto-Suppress After Bounces">
              <Input
                type="number"
                value={settings.autoSuppressAfterBounces}
                onChange={(e) => handleSettingChange('autoSuppressAfterBounces', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Number of consecutive bounces before suppression</p>
            </FormField>
            <FormField label="Auto-Suppress After Complaints">
              <Input
                type="number"
                value={settings.autoSuppressAfterComplaints}
                onChange={(e) => handleSettingChange('autoSuppressAfterComplaints', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Number of spam complaints before suppression</p>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Temporary Suppression Duration (days)">
              <Input
                type="number"
                value={settings.tempSuppressionDuration}
                onChange={(e) => handleSettingChange('tempSuppressionDuration', parseInt(e.target.value))}
              />
            </FormField>
          </div>

          <Separator />

          <SwitchField
            label="Enable Permanent Suppression"
            description="Some violations result in permanent blocking (e.g., spam complaints)"
            checked={settings.permanentSuppressionEnabled}
            onCheckedChange={(val) => handleSettingChange('permanentSuppressionEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </div>
      </ContentCard>

      {/* Suppression Lists Table */}
      <ContentCard
        title="Suppression Lists"
        description="Active suppression lists preventing delivery to specific recipients"
        action={
          <Button onClick={() => setShowAddSuppression(true)} variant="outline" size="sm" className="gap-2">
            <Plus size={14} />
            Add Suppression List
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">List Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Auto-Expiry</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {suppressionList.map((entry: SuppressionEntry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Ban size={14} className="text-red-600" />
                      <span className="font-medium text-slate-900">{entry.listName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      entry.type === 'email' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      entry.type === 'phone' ? 'bg-green-50 text-green-700 border-green-200' :
                      entry.type === 'domain' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      entry.source === 'manual' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      entry.source === 'bounce' ? 'bg-red-50 text-red-700 border-red-200' :
                      entry.source === 'complaint' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {entry.source.charAt(0).toUpperCase() + entry.source.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{entry.autoExpiry}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      entry.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {entry.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Download size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Edit size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>Suppression Safety:</strong> Permanent suppression lists (bounces, complaints) cannot be manually overridden to maintain sender reputation and legal compliance.
          </div>
        </div>
      </div>
    </div>
  );
};

const ChannelSafetyTab = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentCard title="Content Filtering & Safety" description="Content validation and safety controls">
      <div className="space-y-4">
        <SwitchField
          label="Keyword Blocking Enabled"
          description="Block messages containing prohibited keywords"
          checked={settings.keywordBlockingEnabled}
          onCheckedChange={(val) => handleSettingChange('keywordBlockingEnabled', val)}
        />

        <SwitchField
          label="Regex Pattern Blocking"
          description="Advanced pattern matching for content filtering"
          checked={settings.regexBlockingEnabled}
          onCheckedChange={(val) => handleSettingChange('regexBlockingEnabled', val)}
        />

        <FormField label="Maximum Message Size (bytes)">
          <Input
            type="number"
            value={settings.maxMessageSize}
            onChange={(e) => handleSettingChange('maxMessageSize', parseInt(e.target.value))}
          />
          <p className="text-xs text-slate-500 mt-1">Maximum allowed message size including attachments</p>
        </FormField>

        <SwitchField
          label="Attachment Restrictions Enabled"
          description="Control allowed file types and sizes for attachments"
          checked={settings.attachmentRestrictionsEnabled}
          onCheckedChange={(val) => handleSettingChange('attachmentRestrictionsEnabled', val)}
        />
      </div>
    </ContentCard>
  );
};

const FallbackTab = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <ContentCard title="Retry Configuration" description="Automatic retry logic for failed deliveries">
        <div className="space-y-4">
          <FormField label="Retry Attempts">
            <Input
              type="number"
              value={settings.retryAttempts}
              onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1">Maximum number of retry attempts</p>
          </FormField>

          <FormField label="Retry Intervals (minutes)">
            <Input
              value={settings.retryIntervals}
              onChange={(e) => handleSettingChange('retryIntervals', e.target.value)}
              placeholder="1,5,15"
            />
            <p className="text-xs text-slate-500 mt-1">Comma-separated intervals between retries</p>
          </FormField>

          <SwitchField
            label="Exponential Backoff"
            description="Increase delay between retries exponentially"
            checked={settings.exponentialBackoff}
            onCheckedChange={(val) => handleSettingChange('exponentialBackoff', val)}
          />

          <FormField label="Maximum Retry Window (hours)">
            <Input
              type="number"
              value={settings.maxRetryWindow}
              onChange={(e) => handleSettingChange('maxRetryWindow', parseInt(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1">Maximum time to continue retry attempts</p>
          </FormField>
        </div>
      </ContentCard>

      <ContentCard title="Approval Requirements" description="Bulk campaign approval settings">
        <div className="space-y-4">
          <SwitchField
            label="Require Approval for Bulk Campaigns"
            description="Campaigns exceeding threshold require approval before sending"
            checked={settings.requireApprovalForBulk}
            onCheckedChange={(val) => handleSettingChange('requireApprovalForBulk', val)}
          />

          {settings.requireApprovalForBulk && (
            <>
              <FormField label="Bulk Campaign Threshold">
                <Input
                  type="number"
                  value={settings.bulkThreshold}
                  onChange={(e) => handleSettingChange('bulkThreshold', parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-500 mt-1">Number of recipients that triggers approval requirement</p>
              </FormField>

              <SwitchField
                label="Auto-Expire Approvals"
                description="Automatically expire pending approvals after 48 hours"
                checked={settings.autoExpireApprovals}
                onCheckedChange={(val) => handleSettingChange('autoExpireApprovals', val)}
              />
            </>
          )}
        </div>
      </ContentCard>
    </div>
  );
};

const AbusePreventionTab = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentCard title="Abuse Detection Systems" description="Automated abuse and anomaly detection">
      <div className="space-y-4">
        <SwitchField
          label="Volume Spike Detection"
          description="Alert on unusual sending volume patterns"
          checked={settings.volumeSpikeDetection}
          onCheckedChange={(val) => handleSettingChange('volumeSpikeDetection', val)}
          badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
        />

        <SwitchField
          label="Geo-Anomaly Detection"
          description="Detect suspicious geographical patterns"
          checked={settings.geoAnomalyDetection}
          onCheckedChange={(val) => handleSettingChange('geoAnomalyDetection', val)}
        />

        <SwitchField
          label="Auto-Lock Suspicious Campaigns"
          description="Automatically pause campaigns detected as potential abuse"
          checked={settings.autoLockCampaigns}
          onCheckedChange={(val) => handleSettingChange('autoLockCampaigns', val)}
        />

        {settings.autoLockCampaigns && (
          <FormField label="Lock Duration (hours)">
            <Input
              type="number"
              value={settings.lockDuration}
              onChange={(e) => handleSettingChange('lockDuration', parseInt(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1">How long campaigns remain locked for review</p>
          </FormField>
        )}
      </div>
    </ContentCard>
  );
};

const AuditTab = () => {
  const logs = [
    { id: 1, timestamp: '2024-12-20 14:32:15', event: 'Quiet Hours Triggered', user: 'System', rule: 'Global Quiet Hours', action: 'Queued 45 messages', status: 'success' },
    { id: 2, timestamp: '2024-12-20 13:15:22', event: 'Rate Limit Exceeded', user: 'user@example.com', rule: 'User Rate Limit', action: 'Throttled request', status: 'throttled' },
    { id: 3, timestamp: '2024-12-20 11:42:10', event: 'Suppression Applied', user: 'System', rule: 'Hard Bounce List', action: 'Blocked 3 recipients', status: 'blocked' },
    { id: 4, timestamp: '2024-12-20 10:20:05', event: 'Regional Override', user: 'admin@nisau.org', rule: 'UK Region Rule', action: 'Allowed outside quiet hours', status: 'success' },
    { id: 5, timestamp: '2024-12-19 16:55:33', event: 'Rate Limit Reset', user: 'System', rule: 'Daily Limit Reset', action: 'Reset user quotas', status: 'success' },
    { id: 6, timestamp: '2024-12-19 14:12:18', event: 'Abuse Detection', user: 'System', rule: 'Volume Spike Detection', action: 'Flagged campaign for review', status: 'blocked' },
    { id: 7, timestamp: '2024-12-19 11:30:42', event: 'Emergency Bypass', user: 'admin@nisau.org', rule: 'Emergency Alerts', action: 'Sent critical notification', status: 'success' },
    { id: 8, timestamp: '2024-12-19 09:15:11', event: 'Suppression Auto-Added', user: 'System', rule: 'Bounce Detection', action: 'Added 12 emails to suppression', status: 'success' },
    { id: 9, timestamp: '2024-12-18 17:22:55', event: 'Retry Exhausted', user: 'System', rule: 'Max Retry Attempts', action: 'Failed after 3 retries', status: 'blocked' },
    { id: 10, timestamp: '2024-12-18 15:10:33', event: 'Bulk Approval Required', user: 'campaign@nisau.org', rule: 'Bulk Threshold', action: 'Campaign pending approval', status: 'throttled' }
  ];

  return (
    <ContentCard title="Recent Activity" description="Audit trail of delivery rule enforcement and safety actions">
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Event</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Rule</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Action Taken</th>
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
                  <span className="text-sm font-medium text-slate-900">{log.event}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{log.user}</span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {log.rule}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-slate-600">{log.action}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={
                    log.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                    log.status === 'blocked' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-orange-50 text-orange-700 border-orange-200'
                  }>
                    {log.status === 'success' && <CheckCircle2 size={10} className="mr-1" />}
                    {log.status === 'blocked' && <XCircle size={10} className="mr-1" />}
                    {log.status === 'throttled' && <Clock size={10} className="mr-1" />}
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContentCard>
  );
};

// ==================== HELPER COMPONENTS ====================

const RegionRuleRow = ({ rule }: { rule: RegionRule }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-blue-600" />
          <span className="font-medium text-slate-900">{rule.region}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {rule.timezone}
        </code>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-600" />
          <span className="text-sm text-slate-700">{rule.allowedWindow}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Ban size={14} className="text-red-600" />
          <span className="text-sm text-slate-700">{rule.blockedWindow}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {rule.overrideRoles.map((role, idx) => (
            <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              {role}
            </Badge>
          ))}
        </div>
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

const FormField = ({ label, helper, children }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
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

const AddRegionDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Regional Time Window</DialogTitle>
          <DialogDescription>
            Create region-specific quiet hours override
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Region Name *</Label>
            <Input placeholder="e.g., Europe - London" />
          </div>

          <div className="space-y-2">
            <Label>Timezone *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Allowed Start</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label>Allowed End</Label>
              <Input type="time" defaultValue="22:00" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Regional time window added successfully');
            onOpenChange(false);
          }}>
            Add Region Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddSuppressionDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Suppression List</DialogTitle>
          <DialogDescription>
            Create a new suppression list or import existing
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>List Name *</Label>
            <Input placeholder="e.g., Custom Exclusions" />
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="user-id">User ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Auto-Expiry</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Suppression list created successfully');
            onOpenChange(false);
          }}>
            Create List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
