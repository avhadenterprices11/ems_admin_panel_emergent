import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Database, Tag, FileText, Eye, ShieldCheck, Mail, Clock, Network,
  Search, Save, AlertTriangle, Info, Plus, Edit, Trash2, GripVertical,
  Check, X, ChevronDown, ChevronRight, Target, CheckCircle2, XCircle,
  Globe, Building, Briefcase, Award, Settings, Download, Lock, Unlock
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

type SectionType = 'model' | 'classification' | 'attributes' | 'visibility' | 'verification' | 'consent' | 'lifecycle' | 'impact';

interface Classification {
  id: string;
  name: string;
  priority: number;
  usedIn: string[];
  allowMultiple: boolean;
  contextOverride: boolean;
}

interface CustomAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown' | 'boolean';
  visibility: 'internal' | 'admin' | 'public';
  required: boolean;
}

export const PeopleIdentitySystemPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('model');
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClassification, setShowAddClassification] = useState(false);
  const [showAddAttribute, setShowAddAttribute] = useState(false);

  const [settings, setSettings] = useState({
    // Person Record Model
    primaryIdentifier: 'email',
    allowPhoneIdentifier: true,
    allowExternalId: true,
    duplicateHandling: 'merge-email',
    
    // Record Lifecycle
    recordStatuses: ['active', 'inactive', 'archived', 'deleted'],
    
    // Classification
    allowMultipleClassifications: true,
    classificationConflictResolution: 'highest-priority',
    contextOverride: true,
    
    // Verification
    emailVerificationRequired: true,
    phoneVerificationOptional: true,
    manualVerificationEnabled: true,
    documentUploadEnabled: false,
    verifiedRequiredForCriticalComms: true,
    verifiedRequiredForJury: true,
    verifiedRequiredForSpeaker: true,
    autoDemoteOnBounce: true,
    
    // Consent
    defaultConsentOptIn: false,
    allowClassificationOverride: true,
    allowEventOverride: true,
    awardConfidentialityLock: true,
    
    // Lifecycle & Retention
    autoArchiveMonths: '12',
    retainMinimalAfterDelete: true,
    gdprEraseEnabled: true,
    
    // Visibility Matrix
    visibilityMatrix: {
      attendee: { publicWebsite: false, eventListings: true, speakerJury: false, campaigns: true },
      alumni: { publicWebsite: true, eventListings: true, speakerJury: true, campaigns: true },
      speaker: { publicWebsite: true, eventListings: true, speakerJury: true, campaigns: true },
      jury: { publicWebsite: false, eventListings: false, speakerJury: true, campaigns: true },
      partner: { publicWebsite: true, eventListings: false, speakerJury: false, campaigns: true },
      admin: { publicWebsite: false, eventListings: false, speakerJury: false, campaigns: false }
    }
  });

  const [classifications, setClassifications] = useState<Classification[]>([
    { id: 'C001', name: 'Attendee', priority: 1, usedIn: ['Events', 'Conferences'], allowMultiple: true, contextOverride: true },
    { id: 'C002', name: 'Alumni', priority: 2, usedIn: ['Directory', 'Campaigns'], allowMultiple: true, contextOverride: false },
    { id: 'C003', name: 'Speaker', priority: 3, usedIn: ['Conferences'], allowMultiple: true, contextOverride: true },
    { id: 'C004', name: 'Jury', priority: 4, usedIn: ['Awards'], allowMultiple: true, contextOverride: true },
    { id: 'C005', name: 'Partner', priority: 5, usedIn: ['Events', 'Campaigns'], allowMultiple: true, contextOverride: false },
    { id: 'C006', name: 'Admin', priority: 6, usedIn: ['System'], allowMultiple: false, contextOverride: false }
  ]);

  const [customAttributes] = useState<CustomAttribute[]>([
    { id: 'A001', name: 'University', type: 'text', visibility: 'public', required: false },
    { id: 'A002', name: 'Graduation Year', type: 'number', visibility: 'public', required: false },
    { id: 'A003', name: 'Industry Sector', type: 'dropdown', visibility: 'admin', required: false },
    { id: 'A004', name: 'Newsletter Subscriber', type: 'boolean', visibility: 'internal', required: false }
  ]);

  const sidebarItems = [
    { id: 'model' as SectionType, icon: Database, label: 'Person Record Model', description: 'Core identity structure' },
    { id: 'classification' as SectionType, icon: Tag, label: 'Classification Framework', description: 'Define person types' },
    { id: 'attributes' as SectionType, icon: FileText, label: 'Identity Attributes', description: 'Custom fields & data' },
    { id: 'visibility' as SectionType, icon: Eye, label: 'Visibility & Discovery', description: 'Control appearance' },
    { id: 'verification' as SectionType, icon: ShieldCheck, label: 'Verification & Trust', description: 'Identity verification' },
    { id: 'consent' as SectionType, icon: Mail, label: 'Consent & Communication', description: 'Communication rules' },
    { id: 'lifecycle' as SectionType, icon: Clock, label: 'Lifecycle & Retention', description: 'Data governance' },
    { id: 'impact' as SectionType, icon: Network, label: 'Impact Preview', description: 'Dependency analysis' }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Identity system settings saved successfully');
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
            <span className="text-slate-900 font-medium">People & Identity System</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                People & Identity System
              </h1>
              <p className="text-sm text-slate-500">
                Person records, identity matching rules, classifications, verification, and lifecycle management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-60">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                <Input
                  placeholder="Search settings..."
                  className="pl-9 text-sm h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Network size={16} />
                View Impact
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
                <Save size={16} />
                Save Changes
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
                <h3 className="text-sm font-semibold text-slate-700">Identity Configuration</h3>
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
            {activeSection === 'model' && (
              <PersonRecordModelSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'classification' && (
              <ClassificationSection
                classifications={classifications}
                setShowAddClassification={setShowAddClassification}
                settings={settings}
                handleSettingChange={handleSettingChange}
                setHasChanges={setHasChanges}
              />
            )}

            {activeSection === 'attributes' && (
              <AttributesSection
                customAttributes={customAttributes}
                setShowAddAttribute={setShowAddAttribute}
              />
            )}

            {activeSection === 'visibility' && (
              <VisibilitySection settings={settings} setSettings={setSettings} setHasChanges={setHasChanges} />
            )}

            {activeSection === 'verification' && (
              <VerificationSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'consent' && (
              <ConsentSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'lifecycle' && (
              <LifecycleSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'impact' && (
              <ImpactSection />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddClassificationDialog open={showAddClassification} onOpenChange={setShowAddClassification} />
      <AddAttributeDialog open={showAddAttribute} onOpenChange={setShowAddAttribute} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const PersonRecordModelSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentCard
      title="Person Record Model"
      description="Core identity structure and record management rules"
    >
      <div className="space-y-6">
        {/* Primary Identifier */}
        <SettingGroup title="Primary Identifier" description="How person records are uniquely identified">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Primary Identifier Field</Label>
              <Select value={settings.primaryIdentifier} onValueChange={(val) => handleSettingChange('primaryIdentifier', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Address (Recommended)</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                  <SelectItem value="external-id">External ID</SelectItem>
                  <SelectItem value="composite">Composite (Email + Phone)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">This field is used to match and merge duplicate records</p>
            </div>

            <SwitchSetting
              label="Allow Phone as Alternative Identifier"
              description="Phone can be used if email is unavailable"
              checked={settings.allowPhoneIdentifier}
              onCheckedChange={(val) => handleSettingChange('allowPhoneIdentifier', val)}
            />

            <SwitchSetting
              label="Allow External ID Mapping"
              description="Support external system IDs (CRM, LMS, etc.)"
              checked={settings.allowExternalId}
              onCheckedChange={(val) => handleSettingChange('allowExternalId', val)}
            />
          </div>
        </SettingGroup>

        <Separator />

        {/* Duplicate Handling */}
        <SettingGroup title="Duplicate Record Handling" description="How to handle potential duplicate person records">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Duplicate Detection Strategy</Label>
            <Select value={settings.duplicateHandling} onValueChange={(val) => handleSettingChange('duplicateHandling', val)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge-email">Auto-Merge on Email Match</SelectItem>
                <SelectItem value="merge-phone">Auto-Merge on Phone Match</SelectItem>
                <SelectItem value="merge-both">Auto-Merge on Email OR Phone Match</SelectItem>
                <SelectItem value="flag">Flag for Manual Review</SelectItem>
                <SelectItem value="allow">Allow Duplicates (Not Recommended)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Determines behavior when potential duplicates are detected</p>
          </div>
        </SettingGroup>

        <Separator />

        {/* Record Status Lifecycle */}
        <SettingGroup title="Record Status Lifecycle" description="Available statuses for person records">
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
              <span className="text-sm text-slate-600">Person is actively engaged</span>
            </div>
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Inactive</Badge>
              <span className="text-sm text-slate-600">No recent activity, can be reactivated</span>
            </div>
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Archived</Badge>
              <span className="text-sm text-slate-600">Long-term storage, limited access</span>
            </div>
            <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Deleted</Badge>
              <span className="text-sm text-slate-600">Soft delete, scheduled for permanent removal</span>
            </div>
          </div>
        </SettingGroup>

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Identity Architecture:</strong> The person record model is the foundation of your data architecture. 
              Changes here affect registrations, awards, campaigns, and all person-centric features.
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

const ClassificationSection = ({ classifications, setShowAddClassification, settings, handleSettingChange, setHasChanges }: any) => {
  return (
    <ContentCard
      title="Classification Framework"
      description="Define who a person is (not their access permissions)"
      action={
        <Button onClick={() => setShowAddClassification(true)} variant="outline" className="gap-2">
          <Plus size={16} />
          Add Classification
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Classification Rules */}
        <SettingGroup title="Classification Rules" description="How multiple classifications are handled">
          <SwitchSetting
            label="Allow Multiple Classifications per Person"
            description="A person can be Attendee + Speaker + Jury simultaneously"
            checked={settings.allowMultipleClassifications}
            onCheckedChange={(val) => handleSettingChange('allowMultipleClassifications', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Enabled</Badge>}
          />
          
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-slate-700">Conflict Resolution Rule</Label>
            <p className="text-xs text-slate-500">When conflicting classifications exist, how to resolve</p>
            <Select value={settings.classificationConflictResolution} onValueChange={(val) => handleSettingChange('classificationConflictResolution', val)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="highest-priority">Highest Priority Wins</SelectItem>
                <SelectItem value="context-based">Context-Based (Event overrides Global)</SelectItem>
                <SelectItem value="manual">Manual Resolution Required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <SwitchSetting
              label="Allow Context-Based Override"
              description="Event-specific classification can override global classification"
              checked={settings.contextOverride}
              onCheckedChange={(val) => handleSettingChange('contextOverride', val)}
            />
          </div>
        </SettingGroup>

        <Separator />

        {/* Classification List */}
        <SettingGroup title="Primary Classifications" description="Drag to reorder priority">
          <div className="space-y-2">
            {classifications.map((classification: Classification, index: number) => (
              <ClassificationRow key={classification.id} classification={classification} index={index} />
            ))}
          </div>
        </SettingGroup>

        {/* Warning Banner */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">Priority Order Matters</p>
              <p className="text-sm text-amber-800">
                When conflict resolution is set to "Highest Priority Wins", the top classification takes precedence.
                Drag to reorder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

const ClassificationRow = ({ classification, index }: { classification: Classification; index: number }) => {
  return (
    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
      <GripVertical size={16} className="text-slate-400 cursor-grab" />
      
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-mono">
          #{index + 1}
        </Badge>
        <span className="font-medium text-slate-900">{classification.name}</span>
        {classification.contextOverride && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Target size={14} className="text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>Allows context-based override</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {classification.usedIn.map((usage, idx) => (
            <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              {usage}
            </Badge>
          ))}
        </div>
        
        <Button variant="ghost" size="sm" className="h-8">
          <Edit size={14} />
        </Button>
      </div>
    </div>
  );
};

const AttributesSection = ({ customAttributes, setShowAddAttribute }: any) => {
  const [expandedGroup, setExpandedGroup] = useState<string>('professional');

  return (
    <ContentCard
      title="Identity Attributes & Custom Fields"
      description="Structured identity data fields (not related to permissions)"
      action={
        <Button onClick={() => setShowAddAttribute(true)} variant="outline" className="gap-2">
          <Plus size={16} />
          Create Custom Field
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Core Attributes */}
        <AttributeGroup
          title="Core Attributes"
          icon={Users}
          badge={<Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs"><Lock size={10} className="mr-1" />Locked</Badge>}
          expanded={expandedGroup === 'core'}
          onToggle={() => setExpandedGroup(expandedGroup === 'core' ? '' : 'core')}
        >
          <div className="grid grid-cols-2 gap-3">
            <FieldCard name="Name" type="Text" locked />
            <FieldCard name="Email" type="Email" locked />
            <FieldCard name="Phone" type="Phone" locked />
            <FieldCard name="Date of Birth" type="Date" locked />
          </div>
        </AttributeGroup>

        {/* Professional Attributes */}
        <AttributeGroup
          title="Professional Attributes"
          icon={Briefcase}
          badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">4 fields</Badge>}
          expanded={expandedGroup === 'professional'}
          onToggle={() => setExpandedGroup(expandedGroup === 'professional' ? '' : 'professional')}
        >
          <div className="grid grid-cols-2 gap-3">
            <FieldCard name="University" type="Text" visibility="public" />
            <FieldCard name="Graduation Year" type="Number" visibility="public" />
            <FieldCard name="Industry Sector" type="Dropdown" visibility="admin" />
            <FieldCard name="Job Title" type="Text" visibility="public" />
          </div>
        </AttributeGroup>

        {/* Contact Attributes */}
        <AttributeGroup
          title="Contact Attributes"
          icon={Mail}
          badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">3 fields</Badge>}
          expanded={expandedGroup === 'contact'}
          onToggle={() => setExpandedGroup(expandedGroup === 'contact' ? '' : 'contact')}
        >
          <div className="grid grid-cols-2 gap-3">
            <FieldCard name="LinkedIn URL" type="URL" visibility="public" />
            <FieldCard name="Twitter Handle" type="Text" visibility="public" />
            <FieldCard name="Website" type="URL" visibility="public" />
          </div>
        </AttributeGroup>

        {/* Custom Attributes */}
        <AttributeGroup
          title="Custom Attributes"
          icon={FileText}
          badge={<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">Custom</Badge>}
          expanded={expandedGroup === 'custom'}
          onToggle={() => setExpandedGroup(expandedGroup === 'custom' ? '' : 'custom')}
        >
          <div className="grid grid-cols-2 gap-3">
            {customAttributes.map((attr: CustomAttribute) => (
              <FieldCard
                key={attr.id}
                name={attr.name}
                type={attr.type.charAt(0).toUpperCase() + attr.type.slice(1)}
                visibility={attr.visibility}
                required={attr.required}
              />
            ))}
          </div>
        </AttributeGroup>
      </div>
    </ContentCard>
  );
};

const AttributeGroup = ({ title, icon: Icon, badge, expanded, onToggle, children }: any) => {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={16} className="text-slate-400" />
          ) : (
            <ChevronRight size={16} className="text-slate-400" />
          )}
          <Icon size={18} className="text-slate-500" />
          <span className="font-medium text-slate-900">{title}</span>
          {badge}
        </div>
      </button>
      {expanded && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          {children}
        </div>
      )}
    </div>
  );
};

const FieldCard = ({ name, type, visibility, locked, required }: any) => {
  const visibilityColors = {
    public: 'bg-green-50 text-green-700 border-green-200',
    admin: 'bg-orange-50 text-orange-700 border-orange-200',
    internal: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <div className="p-3 border border-slate-200 rounded-lg bg-white">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-slate-900">{name}</span>
        {locked && <Lock size={12} className="text-purple-600" />}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          {type}
        </Badge>
        {visibility && (
          <Badge variant="outline" className={`${visibilityColors[visibility as keyof typeof visibilityColors]} text-xs`}>
            {visibility}
          </Badge>
        )}
        {required && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
            Required
          </Badge>
        )}
      </div>
    </div>
  );
};

const VisibilitySection = ({ settings, setSettings, setHasChanges }: any) => {
  const classifications = ['attendee', 'alumni', 'speaker', 'jury', 'partner', 'admin'];
  const visibilityChannels = [
    { key: 'publicWebsite', label: 'Public Website', description: 'Profile visible on public directory' },
    { key: 'eventListings', label: 'Event Listings', description: 'Shown in event attendee/speaker lists' },
    { key: 'speakerJury', label: 'Speaker/Jury Directory', description: 'Appears in speaker/jury databases' },
    { key: 'campaigns', label: 'Campaigns', description: 'Eligible for marketing campaigns' }
  ];

  const handleVisibilityToggle = (classification: string, channel: string, value: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      visibilityMatrix: {
        ...prev.visibilityMatrix,
        [classification]: {
          ...prev.visibilityMatrix[classification],
          [channel]: value
        }
      }
    }));
    setHasChanges(true);
  };

  return (
    <ContentCard
      title="Visibility & Discovery Matrix"
      description="Control where each classification appears across the platform"
    >
      <div className="space-y-6">
        {/* Matrix Header Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Eye size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Visibility Controls:</strong> These settings control where person profiles appear based on their classification. 
              For example, Jury members may not appear in public directories but are visible in the jury database.
            </div>
          </div>
        </div>

        {/* Visibility Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-48">
                  Classification
                </th>
                {visibilityChannels.map((channel) => (
                  <th key={channel.key} className="px-4 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">
                    <div className="flex flex-col items-center gap-1">
                      <span>{channel.label}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={12} className="text-slate-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs">{channel.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classifications.map((classification) => (
                <tr key={classification} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-900 capitalize">
                        {classification}
                      </span>
                    </div>
                  </td>
                  {visibilityChannels.map((channel) => (
                    <td key={channel.key} className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={settings.visibilityMatrix[classification]?.[channel.key] || false}
                          onCheckedChange={(val) => handleVisibilityToggle(classification, channel.key, val)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Privacy Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900">
              <strong>Privacy Consideration:</strong> Even when visibility is enabled, individual users can always opt-out 
              via their privacy settings. These are defaults that can be overridden per person.
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

const VerificationSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentCard
      title="Identity Verification & Trust"
      description="Control how identities are verified and what verification enables"
    >
      <div className="space-y-6">
        {/* Email Verification */}
        <SettingGroup title="Email Verification" description="Confirm email ownership">
          <SwitchSetting
            label="Email Verification Required"
            description="Users must verify email before accessing platform"
            checked={settings.emailVerificationRequired}
            onCheckedChange={(val) => handleSettingChange('emailVerificationRequired', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </SettingGroup>

        <Separator />

        {/* Phone Verification */}
        <SettingGroup title="Phone Verification" description="SMS/call-based verification">
          <SwitchSetting
            label="Phone Verification Optional"
            description="Allow phone verification as additional trust signal"
            checked={settings.phoneVerificationOptional}
            onCheckedChange={(val) => handleSettingChange('phoneVerificationOptional', val)}
          />
        </SettingGroup>

        <Separator />

        {/* Manual Verification */}
        <SettingGroup title="Manual Verification" description="Admin-approved verification">
          <SwitchSetting
            label="Enable Manual Verification"
            description="Admins can manually verify identities"
            checked={settings.manualVerificationEnabled}
            onCheckedChange={(val) => handleSettingChange('manualVerificationEnabled', val)}
          />

          <div className="mt-4">
            <SwitchSetting
              label="Enable Document Upload"
              description="Allow users to upload ID documents for verification"
              checked={settings.documentUploadEnabled}
              onCheckedChange={(val) => handleSettingChange('documentUploadEnabled', val)}
            />
          </div>
        </SettingGroup>

        <Separator />

        {/* Verification Requirements */}
        <SettingGroup title="Verification Requirements" description="Roles/features that require verified identity">
          <div className="space-y-3">
            <SwitchSetting
              label="Require Verification for Critical Communications"
              description="Verified email required to receive transactional emails"
              checked={settings.verifiedRequiredForCriticalComms}
              onCheckedChange={(val) => handleSettingChange('verifiedRequiredForCriticalComms', val)}
            />

            <SwitchSetting
              label="Require Verification for Jury Participation"
              description="Jury members must have verified identities"
              checked={settings.verifiedRequiredForJury}
              onCheckedChange={(val) => handleSettingChange('verifiedRequiredForJury', val)}
            />

            <SwitchSetting
              label="Require Verification for Speaker Role"
              description="Speakers must have verified identities"
              checked={settings.verifiedRequiredForSpeaker}
              onCheckedChange={(val) => handleSettingChange('verifiedRequiredForSpeaker', val)}
            />
          </div>
        </SettingGroup>

        <Separator />

        {/* Auto-Demotion */}
        <SettingGroup title="Trust Signals" description="Automated trust adjustments">
          <SwitchSetting
            label="Auto-Demote on Email Bounce"
            description="Automatically mark email as unverified if it bounces"
            checked={settings.autoDemoteOnBounce}
            onCheckedChange={(val) => handleSettingChange('autoDemoteOnBounce', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </SettingGroup>

        {/* Security Notice */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm text-green-900">
              <strong>Identity Trust:</strong> Verification builds trust and reduces fraud. Verified identities are marked with a 
              checkmark badge throughout the platform.
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

const ConsentSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentCard
      title="Consent & Communication Eligibility"
      description="Default consent rules and override capabilities"
    >
      <div className="space-y-6">
        {/* Default Consent */}
        <SettingGroup title="Default Consent Settings" description="Initial consent state for new people">
          <SwitchSetting
            label="Default Opt-In for Communications"
            description="New person records automatically consent to communications"
            checked={settings.defaultConsentOptIn}
            onCheckedChange={(val) => handleSettingChange('defaultConsentOptIn', val)}
          />
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-900">
                <strong>GDPR Compliance:</strong> Default opt-in may not be compliant with GDPR/privacy regulations. 
                Consult legal counsel before enabling.
              </p>
            </div>
          </div>
        </SettingGroup>

        <Separator />

        {/* Override Capabilities */}
        <SettingGroup title="Consent Override Rules" description="Context-specific consent overrides">
          <SwitchSetting
            label="Allow Classification-Based Override"
            description="Different classifications can have different default consent"
            checked={settings.allowClassificationOverride}
            onCheckedChange={(val) => handleSettingChange('allowClassificationOverride', val)}
          />

          <div className="mt-4">
            <SwitchSetting
              label="Allow Event-Specific Override"
              description="Events can override global consent settings"
              checked={settings.allowEventOverride}
              onCheckedChange={(val) => handleSettingChange('allowEventOverride', val)}
            />
          </div>
        </SettingGroup>

        <Separator />

        {/* Award Confidentiality */}
        <SettingGroup title="Award Confidentiality" description="Special rules for award participants">
          <SwitchSetting
            label="Lock Confidentiality for Award Context"
            description="Award jury/nominees cannot opt-in to general campaigns during evaluation"
            checked={settings.awardConfidentialityLock}
            onCheckedChange={(val) => handleSettingChange('awardConfidentialityLock', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <p className="text-xs text-slate-500 mt-2">
            Prevents accidental disclosure of confidential award information via campaigns
          </p>
        </SettingGroup>

        {/* Privacy Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Consent Architecture:</strong> These are platform defaults. Individual consent is always tracked at the 
              person record level and can be modified per channel (email, SMS, phone).
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

const LifecycleSection = ({ settings, handleSettingChange }: any) => {
  return (
    <ContentCard
      title="Person Lifecycle & Data Retention"
      description="Automated archival, deletion, and GDPR compliance"
    >
      <div className="space-y-6">
        {/* Auto-Archive */}
        <SettingGroup title="Automatic Archival" description="Move inactive records to archive">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Auto-Archive After Inactivity</Label>
            <Select value={settings.autoArchiveMonths} onValueChange={(val) => handleSettingChange('autoArchiveMonths', val)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
                <SelectItem value="36">36 Months</SelectItem>
                <SelectItem value="never">Never Archive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Records with no activity (no logins, no registrations, no campaign engagement) will be auto-archived
            </p>
          </div>
        </SettingGroup>

        <Separator />

        {/* Deletion Handling */}
        <SettingGroup title="Deletion & Retention" description="What happens when records are deleted">
          <SwitchSetting
            label="Retain Minimal Data After Delete"
            description="Keep anonymous transaction history for financial/legal compliance"
            checked={settings.retainMinimalAfterDelete}
            onCheckedChange={(val) => handleSettingChange('retainMinimalAfterDelete', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <p className="text-xs text-slate-500 mt-2">
            Retains: transaction IDs, amounts, dates (no PII). Required for audit trails.
          </p>
        </SettingGroup>

        <Separator />

        {/* GDPR Compliance */}
        <SettingGroup title="GDPR & Right to Erasure" description="Full data deletion capabilities">
          <SwitchSetting
            label="Enable GDPR Erase Capability"
            description="Allow permanent, irreversible deletion of all person data"
            checked={settings.gdprEraseEnabled}
            onCheckedChange={(val) => handleSettingChange('gdprEraseEnabled', val)}
          />
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-900">
                <strong>Irreversible Action:</strong> GDPR erase permanently deletes ALL data including transaction history. 
                This cannot be undone. Use with extreme caution.
              </p>
            </div>
          </div>
        </SettingGroup>

        {/* Lifecycle Diagram */}
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Lifecycle Stages</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
            <span className="text-slate-400">→</span>
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Inactive</Badge>
            <span className="text-slate-400">→</span>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Archived</Badge>
            <span className="text-slate-400">→</span>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Deleted</Badge>
          </div>
        </div>

        {/* Governance Info */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-purple-600 mt-0.5 shrink-0" />
            <div className="text-sm text-purple-900">
              <strong>Data Governance:</strong> Lifecycle management ensures compliance with data retention laws while 
              maintaining operational integrity. Consult legal/compliance before changing these settings.
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
  );
};

const ImpactSection = () => {
  const dependencies = [
    { module: 'Campaigns', affected: 'High', description: 'Person classification affects campaign eligibility and segmentation' },
    { module: 'Registrations', affected: 'Medium', description: 'Identity verification rules apply to event registrations' },
    { module: 'Awards', affected: 'High', description: 'Jury/nominee classifications trigger confidentiality workflows' },
    { module: 'Communications', affected: 'High', description: 'Consent settings control email/SMS delivery' },
    { module: 'Finance', affected: 'Low', description: 'Person lifecycle affects transaction history retention' },
    { module: 'Forms', affected: 'Medium', description: 'Custom attributes appear in form builders' },
    { module: 'Reports', affected: 'Medium', description: 'Classification and attributes available for segmentation' },
    { module: 'Public Directory', affected: 'High', description: 'Visibility matrix controls directory appearance' }
  ];

  const getImpactBadge = (level: string) => {
    const configs = {
      High: 'bg-red-50 text-red-700 border-red-200',
      Medium: 'bg-orange-50 text-orange-700 border-orange-200',
      Low: 'bg-green-50 text-green-700 border-green-200'
    };
    return configs[level as keyof typeof configs];
  };

  return (
    <ContentCard
      title="Impact Preview & Dependencies"
      description="Understand how identity system changes affect other modules"
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Network size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900">
              <strong>System-Wide Impact:</strong> The People & Identity System is foundational. Changes here affect 
              campaigns, registrations, awards, communications, and more. Review dependencies carefully.
            </div>
          </div>
        </div>

        {/* Dependencies Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Module</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Impact Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dependencies.map((dep, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{dep.module}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={getImpactBadge(dep.affected)}>
                      {dep.affected} Impact
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{dep.description}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Example Scenarios */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">Example Impact Scenarios</h4>
          
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-900">
                <strong>Adding a new classification:</strong> New classification becomes available in campaign segmentation, 
                form routing rules, and report filters.
              </div>
            </div>
          </div>

          <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-orange-600 mt-0.5 shrink-0" />
              <div className="text-sm text-orange-900">
                <strong>Changing verification requirements:</strong> Existing users may lose access to features if 
                retroactively enforced. Plan migration carefully.
              </div>
            </div>
          </div>

          <div className="p-3 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <div className="text-sm text-red-900">
                <strong>Modifying visibility matrix:</strong> Changes affect public directory immediately. Alumni may 
                disappear from public listings if visibility is disabled.
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentCard>
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

const SettingGroup = ({ title, description, children }: any) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-3">
        {children}
      </div>
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

const AddClassificationDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Classification</DialogTitle>
          <DialogDescription>
            Create a new person classification type
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Classification Name *</Label>
            <Input placeholder="e.g., Volunteer" />
          </div>

          <div className="space-y-2">
            <Label>Used In</Label>
            <Input placeholder="Events, Campaigns, etc." />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="allow-multiple" defaultChecked />
            <label htmlFor="allow-multiple" className="text-sm">Allow multiple per person</label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="context-override" />
            <label htmlFor="context-override" className="text-sm">Allow context-based override</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Classification added successfully');
            onOpenChange(false);
          }}>
            Add Classification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddAttributeDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Custom Field</DialogTitle>
          <DialogDescription>
            Add a custom attribute to person records
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Field Name *</Label>
            <Input placeholder="e.g., Company Name" />
          </div>

          <div className="space-y-2">
            <Label>Field Type *</Label>
            <Select defaultValue="text">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="boolean">Yes/No</SelectItem>
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
                <SelectItem value="admin">Admin Only</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="required" />
            <label htmlFor="required" className="text-sm">Required field</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Custom field created successfully');
            onOpenChange(false);
          }}>
            Create Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
