import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plug, Code, Key, Zap, Database, Shield, Activity, FileText, Plus, Search,
  Save, X, Edit, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, CheckCircle2,
  XCircle, AlertCircle, Info, AlertTriangle, Download, Upload, Settings, Copy,
  RefreshCw, Filter, MoreVertical, Lock, Unlock, Send, ExternalLink, Terminal,
  Globe, Webhook, GitBranch, ShoppingBag, TrendingUp, Clock, Power, PowerOff,
  Play, Pause, RotateCw
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
  | 'installed-integrations'
  | 'marketplace'
  | 'custom-integrations'
  | 'api-keys'
  | 'oauth-clients'
  | 'scopes-permissions'
  | 'webhooks'
  | 'event-subscriptions'
  | 'retry-failure'
  | 'data-sync'
  | 'field-mapping'
  | 'transformation'
  | 'rate-limits'
  | 'ip-whitelist'
  | 'secrets-management'
  | 'api-logs'
  | 'integration-health'
  | 'audit-trail';

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: 'CRM' | 'Payments' | 'Events' | 'Marketing' | 'Government' | 'Analytics';
  status: 'connected' | 'error' | 'disabled';
  lastSync: string;
  description: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'sandbox';
  status: 'active' | 'revoked' | 'expired';
  createdBy: string;
  lastUsed: string;
  expiryDate: string;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered: string;
  successRate: number;
}

