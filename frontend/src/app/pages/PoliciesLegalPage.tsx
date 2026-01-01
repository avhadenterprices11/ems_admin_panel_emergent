import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Scale, CheckCircle2, GitBranch, Globe, AlertTriangle, Shield,
  Database, Settings, Plus, Search, Save, X, Edit, Trash2, Eye, ChevronRight,
  ChevronDown, XCircle, AlertCircle, Info, Download, Copy, RefreshCw, Filter,
  Lock, Unlock, Clock, Users, FileCheck, FilePlus, Archive, ExternalLink,
  History, Flag, MapPin, Gavel, Target, Zap, Ban, GripVertical, Calendar,
  Ticket
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
  | 'policy-library'
  | 'assignment-rules'
  | 'consent-tracking'
  | 'versioning-control'
  | 'jurisdiction'
  | 'disclaimers-notices'
  | 'enforcement-rules'
  | 'legal-evidence'
  | 'advanced-system';

interface Policy {
  id: string;
  name: string;
  type: 'terms' | 'privacy' | 'code-of-conduct' | 'refund' | 'jury-ethics' | 'volunteer' | 'dpa' | 'event-specific' | 'award-specific';
  scope: 'global' | 'event' | 'ticket' | 'award' | 'role';
  status: 'draft' | 'active' | 'deprecated';
  currentVersion: string;
  lastUpdatedBy: string;
  lastUpdated: string;
  acceptanceCount?: number;
}

interface AssignmentRule {
  id: string;
  policyId: string;
  policyName: string;
  target: string;
  targetType: 'all-users' | 'role' | 'event' | 'ticket' | 'award' | 'payment';
  priority: number;
  status: 'active' | 'inactive';
}

interface ConsentRecord {
  id: string;
  userId: string;
  userName: string;
  policyId: string;
  policyName: string;
  version: string;
  timestamp: string;
  ipAddress: string;
  source: 'web' | 'app' | 'admin' | 'api';
  jurisdiction: string;
}

