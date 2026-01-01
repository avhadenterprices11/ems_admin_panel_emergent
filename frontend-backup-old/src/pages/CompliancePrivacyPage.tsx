import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CheckSquare, Database, FileText, Cookie, Activity, Scale, Globe,
  Save, RefreshCw, Download, Eye, Info, AlertTriangle, Plus, Edit, Trash2,
  Upload, CheckCircle2, XCircle, Clock, User, Lock, Unlock, Search, Filter,
  ChevronDown, ChevronRight, AlertCircle, ExternalLink
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

type SectionType = 'gdpr' | 'consent' | 'retention' | 'dsar' | 'cookies' | 'audit' | 'legal' | 'regional';

interface ConsentRecord {
  id: string;
  personName: string;
  consentType: string;
  source: string;
  version: string;
  dateGiven: string;
  status: 'active' | 'revoked';
}

interface DSARRequest {
  id: string;
  person: string;
  requestType: string;
  status: 'pending' | 'processing' | 'completed';
  dueDate: string;
  assignedTo: string;
}

interface AuditLog {
  timestamp: string;
  actor: string;
  action: string;
  object: string;
  ipAddress: string;
  outcome: 'success' | 'failure';
}

interface LegalDocument {
  id: string;
  name: string;
  version: string;
  effectiveDate: string;
  status: 'active' | 'draft';
}