export const IntegrationsAPIsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('installed-integrations');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [showCreateAPIKey, setShowCreateAPIKey] = useState(false);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    // Rate Limits
    globalRateLimit: 1000,
    burstLimit: 100,
    
    // Sync
    syncFrequency: 'hourly',
    conflictResolution: 'latest-wins',
    
    // Retry
    retryAttempts: 3,
    backoffStrategy: 'exponential',
    
    // Security
    ipWhitelistEnabled: false,
    secretRotationEnabled: true,
    rotationDays: 90,
    
    // OAuth
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '30d'
  });

  const [integrations] = useState<Integration[]>([
    { id: 'INT001', name: 'Stripe', logo: '💳', category: 'Payments', status: 'connected', lastSync: '2 minutes ago', description: 'Payment processing and invoicing' },
    { id: 'INT002', name: 'Salesforce', logo: '☁️', category: 'CRM', status: 'connected', lastSync: '15 minutes ago', description: 'Customer relationship management' },
    { id: 'INT003', name: 'Eventbrite', logo: '🎫', category: 'Events', status: 'error', lastSync: '2 hours ago', description: 'Event ticketing and registration' },
    { id: 'INT004', name: 'Mailchimp', logo: '📧', category: 'Marketing', status: 'connected', lastSync: '30 minutes ago', description: 'Email marketing automation' },
    { id: 'INT005', name: 'Google Analytics', logo: '📊', category: 'Analytics', status: 'connected', lastSync: '5 minutes ago', description: 'Web analytics and reporting' }
  ]);

  const [apiKeys] = useState<APIKey[]>([
    { id: 'KEY001', name: 'Production API Key', key: 'sk_live_xxxxxxxxxxxx', environment: 'production', status: 'active', createdBy: 'John Smith', lastUsed: '2 hours ago', expiryDate: '2025-06-20' },
    { id: 'KEY002', name: 'Sandbox Testing Key', key: 'sk_test_xxxxxxxxxxxx', environment: 'sandbox', status: 'active', createdBy: 'Sarah Johnson', lastUsed: '5 minutes ago', expiryDate: '2025-03-15' },
    { id: 'KEY003', name: 'Legacy Integration Key', key: 'sk_live_yyyyyyyyyyyy', environment: 'production', status: 'revoked', createdBy: 'Michael Chen', lastUsed: '30 days ago', expiryDate: '2024-12-01' }
  ]);

  const [webhooks] = useState<WebhookEndpoint[]>([
    { id: 'WH001', url: 'https://api.partner.com/webhooks/nisau', events: ['payment.success', 'event.created'], status: 'active', lastTriggered: '5 minutes ago', successRate: 99.2 },
    { id: 'WH002', url: 'https://crm.company.com/integrations/hooks', events: ['user.created', 'registration.completed'], status: 'active', lastTriggered: '1 hour ago', successRate: 98.7 },
    { id: 'WH003', url: 'https://analytics.service.com/events', events: ['event.updated', 'form.submitted'], status: 'error', lastTriggered: '3 days ago', successRate: 45.3 }
  ]);

  const menuStructure = [
    {
      category: 'Core Integrations',
      items: [
        { id: 'installed-integrations' as SectionType, label: 'Installed Integrations', status: 'configured', icon: Plug },
        { id: 'marketplace' as SectionType, label: 'Integration Marketplace', status: 'configured', icon: ShoppingBag },
        { id: 'custom-integrations' as SectionType, label: 'Custom Integrations', status: 'not-set', icon: Code }
      ]
    },
    {
      category: 'API & Developer Access',
      items: [
        { id: 'api-keys' as SectionType, label: 'API Keys', status: 'configured', icon: Key },
        { id: 'oauth-clients' as SectionType, label: 'OAuth Clients', status: 'configured', icon: Lock },
        { id: 'scopes-permissions' as SectionType, label: 'Scopes & Permissions', status: 'configured', icon: Shield }
      ]
    },
    {
      category: 'Webhooks & Events',
      items: [
        { id: 'webhooks' as SectionType, label: 'Webhooks', status: 'attention', icon: Webhook },
        { id: 'event-subscriptions' as SectionType, label: 'Event Subscriptions', status: 'configured', icon: Zap },
        { id: 'retry-failure' as SectionType, label: 'Retry & Failure Handling', status: 'configured', icon: RefreshCw }
      ]
    },
    {
      category: 'Data & Sync Controls',
      items: [
        { id: 'data-sync' as SectionType, label: 'Data Sync Rules', status: 'configured', icon: Database },
        { id: 'field-mapping' as SectionType, label: 'Field Mapping', status: 'configured', icon: GitBranch },
        { id: 'transformation' as SectionType, label: 'Transformation Logic', status: 'not-set', icon: Settings }
      ]
    },
    {
      category: 'Security & Governance',
      items: [
        { id: 'rate-limits' as SectionType, label: 'Rate Limits & Throttling', status: 'configured', icon: TrendingUp },
        { id: 'ip-whitelist' as SectionType, label: 'IP Whitelisting', status: 'not-set', icon: Shield },
        { id: 'secrets-management' as SectionType, label: 'Secrets Management', status: 'configured', icon: Lock }
      ]
    },
    {
      category: 'Monitoring & Auditing',
      items: [
        { id: 'api-logs' as SectionType, label: 'API Logs', status: 'configured', icon: FileText },
        { id: 'integration-health' as SectionType, label: 'Integration Health', status: 'configured', icon: Activity },
        { id: 'audit-trail' as SectionType, label: 'Audit Trail', status: 'configured', icon: FileText }
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
    toast.success('Integrations settings saved successfully');
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    toast.info('Changes discarded');
    setHasChanges(false);
  };

  const getStatusDot = (status: string) => {
    if (status === 'configured') return 'bg-green-500';
    if (status === 'attention') return 'bg-amber-500';
    return 'bg-slate-300';
  };

  const filteredMenu = menuStructure.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(sidebarSearch.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

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
            <span className="text-slate-900 font-medium">Integrations & APIs</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Integrations & APIs
              </h1>
              <p className="text-sm text-slate-500">
                Third-party integrations, API access, webhooks, and developer tools
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Activity size={16} />
                View API Logs
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowCreateAPIKey(true)}>
                <Key size={16} />
                Create API Key
              </Button>
              <Button className="gap-2" onClick={() => setShowAddIntegration(true)}>
                <Plus size={16} />
                Add Integration
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
              {/* Sidebar Search */}
              <div className="p-3 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <Input
                    placeholder="Search integrations..."
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
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`} />
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
            {activeSection === 'installed-integrations' && (
              <InstalledIntegrationsSection integrations={integrations} setShowAddIntegration={setShowAddIntegration} />
            )}

            {activeSection === 'marketplace' && (
              <MarketplaceSection />
            )}

            {activeSection === 'api-keys' && (
              <APIKeysSection apiKeys={apiKeys} setShowCreateAPIKey={setShowCreateAPIKey} showKeyValue={showKeyValue} setShowKeyValue={setShowKeyValue} />
            )}

            {activeSection === 'oauth-clients' && (
              <OAuthClientsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'webhooks' && (
              <WebhooksSection webhooks={webhooks} setShowAddWebhook={setShowAddWebhook} />
            )}

            {activeSection === 'rate-limits' && (
              <RateLimitsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'secrets-management' && (
              <SecretsManagementSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {/* Placeholder sections */}
            {['custom-integrations', 'scopes-permissions', 'event-subscriptions', 'retry-failure', 'data-sync', 'field-mapping', 'transformation', 'ip-whitelist', 'api-logs', 'integration-health', 'audit-trail'].includes(activeSection) && (
              <PlaceholderSection title={menuStructure.flatMap(c => c.items).find(i => i.id === activeSection)?.label || ''} />
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
      <AddIntegrationDialog open={showAddIntegration} onOpenChange={setShowAddIntegration} />
      <CreateAPIKeyDialog open={showCreateAPIKey} onOpenChange={setShowCreateAPIKey} />
      <AddWebhookDialog open={showAddWebhook} onOpenChange={setShowAddWebhook} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const InstalledIntegrationsSection = ({ integrations, setShowAddIntegration }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Installed Integrations</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your active third-party integrations</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {integrations.length} Active
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-4">Last synced: 2 minutes ago</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Integrations" value="5" icon={Plug} color="blue" />
        <StatCard label="Connected" value="4" icon={CheckCircle2} color="green" />
        <StatCard label="Errors" value="1" icon={XCircle} color="red" />
        <StatCard label="Data Synced" value="12.4K" icon={Database} color="purple" />
      </div>

      {/* Integrations Grid */}
      <ContentCard
        title="Active Integrations"
        description="Your connected third-party services"
        action={
          <Button onClick={() => setShowAddIntegration(true)} className="gap-2">
            <Plus size={16} />
            Add Integration
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {integrations.map((integration: Integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </ContentCard>
    </div>
  );
};

const MarketplaceSection = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Integration Marketplace</h2>
            <p className="text-sm text-slate-500 mt-1">Browse and install integrations from our catalog</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">47 Available</Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input placeholder="Search integrations..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="crm">CRM</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter size={16} />
          Filters
        </Button>
      </div>

      <ContentCard title="Available Integrations" description="Browse and install third-party services">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-900">Integration Name {i}</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Official</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Category</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-3">Integration description and key features</p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">read:events</Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">write:data</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">Install</Button>
            </div>
          ))}
        </div>
      </ContentCard>
    </div>
  );
};

const APIKeysSection = ({ apiKeys, setShowCreateAPIKey, showKeyValue, setShowKeyValue }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
            <p className="text-sm text-slate-500 mt-1">Manage API keys for programmatic access</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-4">Last updated by Dev Team on 2024-12-18 at 14:30</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900 mb-1">Security Best Practices</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Never share API keys in public repositories or client-side code</li>
              <li>• Rotate keys regularly (recommended every 90 days)</li>
              <li>• Use sandbox keys for testing, production keys only in live environments</li>
            </ul>
          </div>
        </div>
      </div>

      <ContentCard
        title="Active API Keys"
        description="Keys with programmatic access to your data"
        action={
          <Button onClick={() => setShowCreateAPIKey(true)} className="gap-2">
            <Plus size={16} />
            Create API Key
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Key Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Key</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Environment</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Last Used</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Expires</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {apiKeys.map((apiKey: APIKey) => (
                <APIKeyRow key={apiKey.id} apiKey={apiKey} showKeyValue={showKeyValue} setShowKeyValue={setShowKeyValue} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      <ContentCard title="API Documentation" description="Learn how to use our APIs">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">API Reference</h4>
              <p className="text-xs text-blue-700">Complete documentation with examples and SDKs</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink size={14} />
            View Docs
          </Button>
        </div>
      </ContentCard>
    </div>
  );
};

const OAuthClientsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">OAuth Clients</h2>
            <p className="text-sm text-slate-500 mt-1">Manage OAuth 2.0 client applications</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="OAuth Clients"
        description="Registered OAuth 2.0 applications"
        action={
          <Button className="gap-2">
            <Plus size={16} />
            Create OAuth Client
          </Button>
        }
      >
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-slate-900">OAuth Client {i}</h4>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Client ID</p>
                      <code className="text-xs font-mono text-slate-700">client_abc123xyz{i}</code>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Grant Types</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-mono">authorization_code</Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-mono">refresh_token</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Redirect URIs</p>
                      <code className="text-xs font-mono text-slate-700 block">https://app.example.com/callback</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ContentCard>

      <ContentCard title="Token Settings" description="Configure token expiration times">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Access Token Expiry">
            <Select value={settings.accessTokenExpiry} onValueChange={(val) => handleSettingChange('accessTokenExpiry', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="2h">2 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Refresh Token Expiry">
            <Select value={settings.refreshTokenExpiry} onValueChange={(val) => handleSettingChange('refreshTokenExpiry', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </ContentCard>
    </div>
  );
};

const WebhooksSection = ({ webhooks, setShowAddWebhook }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Webhooks</h2>
            <p className="text-sm text-slate-500 mt-1">Manage webhook endpoints and event notifications</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Attention</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-4">Last triggered: 5 minutes ago</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <XCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Webhook Failure Detected</h4>
            <p className="text-sm text-red-800">
              1 webhook endpoint has a success rate below 50%. Check the integration health section.
            </p>
          </div>
        </div>
      </div>

      <ContentCard
        title="Webhook Endpoints"
        description="URLs that receive event notifications"
        action={
          <Button onClick={() => setShowAddWebhook(true)} className="gap-2">
            <Plus size={16} />
            Add Webhook
          </Button>
        }
      >
        <div className="space-y-3">
          {webhooks.map((webhook: WebhookEndpoint) => (
            <WebhookCard key={webhook.id} webhook={webhook} />
          ))}
        </div>
      </ContentCard>

      <ContentCard title="Webhook Testing" description="Test your webhook endpoints">
        <div className="space-y-4">
          <FormField label="Select Event Type">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment.success">payment.success</SelectItem>
                <SelectItem value="event.created">event.created</SelectItem>
                <SelectItem value="user.created">user.created</SelectItem>
                <SelectItem value="registration.completed">registration.completed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Test Endpoint">
            <Input placeholder="https://your-api.com/webhooks" />
          </FormField>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Send size={16} />
              Send Test Event
            </Button>
            <Button variant="ghost" className="gap-2">
              <Eye size={16} />
              View Sample Payload
            </Button>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const RateLimitsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Rate Limits & Throttling</h2>
            <p className="text-sm text-slate-500 mt-1">Control API request rates and prevent abuse</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Global Rate Limits" description="Default limits for all API keys">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Requests Per Minute">
            <Input
              type="number"
              value={settings.globalRateLimit}
              onChange={(e) => handleSettingChange('globalRateLimit', parseInt(e.target.value))}
            />
          </FormField>
          <FormField label="Burst Control">
            <Input
              type="number"
              value={settings.burstLimit}
              onChange={(e) => handleSettingChange('burstLimit', parseInt(e.target.value))}
            />
          </FormField>
        </div>
      </ContentCard>

      <ContentCard title="Alert Thresholds" description="Set alerts when limits are approached">
        <FormField label="Alert When Usage Exceeds">
          <Select defaultValue="80">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="70">70%</SelectItem>
              <SelectItem value="80">80%</SelectItem>
              <SelectItem value="90">90%</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </ContentCard>
    </div>
  );
};

const SecretsManagementSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Secrets Management</h2>
            <p className="text-sm text-slate-500 mt-1">Secure storage and rotation of sensitive credentials</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Encrypted Vault</h4>
            <p className="text-sm text-blue-800">
              All secrets are encrypted at rest using AES-256 and access is logged for audit compliance.
            </p>
          </div>
        </div>
      </div>

      <ContentCard
        title="Stored Secrets"
        description="API keys, tokens, and credentials"
        action={
          <Button className="gap-2">
            <Plus size={16} />
            Add Secret
          </Button>
        }
      >
        <div className="space-y-3">
          {['Stripe API Secret', 'Salesforce Client Secret', 'AWS Access Key'].map((name, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900">{name}</h4>
                <p className="text-xs text-slate-500">Last rotated: {i + 1} months ago</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Edit size={14} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ContentCard>

      <ContentCard title="Auto-Rotation Settings" description="Automatically rotate secrets on schedule">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <label className="text-sm font-medium text-slate-900">Enable Auto-Rotation</label>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>
              </div>
              <p className="text-xs text-slate-500">Automatically rotate secrets on a schedule</p>
            </div>
            <Switch checked={settings.secretRotationEnabled} onCheckedChange={(val) => handleSettingChange('secretRotationEnabled', val)} />
          </div>

          {settings.secretRotationEnabled && (
            <FormField label="Rotation Schedule">
              <Select value={settings.rotationDays.toString()} onValueChange={(val) => handleSettingChange('rotationDays', parseInt(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Every 30 days</SelectItem>
                  <SelectItem value="60">Every 60 days</SelectItem>
                  <SelectItem value="90">Every 90 days (Recommended)</SelectItem>
                  <SelectItem value="180">Every 180 days</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}
        </div>
      </ContentCard>

      <ContentCard title="Access Control" description="Who can view and manage secrets">
        <div className="space-y-2">
          {[
            { role: 'Super Admins', access: 'Full Access', color: 'green' },
            { role: 'Developers', access: 'Read Only', color: 'blue' },
            { role: 'Event Managers', access: 'No Access', color: 'slate' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <span className="text-sm font-medium text-slate-900">{item.role}</span>
              <Badge variant="outline" className={
                item.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                item.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }>
                {item.access}
              </Badge>
            </div>
          ))}
        </div>
      </ContentCard>
    </div>
  );
};

const PlaceholderSection = ({ title }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">Configuration section coming soon</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title={title} description="This feature is currently under development">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Settings size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            This configuration section will be available in a future update.
          </p>
        </div>
      </ContentCard>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const IntegrationCard = ({ integration }: { integration: Integration }) => {
  const statusColors = {
    connected: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    disabled: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
            {integration.logo}
          </div>
          <div>
            <h4 className="font-medium text-slate-900">{integration.name}</h4>
            <p className="text-xs text-slate-500">{integration.category}</p>
          </div>
        </div>
        <Badge variant="outline" className={`${statusColors[integration.status]} text-xs capitalize`}>
          {integration.status}
        </Badge>
      </div>
      <p className="text-xs text-slate-600 mb-3">{integration.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Last sync: {integration.lastSync}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Settings size={14} />
          </Button>
          {integration.status === 'connected' ? (
            <Button variant="ghost" size="sm">
              <Pause size={14} />
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              <Play size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const APIKeyRow = ({ apiKey, showKeyValue, setShowKeyValue }: any) => {
  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    revoked: 'bg-red-50 text-red-700 border-red-200',
    expired: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const envColors = {
    production: 'bg-blue-50 text-blue-700 border-blue-200',
    sandbox: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{apiKey.name}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-slate-600">
            {showKeyValue === apiKey.id ? apiKey.key : '••••••••••••••••'}
          </code>
          <button
            onClick={() => setShowKeyValue(showKeyValue === apiKey.id ? null : apiKey.id)}
            className="text-slate-400 hover:text-slate-600"
          >
            {showKeyValue === apiKey.id ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(apiKey.key);
              toast.success('API key copied to clipboard');
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <Copy size={14} />
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={`${envColors[apiKey.environment]} text-xs capitalize`}>
          {apiKey.environment}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={`${statusColors[apiKey.status]} text-xs capitalize`}>
          {apiKey.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{apiKey.lastUsed}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{apiKey.expiryDate}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <RotateCw size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rotate Key</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="sm">
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const WebhookCard = ({ webhook }: { webhook: WebhookEndpoint }) => {
  const statusColors = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    error: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="p-4 border border-slate-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-mono text-slate-900">{webhook.url}</code>
            <Badge variant="outline" className={`${statusColors[webhook.status]} text-xs`}>
              {webhook.status}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {webhook.events.map((event, idx) => (
              <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-mono">
                {event}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Last triggered: {webhook.lastTriggered}</span>
            <span className={webhook.successRate > 90 ? 'text-green-600' : 'text-red-600'}>
              Success rate: {webhook.successRate}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <Button variant="ghost" size="sm">
            <Send size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
};

const ContentCard = ({ title, description, action, children }: any) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      </div>
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
};

const FormField = ({ label, required, helper, children, className }: any) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
};

// ==================== DIALOGS ====================

const AddIntegrationDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Integration</DialogTitle>
          <DialogDescription>
            Connect a third-party service to NISAU
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField label="Integration">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select integration..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="mailchimp">Mailchimp</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Configuration">
            <Textarea rows={4} placeholder="Enter configuration details..." />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Integration added successfully');
            onOpenChange(false);
          }}>
            Add Integration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateAPIKeyDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for programmatic access
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField label="Key Name" required>
            <Input placeholder="e.g., Production API Key" />
          </FormField>
          <FormField label="Environment" required>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select environment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="sandbox">Sandbox / Testing</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Expiry Date">
            <Input type="date" />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('API key created successfully');
            onOpenChange(false);
          }}>
            Create Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddWebhookDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Webhook</DialogTitle>
          <DialogDescription>
            Configure a new webhook endpoint for event notifications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField label="Endpoint URL" required>
            <Input placeholder="https://your-api.com/webhooks" />
          </FormField>
          <FormField label="Events" required>
            <div className="space-y-2">
              <Checkbox id="payment" />
              <label htmlFor="payment" className="text-sm ml-2">payment.success</label>
            </div>
            <div className="space-y-2">
              <Checkbox id="event" />
              <label htmlFor="event" className="text-sm ml-2">event.created</label>
            </div>
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Webhook added successfully');
            onOpenChange(false);
          }}>
            Add Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