export const PoliciesLegalPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('policy-library');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const [settings, setSettings] = useState({
    // System
    legalSystemEnabled: true,
    apiAccessEnabled: true,
    webhookOnAcceptance: true,
    
    // Enforcement
    blockRegistration: true,
    blockTicketPurchase: true,
    softWarningOnly: false,
    
    // Consent
    acceptanceRequired: true,
    explicitCheckbox: true,
    captureIp: true,
    
    // Versioning
    forceReacceptanceOnMajor: true,
    
    // Retention
    consentRetentionYears: 10,
    legalHoldEnabled: false,
    
    // Jurisdiction
    autoMapByCountry: true,
    eventCountryOverride: true
  });

  const [policies] = useState<Policy[]>([
    { id: 'POL001', name: 'Terms of Service', type: 'terms', scope: 'global', status: 'active', currentVersion: 'v3.2', lastUpdatedBy: 'Legal Team', lastUpdated: '2024-11-15', acceptanceCount: 45230 },
    { id: 'POL002', name: 'Privacy Policy', type: 'privacy', scope: 'global', status: 'active', currentVersion: 'v2.8', lastUpdatedBy: 'Legal Team', lastUpdated: '2024-10-22', acceptanceCount: 45230 },
    { id: 'POL003', name: 'Code of Conduct', type: 'code-of-conduct', scope: 'global', status: 'active', currentVersion: 'v1.5', lastUpdatedBy: 'Compliance Team', lastUpdated: '2024-09-05', acceptanceCount: 12450 },
    { id: 'POL004', name: 'Refund & Cancellation Policy', type: 'refund', scope: 'global', status: 'active', currentVersion: 'v2.1', lastUpdatedBy: 'Finance Team', lastUpdated: '2024-08-12', acceptanceCount: 8920 },
    { id: 'POL005', name: 'Jury Ethics & Conflict of Interest', type: 'jury-ethics', scope: 'role', status: 'active', currentVersion: 'v1.3', lastUpdatedBy: 'Awards Team', lastUpdated: '2024-07-01', acceptanceCount: 342 },
    { id: 'POL006', name: 'Event Photography Consent', type: 'event-specific', scope: 'event', status: 'active', currentVersion: 'v1.0', lastUpdatedBy: 'Events Team', lastUpdated: '2024-12-01', acceptanceCount: 2150 },
    { id: 'POL007', name: 'GDPR Data Processing Agreement', type: 'dpa', scope: 'global', status: 'active', currentVersion: 'v4.0', lastUpdatedBy: 'Legal Team', lastUpdated: '2024-06-15', acceptanceCount: 45230 },
    { id: 'POL008', name: 'Legacy Terms (2022)', type: 'terms', scope: 'global', status: 'deprecated', currentVersion: 'v2.9', lastUpdatedBy: 'Legal Team', lastUpdated: '2022-12-31', acceptanceCount: 0 }
  ]);

  const [assignmentRules] = useState<AssignmentRule[]>([
    { id: 'RUL001', policyId: 'POL001', policyName: 'Terms of Service', target: 'All Users', targetType: 'all-users', priority: 1, status: 'active' },
    { id: 'RUL002', policyId: 'POL002', policyName: 'Privacy Policy', target: 'All Users', targetType: 'all-users', priority: 1, status: 'active' },
    { id: 'RUL003', policyId: 'POL005', policyName: 'Jury Ethics', target: 'Jury Members', targetType: 'role', priority: 2, status: 'active' },
    { id: 'RUL004', policyId: 'POL006', policyName: 'Event Photography Consent', target: 'Innovation Summit 2024', targetType: 'event', priority: 3, status: 'active' },
    { id: 'RUL005', policyId: 'POL004', policyName: 'Refund Policy', target: 'Paid Tickets', targetType: 'ticket', priority: 2, status: 'active' }
  ]);

  const [consentRecords] = useState<ConsentRecord[]>([
    { id: 'CNS001', userId: 'U12345', userName: 'Sarah Johnson', policyId: 'POL001', policyName: 'Terms of Service', version: 'v3.2', timestamp: '2024-12-18 14:32:15', ipAddress: '185.23.45.67', source: 'web', jurisdiction: 'EU' },
    { id: 'CNS002', userId: 'U12346', userName: 'Michael Chen', policyId: 'POL002', policyName: 'Privacy Policy', version: 'v2.8', timestamp: '2024-12-18 14:30:42', ipAddress: '92.45.123.89', source: 'web', jurisdiction: 'UK' },
    { id: 'CNS003', userId: 'U12347', userName: 'Dr. Emma Wilson', policyId: 'POL005', policyName: 'Jury Ethics', version: 'v1.3', timestamp: '2024-12-18 14:15:23', ipAddress: '203.45.67.12', source: 'app', jurisdiction: 'IN' },
    { id: 'CNS004', userId: 'U12348', userName: 'James Rodriguez', policyId: 'POL001', policyName: 'Terms of Service', version: 'v3.1', timestamp: '2024-12-10 09:22:11', ipAddress: '45.89.120.34', source: 'api', jurisdiction: 'US' }
  ]);

  const menuStructure = [
    {
      category: 'Policy Management',
      items: [
        { id: 'policy-library' as SectionType, label: 'Policy Library', status: 'configured', icon: FileText },
        { id: 'assignment-rules' as SectionType, label: 'Policy Assignment Rules', status: 'configured', icon: Target },
        { id: 'consent-tracking' as SectionType, label: 'Acceptance & Consent Tracking', status: 'configured', icon: FileCheck }
      ]
    },
    {
      category: 'Governance & Control',
      items: [
        { id: 'versioning-control' as SectionType, label: 'Versioning & Change Control', status: 'configured', icon: GitBranch },
        { id: 'jurisdiction' as SectionType, label: 'Jurisdiction & Applicability', status: 'configured', icon: Globe },
        { id: 'disclaimers-notices' as SectionType, label: 'Legal Disclaimers & Notices', status: 'configured', icon: AlertTriangle }
      ]
    },
    {
      category: 'Enforcement & Evidence',
      items: [
        { id: 'enforcement-rules' as SectionType, label: 'Enforcement Rules', status: 'configured', icon: Shield },
        { id: 'legal-evidence' as SectionType, label: 'Legal Evidence & Logs', status: 'configured', icon: Database },
        { id: 'advanced-system' as SectionType, label: 'Advanced & Legal System', status: 'configured', icon: Settings }
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
    toast.success('Policies & Legal settings saved successfully');
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
            <span className="text-slate-900 font-medium">Policies & Legal</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Policies & Legal
              </h1>
              <p className="text-sm text-slate-500">
                Policy orchestration, legal acceptance tracking, and compliance evidence
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Database size={16} />
                Legal Evidence Export
              </Button>
              <Button variant="outline" className="gap-2">
                <FileCheck size={16} />
                Audit Report
              </Button>
              <Button className="gap-2" onClick={() => setShowCreatePolicy(true)}>
                <Plus size={16} />
                Create Policy
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
                    placeholder="Search policies..."
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
            {activeSection === 'policy-library' && (
              <PolicyLibrarySection 
                policies={policies} 
                setShowCreatePolicy={setShowCreatePolicy}
                setShowVersionHistory={setShowVersionHistory}
              />
            )}

            {activeSection === 'assignment-rules' && (
              <AssignmentRulesSection assignmentRules={assignmentRules} setShowCreateRule={setShowCreateRule} />
            )}

            {activeSection === 'consent-tracking' && (
              <ConsentTrackingSection consentRecords={consentRecords} settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'versioning-control' && (
              <VersioningControlSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'jurisdiction' && (
              <JurisdictionSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'enforcement-rules' && (
              <EnforcementRulesSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'legal-evidence' && (
              <LegalEvidenceSection consentRecords={consentRecords} settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'advanced-system' && (
              <AdvancedSystemSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {/* Placeholder sections */}
            {activeSection === 'disclaimers-notices' && (
              <PlaceholderSection title="Legal Disclaimers & Notices" />
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
      <CreatePolicyDialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy} />
      <CreateRuleDialog open={showCreateRule} onOpenChange={setShowCreateRule} />
      <VersionHistoryDialog open={showVersionHistory} onOpenChange={setShowVersionHistory} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const PolicyLibrarySection = ({ policies, setShowCreatePolicy, setShowVersionHistory }: any) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Policy Library</h2>
            <p className="text-sm text-slate-500 mt-1">Central repository of all legal policies</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {policies.length} Policies
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-4">Last updated by Legal Team on 2024-11-15 at 16:45</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Policies" value="7" icon={CheckCircle2} color="green" />
        <StatCard label="Draft Policies" value="0" icon={Edit} color="blue" />
        <StatCard label="Deprecated" value="1" icon={Archive} color="slate" />
        <StatCard label="Total Acceptances" value="114K" icon={Users} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={scopeFilter} onValueChange={setScopeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="ticket">Ticket</SelectItem>
            <SelectItem value="role">Role</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="ml-auto gap-2" onClick={() => setShowCreatePolicy(true)}>
          <Plus size={16} />
          Create Policy
        </Button>
      </div>

      {/* Policy Table */}
      <ContentCard title="Policy Repository" description="All legal policies and their current status">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Policy Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Scope</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Acceptances</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {policies.map((policy: Policy) => (
                <PolicyRow key={policy.id} policy={policy} setShowVersionHistory={setShowVersionHistory} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>Policy Impact:</strong> Changes to active policies may require re-acceptance from users. 
            Deprecated policies remain accessible for historical records only.
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentRulesSection = ({ assignmentRules, setShowCreateRule }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Policy Assignment Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Define which policies apply to which users and contexts</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {assignmentRules.length} Rules
          </Badge>
        </div>
      </div>

      {/* Assignment Rules Table */}
      <ContentCard
        title="Assignment Rules"
        description="Priority-ordered policy assignment logic"
        action={
          <Button onClick={() => setShowCreateRule(true)} className="gap-2">
            <Plus size={16} />
            Create Assignment Rule
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Policy</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Target</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assignmentRules.map((rule: AssignmentRule) => (
                <AssignmentRuleRow key={rule.id} rule={rule} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Assignment Priority:</strong> Rules are evaluated in priority order (1 = highest). 
              Higher priority rules override lower priority ones. Drag to reorder.
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const ConsentTrackingSection = ({ consentRecords, settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Acceptance & Consent Tracking</h2>
            <p className="text-sm text-slate-500 mt-1">Track and manage user consent for legal policies</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      {/* Consent Configuration */}
      <ContentCard title="Consent Configuration" description="How consent is captured and tracked">
        <div className="space-y-3">
          <SwitchField
            label="Acceptance Required"
            description="Require explicit acceptance before access"
            checked={settings.acceptanceRequired}
            onCheckedChange={(val) => handleSettingChange('acceptanceRequired', val)}
            badge={<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Legal</Badge>}
          />
          <SwitchField
            label="Explicit Checkbox"
            description="Require checkbox click (no pre-checked boxes)"
            checked={settings.explicitCheckbox}
            onCheckedChange={(val) => handleSettingChange('explicitCheckbox', val)}
            badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">GDPR</Badge>}
          />
          <SwitchField
            label="Capture IP Address"
            description="Record IP address with each consent"
            checked={settings.captureIp}
            onCheckedChange={(val) => handleSettingChange('captureIp', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </div>
      </ContentCard>

      {/* Recent Consent Records */}
      <ContentCard
        title="Recent Consent Records"
        description="Latest policy acceptances (showing last 100)"
        action={
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export All
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Policy</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Jurisdiction</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {consentRecords.map((record: ConsentRecord) => (
                <ConsentRecordRow key={record.id} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const VersioningControlSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Versioning & Change Control</h2>
            <p className="text-sm text-slate-500 mt-1">Manage policy versions and change tracking</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Version Control Settings" description="Automatic versioning and re-acceptance rules">
        <div className="space-y-3">
          <SwitchField
            label="Force Re-acceptance on Major Version Changes"
            description="Users must re-accept when major version updates occur"
            checked={settings.forceReacceptanceOnMajor}
            onCheckedChange={(val) => handleSettingChange('forceReacceptanceOnMajor', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const JurisdictionSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Jurisdiction & Applicability</h2>
            <p className="text-sm text-slate-500 mt-1">Geographic policy applicability and jurisdiction mapping</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Jurisdiction Mapping" description="Automatic jurisdiction detection and mapping">
        <div className="space-y-3">
          <SwitchField
            label="Auto-Map by Country"
            description="Automatically apply policies based on user's country"
            checked={settings.autoMapByCountry}
            onCheckedChange={(val) => handleSettingChange('autoMapByCountry', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Event Country Override"
            description="Use event's country instead of user's country for event policies"
            checked={settings.eventCountryOverride}
            onCheckedChange={(val) => handleSettingChange('eventCountryOverride', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const EnforcementRulesSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Enforcement Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Define how policy acceptance is enforced</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Enforcement Configuration" description="Control access based on policy acceptance">
        <div className="space-y-3">
          <SwitchField
            label="Block Registration Without Acceptance"
            description="Prevent account creation until policies are accepted"
            checked={settings.blockRegistration}
            onCheckedChange={(val) => handleSettingChange('blockRegistration', val)}
            badge={<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Legal</Badge>}
          />
          <SwitchField
            label="Block Ticket Purchase Without Acceptance"
            description="Require policy acceptance before completing ticket purchases"
            checked={settings.blockTicketPurchase}
            onCheckedChange={(val) => handleSettingChange('blockTicketPurchase', val)}
          />
          <SwitchField
            label="Soft Warning Only (No Blocking)"
            description="Show warnings but allow users to proceed without acceptance"
            checked={settings.softWarningOnly}
            onCheckedChange={(val) => handleSettingChange('softWarningOnly', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const LegalEvidenceSection = ({ consentRecords, settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Legal Evidence & Logs</h2>
            <p className="text-sm text-slate-500 mt-1">Secure storage of legal consent evidence</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Legal Evidence Settings" description="Retention and storage of consent records">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Consent Retention Period (Years)</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={settings.consentRetentionYears}
              onChange={(e) => handleSettingChange('consentRetentionYears', parseInt(e.target.value))}
            />
            <p className="text-xs text-slate-500">How long to retain consent records for legal compliance</p>
          </div>

          <Separator />

          <SwitchField
            label="Legal Hold Enabled"
            description="Prevent automatic deletion of consent records during litigation"
            checked={settings.legalHoldEnabled}
            onCheckedChange={(val) => handleSettingChange('legalHoldEnabled', val)}
          />
        </div>
      </ContentCard>

      {/* Recent Consent Records - Same as Section 3 */}
      <ContentCard
        title="Recent Consent Records"
        description="Latest policy acceptances (showing last 100)"
        action={
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export Legal Evidence
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Policy</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Jurisdiction</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {consentRecords.map((record: ConsentRecord) => (
                <ConsentRecordRow key={record.id} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const AdvancedSystemSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Advanced & Legal System</h2>
            <p className="text-sm text-slate-500 mt-1">System-level configuration and integrations</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="System Configuration" description="Legal system features and integrations">
        <div className="space-y-3">
          <SwitchField
            label="Legal System Enabled"
            description="Enable the entire legal policy management system"
            checked={settings.legalSystemEnabled}
            onCheckedChange={(val) => handleSettingChange('legalSystemEnabled', val)}
          />
          <SwitchField
            label="API Access Enabled"
            description="Allow external systems to access policy data via API"
            checked={settings.apiAccessEnabled}
            onCheckedChange={(val) => handleSettingChange('apiAccessEnabled', val)}
          />
          <SwitchField
            label="Webhook on Acceptance"
            description="Send webhook notifications when policies are accepted"
            checked={settings.webhookOnAcceptance}
            onCheckedChange={(val) => handleSettingChange('webhookOnAcceptance', val)}
          />
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

const PolicyRow = ({ policy, setShowVersionHistory }: any) => {
  const getTypeLabel = (type: string) => {
    const labels: any = {
      'terms': 'Terms of Service',
      'privacy': 'Privacy Policy',
      'code-of-conduct': 'Code of Conduct',
      'refund': 'Refund Policy',
      'jury-ethics': 'Jury Ethics',
      'volunteer': 'Volunteer Agreement',
      'dpa': 'Data Processing',
      'event-specific': 'Event Policy',
      'award-specific': 'Award Policy'
    };
    return labels[type] || type;
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-blue-600" />
          <div>
            <div className="font-medium text-slate-900">{policy.name}</div>
            <div className="text-xs text-slate-500">Updated by {policy.lastUpdatedBy}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
          {getTypeLabel(policy.type)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          policy.scope === 'global' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          policy.scope === 'event' ? 'bg-green-50 text-green-700 border-green-200' :
          policy.scope === 'role' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-slate-100 text-slate-700 border-slate-200'
        }>
          {policy.scope.charAt(0).toUpperCase() + policy.scope.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {policy.currentVersion}
        </code>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          policy.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
          policy.status === 'draft' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-slate-100 text-slate-600 border-slate-200'
        }>
          {policy.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
          {policy.status === 'draft' && <Edit size={10} className="mr-1" />}
          {policy.status === 'deprecated' && <Archive size={10} className="mr-1" />}
          {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {policy.acceptanceCount ? (
          <div className="flex items-center gap-1">
            <Users size={12} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-900">
              {policy.acceptanceCount.toLocaleString()}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => setShowVersionHistory(true)}>
            <History size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Eye size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-red-600">
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const AssignmentRuleRow = ({ rule }: { rule: AssignmentRule }) => {
  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'all-users': return Users;
      case 'role': return Shield;
      case 'event': return Calendar;
      case 'ticket': return Ticket;
      default: return Target;
    }
  };

  const Icon = getTargetIcon(rule.targetType);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-slate-400 cursor-move" />
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
            #{rule.priority}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-slate-900">{rule.policyName}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-slate-400" />
          <span className="text-sm text-slate-700">{rule.target}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
          {rule.targetType}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Switch checked={rule.status === 'active'} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-red-600">
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const ConsentRecordRow = ({ record }: { record: ConsentRecord }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-slate-400" />
          <div>
            <div className="font-medium text-slate-900">{record.userName}</div>
            <div className="text-xs text-slate-500">{record.userId}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-700">{record.policyName}</span>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {record.version}
        </code>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-700">{record.timestamp}</span>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-slate-700">{record.ipAddress}</code>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          record.source === 'web' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          record.source === 'app' ? 'bg-green-50 text-green-700 border-green-200' :
          record.source === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
          'bg-slate-100 text-slate-700 border-slate-200'
        }>
          {record.source.charAt(0).toUpperCase() + record.source.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          record.jurisdiction === 'EU' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          record.jurisdiction === 'UK' ? 'bg-green-50 text-green-700 border-green-200' :
          record.jurisdiction === 'US' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-purple-50 text-purple-700 border-purple-200'
        }>
          {record.jurisdiction}
        </Badge>
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

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
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

const CreatePolicyDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Policy</DialogTitle>
          <DialogDescription>
            Create a new legal policy document
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Policy Name *</Label>
            <Input placeholder="e.g., Cookie Policy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terms">Terms of Service</SelectItem>
                  <SelectItem value="privacy">Privacy Policy</SelectItem>
                  <SelectItem value="refund">Refund Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scope *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Policy created successfully');
            onOpenChange(false);
          }}>
            Create Policy
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
          <DialogTitle>Create Assignment Rule</DialogTitle>
          <DialogDescription>
            Define a new policy assignment rule
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Policy *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pol1">Terms of Service</SelectItem>
                <SelectItem value="pol2">Privacy Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Type *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-users">All Users</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Input type="number" placeholder="1" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Assignment rule created successfully');
            onOpenChange(false);
          }}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const VersionHistoryDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View all versions of this policy
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-3">
            {['v3.2', 'v3.1', 'v3.0', 'v2.9'].map((version) => (
              <div key={version} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-semibold text-slate-900">{version}</code>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                        <Lock size={10} />
                        Legal Approved
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">Updated GDPR compliance language</p>
                    <p className="text-xs text-slate-500 mt-1">Effective: 2024-11-15 • 45,230 users impacted</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