export const CompliancePrivacyPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('gdpr');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);

  const [settings, setSettings] = useState({
    // GDPR
    gdprEnabled: true,
    legalBasis: 'consent',
    requireConsentEmail: true,
    requireConsentEvents: true,
    requireConsentAwards: true,
    requireConsentMarketing: true,
    encryptPIIRest: true,
    encryptPIITransit: true,
    maskSensitiveFields: true,
    anonymizeIP: true,

    // Consent Management
    timestampedConsent: true,
    storeConsentSource: true,
    multipleActiveConsents: true,
    consentExpiryMode: 'never',
    consentExpiryMonths: 24,

    // Data Retention
    retentionPersonRecords: 36,
    retentionEventData: 24,
    retentionAwardsData: 60,
    retentionCommLogs: 12,
    postExpiryAction: 'anonymize',
    preserveLegalDisputes: true,
    extendForWinners: true,

    // DSAR
    enableAccessRequest: true,
    enableRectification: true,
    enableDeletion: true,
    enablePortability: true,
    autoAcknowledge: true,
    dsarSLA: 30,
    defaultReviewerRole: 'compliance-officer',

    // Cookies
    cookieBannerEnabled: true,
    bannerPosition: 'bottom',
    consentMode: 'explicit',
    cookieNecessary: true,
    cookieAnalytics: false,
    cookieMarketing: false,
    cookieFunctional: true,
    googleAnalyticsEnabled: false,
    metaPixelEnabled: false,

    // Audit Logs
    auditLoggingEnabled: true,
    logLoginAttempts: true,
    logDataChanges: true,
    logPermissionChanges: true,
    logExports: true,
    logDeletions: true,
    auditRetentionYears: 7,

    // Legal Documents
    requireAcceptanceRegistration: true,
    requireAcceptanceLogin: false,
    requireAcceptanceEventSignup: true
  });

  const [consentRecords] = useState<ConsentRecord[]>([
    { id: 'C001', personName: 'Sarah Johnson', consentType: 'Email Communications', source: 'Event Registration', version: '2.1', dateGiven: '2024-11-15', status: 'active' },
    { id: 'C002', personName: 'Michael Chen', consentType: 'Marketing', source: 'Form Signup', version: '2.1', dateGiven: '2024-10-22', status: 'active' },
    { id: 'C003', personName: 'Emily Parker', consentType: 'Awards Processing', source: 'Nomination Form', version: '2.0', dateGiven: '2024-09-08', status: 'revoked' },
    { id: 'C004', personName: 'David Williams', consentType: 'Email Communications', source: 'API Integration', version: '2.1', dateGiven: '2024-12-01', status: 'active' }
  ]);

  const [dsarRequests] = useState<DSARRequest[]>([
    { id: 'DSAR-001', person: 'Jane Mitchell', requestType: 'Access', status: 'pending', dueDate: '2024-12-28', assignedTo: 'Sarah Kim' },
    { id: 'DSAR-002', person: 'Robert Taylor', requestType: 'Deletion', status: 'processing', dueDate: '2024-12-25', assignedTo: 'Michael Jones' },
    { id: 'DSAR-003', person: 'Lisa Anderson', requestType: 'Portability', status: 'completed', dueDate: '2024-12-10', assignedTo: 'Sarah Kim' }
  ]);

  const [auditLogs] = useState<AuditLog[]>([
    { timestamp: '2024-12-20 10:15:32', actor: 'Sarah Johnson', action: 'Export Data', object: 'Person Record #P123', ipAddress: '192.168.1.45', outcome: 'success' },
    { timestamp: '2024-12-20 09:42:18', actor: 'Michael Chen', action: 'Delete Record', object: 'Event Participation #EP456', ipAddress: '192.168.1.67', outcome: 'success' },
    { timestamp: '2024-12-19 17:22:11', actor: 'Admin', action: 'Permission Change', object: 'User Role: Compliance', ipAddress: '192.168.1.12', outcome: 'success' },
    { timestamp: '2024-12-19 14:05:33', actor: 'System', action: 'Auto-Anonymize', object: 'Expired Records (142)', ipAddress: 'System', outcome: 'success' }
  ]);

  const [legalDocs] = useState<LegalDocument[]>([
    { id: 'DOC-001', name: 'Privacy Policy', version: '3.2', effectiveDate: '2024-11-01', status: 'active' },
    { id: 'DOC-002', name: 'Terms & Conditions', version: '2.8', effectiveDate: '2024-11-01', status: 'active' },
    { id: 'DOC-003', name: 'Data Processing Agreement', version: '1.5', effectiveDate: '2024-10-15', status: 'active' },
    { id: 'DOC-004', name: 'Cookie Policy', version: '2.0', effectiveDate: '2024-09-01', status: 'draft' }
  ]);

  const sidebarItems = [
    { id: 'gdpr' as SectionType, icon: Shield, label: 'GDPR & Data Protection', status: 'configured' },
    { id: 'consent' as SectionType, icon: CheckSquare, label: 'Consent Management', status: 'configured' },
    { id: 'retention' as SectionType, icon: Database, label: 'Data Retention & Deletion', status: 'configured' },
    { id: 'dsar' as SectionType, icon: FileText, label: 'Data Subject Rights (DSAR)', status: 'attention' },
    { id: 'cookies' as SectionType, icon: Cookie, label: 'Cookies & Tracking', status: 'configured' },
    { id: 'audit' as SectionType, icon: Activity, label: 'Audit Logs', status: 'configured' },
    { id: 'legal' as SectionType, icon: Scale, label: 'Legal Documents', status: 'configured' },
    { id: 'regional' as SectionType, icon: Globe, label: 'Regional Compliance Rules', status: 'not-set' }
  ];

  const getComplianceStatus = () => {
    const hasAttention = sidebarItems.some(item => item.status === 'attention');
    const hasNotSet = sidebarItems.some(item => item.status === 'not-set');
    
    if (hasAttention) return { label: 'Requires Attention', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (hasNotSet) return { label: 'Partial Configuration', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Configured', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  const complianceStatus = getComplianceStatus();

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Compliance settings saved successfully');
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    toast.info('Changes discarded');
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
            <span className="text-slate-900 font-medium">Compliance & Privacy</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-slate-900">
                  Compliance & Privacy
                </h1>
                <Badge variant="outline" className={`${complianceStatus.color} text-xs`}>
                  {complianceStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                GDPR, consent management, data retention, and audit logs
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Eye size={16} />
                View Audit Log
              </Button>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Export Compliance Report
              </Button>
              {hasChanges && (
                <Button variant="outline" onClick={handleDiscard} className="gap-2">
                  <RefreshCw size={16} />
                  Discard
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
                <h3 className="text-sm font-semibold text-slate-700">Compliance Settings</h3>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {sidebarItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  
                  const statusDotColor = 
                    item.status === 'configured' ? 'bg-green-500' :
                    item.status === 'attention' ? 'bg-amber-500' :
                    'bg-slate-300';
                  
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
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={cn("shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-medium", isActive ? "text-blue-900" : "text-slate-900")}>
                            {item.label}
                          </div>
                        </div>
                        <div className={`w-2 h-2 ${statusDotColor} rounded-full shrink-0`} />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-span-9">
            {activeSection === 'gdpr' && (
              <GDPRSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'consent' && (
              <ConsentSection settings={settings} handleSettingChange={handleSettingChange} consentRecords={consentRecords} />
            )}

            {activeSection === 'retention' && (
              <RetentionSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'dsar' && (
              <DSARSection settings={settings} handleSettingChange={handleSettingChange} dsarRequests={dsarRequests} />
            )}

            {activeSection === 'cookies' && (
              <CookiesSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'audit' && (
              <AuditSection settings={settings} handleSettingChange={handleSettingChange} auditLogs={auditLogs} />
            )}

            {activeSection === 'legal' && (
              <LegalSection settings={settings} handleSettingChange={handleSettingChange} legalDocs={legalDocs} setShowUploadDocument={setShowUploadDocument} />
            )}

            {activeSection === 'regional' && (
              <RegionalSection />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <UploadDocumentDialog open={showUploadDocument} onOpenChange={setShowUploadDocument} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const GDPRSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Main GDPR Controls */}
      <ContentCard title="GDPR & Data Protection Controls" description="Configure master data protection settings">
        <div className="space-y-5">
          <SwitchField
            label="Enable GDPR Compliance"
            description="Master toggle for all GDPR features and controls"
            checked={settings.gdprEnabled}
            onCheckedChange={(val) => handleSettingChange('gdprEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Active</Badge>}
          />

          {settings.gdprEnabled && (
            <>
              <Separator />

              <FormField label="Default Legal Basis for Processing">
                <Select value={settings.legalBasis} onValueChange={(val) => handleSettingChange('legalBasis', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consent">Consent</SelectItem>
                    <SelectItem value="legitimate-interest">Legitimate Interest</SelectItem>
                    <SelectItem value="contractual">Contractual Obligation</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">Primary legal basis for data processing activities</p>
              </FormField>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Require Explicit Consent For</h3>
                <div className="space-y-2">
                  <CheckboxField
                    label="Email Communications"
                    checked={settings.requireConsentEmail}
                    onCheckedChange={(val) => handleSettingChange('requireConsentEmail', val)}
                  />
                  <CheckboxField
                    label="Event Registrations"
                    checked={settings.requireConsentEvents}
                    onCheckedChange={(val) => handleSettingChange('requireConsentEvents', val)}
                  />
                  <CheckboxField
                    label="Awards & Nominations"
                    checked={settings.requireConsentAwards}
                    onCheckedChange={(val) => handleSettingChange('requireConsentAwards', val)}
                  />
                  <CheckboxField
                    label="Marketing Campaigns"
                    checked={settings.requireConsentMarketing}
                    onCheckedChange={(val) => handleSettingChange('requireConsentMarketing', val)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </ContentCard>

      {/* Security Controls */}
      <ContentCard title="Security Controls" description="Encryption and data protection measures">
        <div className="space-y-3">
          <SwitchField
            label="Encrypt PII at Rest"
            description="Encrypt personally identifiable information in database"
            checked={settings.encryptPIIRest}
            onCheckedChange={(val) => handleSettingChange('encryptPIIRest', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Encrypt PII in Transit"
            description="Use TLS encryption for data transmission"
            checked={settings.encryptPIITransit}
            onCheckedChange={(val) => handleSettingChange('encryptPIITransit', val)}
            badge={<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Required</Badge>}
          />
          <SwitchField
            label="Mask Sensitive Fields in Admin UI"
            description="Display partial data (e.g., ***@example.com) in admin interfaces"
            checked={settings.maskSensitiveFields}
            onCheckedChange={(val) => handleSettingChange('maskSensitiveFields', val)}
          />
          <SwitchField
            label="IP Address Anonymization"
            description="Anonymize last octet of IP addresses before storage"
            checked={settings.anonymizeIP}
            onCheckedChange={(val) => handleSettingChange('anonymizeIP', val)}
          />
        </div>
      </ContentCard>

      {/* Role Visibility */}
      <ContentCard title="Role Visibility & Permissions" description="Control which roles can access full PII">
        <div className="space-y-4">
          <FormField label="Roles with Full PII Access">
            <div className="space-y-2">
              <CheckboxField label="Administrator" checked={true} />
              <CheckboxField label="Compliance Officer" checked={true} />
              <CheckboxField label="Operations Manager" checked={true} />
              <CheckboxField label="Event Manager" checked={false} />
              <CheckboxField label="Communications Team" checked={false} />
            </div>
          </FormField>
        </div>
      </ContentCard>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-900">
            <strong>GDPR Foundation:</strong> These settings establish the legal and technical foundation for GDPR compliance. Encryption at rest and in transit are critical for protecting personal data.
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsentSection = ({ settings, handleSettingChange, consentRecords }: any) => {
  return (
    <div className="space-y-6">
      {/* Consent Configuration */}
      <ContentCard title="Consent Configuration" description="Control how consent is captured and stored">
        <div className="space-y-4">
          <SwitchField
            label="Timestamped Consent Records"
            description="Record exact date and time when consent was given"
            checked={settings.timestampedConsent}
            onCheckedChange={(val) => handleSettingChange('timestampedConsent', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Required</Badge>}
          />
          <SwitchField
            label="Store Consent Source"
            description="Track where consent was obtained (form, event, API, etc.)"
            checked={settings.storeConsentSource}
            onCheckedChange={(val) => handleSettingChange('storeConsentSource', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Allow Multiple Active Consents"
            description="Users can have multiple concurrent consents for different purposes"
            checked={settings.multipleActiveConsents}
            onCheckedChange={(val) => handleSettingChange('multipleActiveConsents', val)}
          />

          <Separator />

          <div className="space-y-4">
            <FormField label="Consent Expiry Mode">
              <Select value={settings.consentExpiryMode} onValueChange={(val) => handleSettingChange('consentExpiryMode', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never Expire</SelectItem>
                  <SelectItem value="fixed">Fixed Duration</SelectItem>
                  <SelectItem value="reconfirm">Require Reconfirmation</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {settings.consentExpiryMode === 'fixed' && (
              <FormField label="Consent Expiry Duration (months)">
                <Input
                  type="number"
                  value={settings.consentExpiryMonths}
                  onChange={(e) => handleSettingChange('consentExpiryMonths', parseInt(e.target.value))}
                />
              </FormField>
            )}
          </div>
        </div>
      </ContentCard>

      {/* Consent Records Table */}
      <ContentCard
        title="Consent Records"
        description="Active and revoked consent records across the system"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} />
            Export Records
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Person</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Consent Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Date Given</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {consentRecords.map((record: ConsentRecord) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-900">{record.personName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{record.consentType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {record.source}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-600">v{record.version}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">{record.dateGiven}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      record.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {record.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                      {record.status === 'revoked' && <XCircle size={10} className="mr-1" />}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const RetentionSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Retention Periods */}
      <ContentCard title="Data Retention Periods" description="Configure how long data is retained before expiry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Person Records (months)">
              <Input
                type="number"
                value={settings.retentionPersonRecords}
                onChange={(e) => handleSettingChange('retentionPersonRecords', parseInt(e.target.value))}
              />
            </FormField>
            <FormField label="Event Data (months)">
              <Input
                type="number"
                value={settings.retentionEventData}
                onChange={(e) => handleSettingChange('retentionEventData', parseInt(e.target.value))}
              />
            </FormField>
            <FormField label="Awards Data (months)">
              <Input
                type="number"
                value={settings.retentionAwardsData}
                onChange={(e) => handleSettingChange('retentionAwardsData', parseInt(e.target.value))}
              />
            </FormField>
            <FormField label="Communication Logs (months)">
              <Input
                type="number"
                value={settings.retentionCommLogs}
                onChange={(e) => handleSettingChange('retentionCommLogs', parseInt(e.target.value))}
              />
            </FormField>
          </div>

          <Separator />

          <FormField label="Post-Expiry Action">
            <Select value={settings.postExpiryAction} onValueChange={(val) => handleSettingChange('postExpiryAction', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anonymize">Anonymize (Recommended)</SelectItem>
                <SelectItem value="delete">Permanent Deletion</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">What happens to records after retention period expires</p>
          </FormField>
        </div>
      </ContentCard>

      {/* Special Rules */}
      <ContentCard title="Special Retention Rules" description="Exceptions and special case handling">
        <div className="space-y-3">
          <SwitchField
            label="Preserve Records in Legal Disputes"
            description="Automatically extend retention for records involved in active legal proceedings"
            checked={settings.preserveLegalDisputes}
            onCheckedChange={(val) => handleSettingChange('preserveLegalDisputes', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Extend Retention for Award Winners"
            description="Keep award winner records for historical purposes"
            checked={settings.extendForWinners}
            onCheckedChange={(val) => handleSettingChange('extendForWinners', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const DSARSection = ({ settings, handleSettingChange, dsarRequests }: any) => {
  return (
    <div className="space-y-6">
      {/* DSAR Settings */}
      <ContentCard title="DSAR Settings" description="Configure data subject access request handling">
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-900">
                <strong>Action Required:</strong> You have 2 pending DSAR requests approaching their deadlines. Review them in the table below.
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-slate-900">Enable DSAR Types</h3>
          <div className="space-y-2">
            <SwitchField
              label="Access Requests (Right to Access)"
              description="Users can request a copy of their personal data"
              checked={settings.enableAccessRequest}
              onCheckedChange={(val) => handleSettingChange('enableAccessRequest', val)}
            />
            <SwitchField
              label="Rectification Requests (Right to Rectification)"
              description="Users can request corrections to their data"
              checked={settings.enableRectification}
              onCheckedChange={(val) => handleSettingChange('enableRectification', val)}
            />
            <SwitchField
              label="Deletion Requests (Right to Erasure)"
              description="Users can request deletion of their personal data"
              checked={settings.enableDeletion}
              onCheckedChange={(val) => handleSettingChange('enableDeletion', val)}
            />
            <SwitchField
              label="Portability Requests (Right to Data Portability)"
              description="Users can request data in machine-readable format"
              checked={settings.enablePortability}
              onCheckedChange={(val) => handleSettingChange('enablePortability', val)}
            />
          </div>

          <Separator />

          <SwitchField
            label="Auto-Acknowledge Requests"
            description="Automatically send confirmation email when DSAR is received"
            checked={settings.autoAcknowledge}
            onCheckedChange={(val) => handleSettingChange('autoAcknowledge', val)}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="DSAR Response SLA (days)">
              <Input
                type="number"
                value={settings.dsarSLA}
                onChange={(e) => handleSettingChange('dsarSLA', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">Legal requirement: 30 days under GDPR</p>
            </FormField>

            <FormField label="Default Reviewer Role">
              <Select value={settings.defaultReviewerRole} onValueChange={(val) => handleSettingChange('defaultReviewerRole', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance-officer">Compliance Officer</SelectItem>
                  <SelectItem value="data-protection-officer">Data Protection Officer</SelectItem>
                  <SelectItem value="legal-team">Legal Team</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      </ContentCard>

      {/* Active DSAR Requests Table */}
      <ContentCard
        title="Active DSAR Requests"
        description="Pending and in-progress data subject access requests"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={14} />
            Filter
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Request ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Person</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Request Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Assigned To</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {dsarRequests.map((request: DSARRequest) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {request.id}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{request.person}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {request.requestType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      request.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      request.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{request.dueDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">{request.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye size={14} />
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
    </div>
  );
};

const CookiesSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Cookie Banner */}
      <ContentCard title="Cookie Banner Configuration" description="Control cookie consent banner behavior">
        <div className="space-y-4">
          <SwitchField
            label="Enable Cookie Consent Banner"
            description="Display cookie consent banner to visitors"
            checked={settings.cookieBannerEnabled}
            onCheckedChange={(val) => handleSettingChange('cookieBannerEnabled', val)}
          />

          {settings.cookieBannerEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Banner Position">
                  <Select value={settings.bannerPosition} onValueChange={(val) => handleSettingChange('bannerPosition', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top of Page</SelectItem>
                      <SelectItem value="bottom">Bottom of Page</SelectItem>
                      <SelectItem value="modal">Modal Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Consent Mode">
                  <Select value={settings.consentMode} onValueChange={(val) => handleSettingChange('consentMode', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="explicit">Explicit Opt-In</SelectItem>
                      <SelectItem value="implicit">Implicit (Opt-Out)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </>
          )}
        </div>
      </ContentCard>

      {/* Cookie Categories */}
      <ContentCard title="Cookie Categories" description="Control which cookie types can be used">
        <div className="space-y-3">
          <div className="flex items-start justify-between py-3 border-b border-slate-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <label className="text-sm font-medium text-slate-900">Necessary Cookies</label>
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">Always On</Badge>
              </div>
              <p className="text-xs text-slate-500">Required for basic site functionality</p>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
            </div>
          </div>

          <SwitchField
            label="Analytics Cookies"
            description="Track site usage and visitor behavior"
            checked={settings.cookieAnalytics}
            onCheckedChange={(val) => handleSettingChange('cookieAnalytics', val)}
          />
          <SwitchField
            label="Marketing Cookies"
            description="Enable targeted advertising and remarketing"
            checked={settings.cookieMarketing}
            onCheckedChange={(val) => handleSettingChange('cookieMarketing', val)}
          />
          <SwitchField
            label="Functional Cookies"
            description="Remember user preferences and settings"
            checked={settings.cookieFunctional}
            onCheckedChange={(val) => handleSettingChange('cookieFunctional', val)}
          />
        </div>
      </ContentCard>

      {/* Tracking Scripts */}
      <ContentCard title="Third-Party Tracking Scripts" description="Enable or disable external analytics">
        <div className="space-y-3">
          <SwitchField
            label="Google Analytics"
            description="Web analytics service by Google"
            checked={settings.googleAnalyticsEnabled}
            onCheckedChange={(val) => handleSettingChange('googleAnalyticsEnabled', val)}
          />
          <SwitchField
            label="Meta Pixel (Facebook)"
            description="Track conversions and build audiences"
            checked={settings.metaPixelEnabled}
            onCheckedChange={(val) => handleSettingChange('metaPixelEnabled', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const AuditSection = ({ settings, handleSettingChange, auditLogs }: any) => {
  return (
    <div className="space-y-6">
      {/* Audit Configuration */}
      <ContentCard title="Audit Logging Configuration" description="Control what system events are logged">
        <div className="space-y-4">
          <SwitchField
            label="Audit Logging Enabled"
            description="Master toggle for all audit logging"
            checked={settings.auditLoggingEnabled}
            onCheckedChange={(val) => handleSettingChange('auditLoggingEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Active</Badge>}
          />

          {settings.auditLoggingEnabled && (
            <>
              <Separator />

              <h3 className="text-sm font-semibold text-slate-900">Log Events</h3>
              <div className="space-y-2">
                <SwitchField
                  label="Login Attempts"
                  description="Track successful and failed authentication"
                  checked={settings.logLoginAttempts}
                  onCheckedChange={(val) => handleSettingChange('logLoginAttempts', val)}
                />
                <SwitchField
                  label="Data Changes"
                  description="Log all create, update, delete operations"
                  checked={settings.logDataChanges}
                  onCheckedChange={(val) => handleSettingChange('logDataChanges', val)}
                />
                <SwitchField
                  label="Permission Changes"
                  description="Track role and permission modifications"
                  checked={settings.logPermissionChanges}
                  onCheckedChange={(val) => handleSettingChange('logPermissionChanges', val)}
                />
                <SwitchField
                  label="Data Exports"
                  description="Log all data export activities"
                  checked={settings.logExports}
                  onCheckedChange={(val) => handleSettingChange('logExports', val)}
                />
                <SwitchField
                  label="Record Deletions"
                  description="Track permanent data deletion events"
                  checked={settings.logDeletions}
                  onCheckedChange={(val) => handleSettingChange('logDeletions', val)}
                />
              </div>

              <Separator />

              <FormField label="Audit Log Retention (years)">
                <Input
                  type="number"
                  value={settings.auditRetentionYears}
                  onChange={(e) => handleSettingChange('auditRetentionYears', parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-500 mt-1">Legal requirement: 7 years recommended</p>
              </FormField>
            </>
          )}
        </div>
      </ContentCard>

      {/* Recent Audit Logs */}
      <ContentCard
        title="Recent Audit Logs"
        description="Latest compliance and security events"
        action={
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} />
            Export Logs
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Object</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">IP Address</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Outcome</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-slate-600">{log.timestamp}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-900">{log.actor}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{log.action}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded">
                      {log.object}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-600">{log.ipAddress}</code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      log.outcome === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {log.outcome === 'success' && <CheckCircle2 size={10} className="mr-1" />}
                      {log.outcome === 'failure' && <XCircle size={10} className="mr-1" />}
                      {log.outcome.charAt(0).toUpperCase() + log.outcome.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const LegalSection = ({ settings, handleSettingChange, legalDocs, setShowUploadDocument }: any) => {
  return (
    <div className="space-y-6">
      {/* Acceptance Requirements */}
      <ContentCard title="Acceptance Requirements" description="When users must accept legal documents">
        <div className="space-y-3">
          <SwitchField
            label="Require on Registration"
            description="Users must accept terms when creating account"
            checked={settings.requireAcceptanceRegistration}
            onCheckedChange={(val) => handleSettingChange('requireAcceptanceRegistration', val)}
          />
          <SwitchField
            label="Require on Login"
            description="Prompt for acceptance on every login"
            checked={settings.requireAcceptanceLogin}
            onCheckedChange={(val) => handleSettingChange('requireAcceptanceLogin', val)}
          />
          <SwitchField
            label="Require on Event Signup"
            description="Users must accept terms before event registration"
            checked={settings.requireAcceptanceEventSignup}
            onCheckedChange={(val) => handleSettingChange('requireAcceptanceEventSignup', val)}
          />
        </div>
      </ContentCard>

      {/* Legal Documents Table */}
      <ContentCard
        title="Legal Documents"
        description="Manage terms, policies, and legal agreements"
        action={
          <Button onClick={() => setShowUploadDocument(true)} variant="outline" size="sm" className="gap-2">
            <Upload size={14} />
            Upload Document
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Document Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Effective Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {legalDocs.map((doc: LegalDocument) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Scale size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-600">v{doc.version}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{doc.effectiveDate}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      doc.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                      {doc.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye size={14} />
                      </Button>
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
      </ContentCard>
    </div>
  );
};

const RegionalSection = () => {
  return (
    <div className="space-y-6">
      <ContentCard title="Regional Compliance Rules" description="Configure region-specific compliance requirements">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Globe size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Regional Rules Configured</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Set up region-specific compliance rules for GDPR (EU), CCPA (California), PIPEDA (Canada), and other regulations.
          </p>
          <Button className="gap-2">
            <Plus size={16} />
            Setup Regional Compliance
          </Button>
        </div>
      </ContentCard>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

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

const CheckboxField = ({ label, checked, onCheckedChange }: any) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <label className="text-sm text-slate-700">{label}</label>
    </div>
  );
};

// ==================== DIALOGS ====================

const UploadDocumentDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Legal Document</DialogTitle>
          <DialogDescription>
            Add a new legal document or update an existing one
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Document Type *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="privacy">Privacy Policy</SelectItem>
                <SelectItem value="terms">Terms & Conditions</SelectItem>
                <SelectItem value="dpa">Data Processing Agreement</SelectItem>
                <SelectItem value="cookie">Cookie Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Version Number *</Label>
            <Input placeholder="e.g., 3.2" />
          </div>

          <div className="space-y-2">
            <Label>Effective Date *</Label>
            <Input type="date" />
          </div>

          <div className="space-y-2">
            <Label>Document File</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">PDF, DOC, or DOCX (max 10MB)</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Legal document uploaded successfully');
            onOpenChange(false);
          }}>
            Upload Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
