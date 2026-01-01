import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, HardDrive, Upload, FileText, Shield, Activity, Database, Plus,
  Search, Save, X, Edit, Trash2, Eye, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, Info, AlertTriangle, Download, Settings, Copy, RefreshCw, Filter,
  Lock, Unlock, Cloud, Server, Folder, FileIcon, Image, Video, File, Archive,
  Clock, Users, TrendingUp, Zap, Globe
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
  | 'storage-config'
  | 'storage-locations'
  | 'file-categories'
  | 'upload-rules'
  | 'usage-permissions'
  | 'size-format-limits'
  | 'system-generated'
  | 'templates-documents'
  | 'exports-reports'
  | 'access-control'
  | 'data-retention'
  | 'virus-protection'
  | 'activity-logs'
  | 'cleanup-archival'
  | 'advanced-system';

interface StorageLocation {
  id: string;
  name: string;
  usedBy: string[];
  region: string;
  retentionPolicy: string;
  status: 'active' | 'inactive' | 'degraded';
  totalSize: string;
}

interface FileCategory {
  id: string;
  name: string;
  allowedTypes: string[];
  defaultVisibility: 'public' | 'private';
  linkedModules: string[];
  mandatory: boolean;
}

interface UploadRule {
  id: string;
  module: string;
  maxFileSize: number;
  maxFilesPerUpload: number;
  allowedFormats: string[];
  status: 'active' | 'inactive';
}

export const FilesAssetsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('storage-config');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);

  const [settings, setSettings] = useState({
    // Storage
    storageProvider: 's3',
    environment: 'production',
    encryptionAtRest: true,
    encryptionInTransit: true,
    separateStoragePerEnv: true,
    
    // Upload
    resumeUploads: true,
    clientValidation: true,
    serverValidation: true,
    concurrentUploadsLimit: 5,
    
    // System Generated
    autoGenerate: true,
    
    // Security
    virusScanEnabled: true,
    blockOnDetection: true,
    notifyOnThreat: true,
    quarantineInfected: true,
    blockHotlinking: true,
    
    // Exports
    watermarkExports: false,
    passwordProtectExports: true,
    
    // Cleanup
    autoCleanup: true,
    reviewBeforeDelete: true,
    
    // Advanced
    apiUploadEnabled: true
  });

  const [storageLocations] = useState<StorageLocation[]>([
    { id: 'LOC001', name: 'Event Media', usedBy: ['Events', 'Conferences'], region: 'EU-West-1', retentionPolicy: '3 years', status: 'active', totalSize: '2.4 TB' },
    { id: 'LOC002', name: 'Award Documents', usedBy: ['Awards', 'Jury'], region: 'EU-West-1', retentionPolicy: '7 years', status: 'active', totalSize: '850 GB' },
    { id: 'LOC003', name: 'Financial Invoices', usedBy: ['Finance', 'Payments'], region: 'EU-West-1', retentionPolicy: '10 years', status: 'active', totalSize: '1.2 TB' },
    { id: 'LOC004', name: 'Email Attachments', usedBy: ['Communications'], region: 'EU-West-1', retentionPolicy: '2 years', status: 'active', totalSize: '450 GB' },
    { id: 'LOC005', name: 'User Uploads (Temp)', usedBy: ['Applications', 'Forms'], region: 'EU-West-1', retentionPolicy: '90 days', status: 'degraded', totalSize: '120 GB' }
  ]);

  const [fileCategories] = useState<FileCategory[]>([
    { id: 'CAT001', name: 'Images', allowedTypes: ['jpg', 'png', 'gif', 'webp'], defaultVisibility: 'public', linkedModules: ['Events', 'Marketing'], mandatory: false },
    { id: 'CAT002', name: 'Videos', allowedTypes: ['mp4', 'mov', 'avi'], defaultVisibility: 'public', linkedModules: ['Events', 'Marketing'], mandatory: false },
    { id: 'CAT003', name: 'PDFs', allowedTypes: ['pdf'], defaultVisibility: 'private', linkedModules: ['Awards', 'Finance', 'Compliance'], mandatory: true },
    { id: 'CAT004', name: 'Spreadsheets', allowedTypes: ['xlsx', 'csv'], defaultVisibility: 'private', linkedModules: ['Finance', 'Reports'], mandatory: true },
    { id: 'CAT005', name: 'Certificates', allowedTypes: ['pdf', 'jpg', 'png'], defaultVisibility: 'private', linkedModules: ['Awards', 'Events'], mandatory: true }
  ]);

  const [uploadRules] = useState<UploadRule[]>([
    { id: 'RUL001', module: 'Events', maxFileSize: 50, maxFilesPerUpload: 20, allowedFormats: ['jpg', 'png', 'pdf', 'mp4'], status: 'active' },
    { id: 'RUL002', module: 'Awards', maxFileSize: 20, maxFilesPerUpload: 10, allowedFormats: ['pdf', 'docx'], status: 'active' },
    { id: 'RUL003', module: 'Finance', maxFileSize: 100, maxFilesPerUpload: 50, allowedFormats: ['pdf', 'xlsx', 'csv'], status: 'active' },
    { id: 'RUL004', module: 'Marketing', maxFileSize: 5, maxFilesPerUpload: 100, allowedFormats: ['jpg', 'png', 'gif'], status: 'active' }
  ]);

  const menuStructure = [
    {
      category: 'Asset Storage',
      items: [
        { id: 'storage-config' as SectionType, label: 'Storage Configuration', status: 'configured', icon: HardDrive },
        { id: 'storage-locations' as SectionType, label: 'Storage Locations', status: 'configured', icon: Folder },
        { id: 'file-categories' as SectionType, label: 'File Categories & Types', status: 'configured', icon: FileIcon }
      ]
    },
    {
      category: 'Upload & Usage Rules',
      items: [
        { id: 'upload-rules' as SectionType, label: 'Upload Rules', status: 'configured', icon: Upload },
        { id: 'usage-permissions' as SectionType, label: 'Asset Usage Permissions', status: 'configured', icon: Lock },
        { id: 'size-format-limits' as SectionType, label: 'File Size & Format Limits', status: 'configured', icon: Settings }
      ]
    },
    {
      category: 'Generated & System Files',
      items: [
        { id: 'system-generated' as SectionType, label: 'System-Generated Files', status: 'configured', icon: Zap },
        { id: 'templates-documents' as SectionType, label: 'Templates & Documents', status: 'configured', icon: FileText },
        { id: 'exports-reports' as SectionType, label: 'Exports & Reports', status: 'configured', icon: Download }
      ]
    },
    {
      category: 'Security & Compliance',
      items: [
        { id: 'access-control' as SectionType, label: 'Access Control', status: 'configured', icon: Shield },
        { id: 'data-retention' as SectionType, label: 'Data Retention', status: 'configured', icon: Clock },
        { id: 'virus-protection' as SectionType, label: 'Virus & Malware Protection', status: 'configured', icon: Shield }
      ]
    },
    {
      category: 'Operations & Audit',
      items: [
        { id: 'activity-logs' as SectionType, label: 'File Activity Logs', status: 'configured', icon: Activity },
        { id: 'cleanup-archival' as SectionType, label: 'Cleanup & Archival', status: 'configured', icon: Archive },
        { id: 'advanced-system' as SectionType, label: 'Advanced & System', status: 'configured', icon: Settings }
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
    toast.success('Files & Assets settings saved successfully');
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
            <span className="text-slate-900 font-medium">Files & Assets</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Files & Assets
              </h1>
              <p className="text-sm text-slate-500">
                Centralized control for all file uploads, storage, and asset management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Activity size={16} />
                View Activity Logs
              </Button>
              <Button variant="outline" className="gap-2">
                <Database size={16} />
                Storage Analytics
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
                    placeholder="Search settings..."
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
            {activeSection === 'storage-config' && (
              <StorageConfigSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'storage-locations' && (
              <StorageLocationsSection storageLocations={storageLocations} setShowAddLocation={setShowAddLocation} />
            )}

            {activeSection === 'file-categories' && (
              <FileCategoriesSection fileCategories={fileCategories} setShowAddCategory={setShowAddCategory} />
            )}

            {activeSection === 'upload-rules' && (
              <UploadRulesSection uploadRules={uploadRules} settings={settings} handleSettingChange={handleSettingChange} setShowAddRule={setShowAddRule} />
            )}

            {activeSection === 'virus-protection' && (
              <VirusProtectionSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'exports-reports' && (
              <ExportsReportsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'cleanup-archival' && (
              <CleanupArchivalSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'advanced-system' && (
              <AdvancedSystemSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {/* Placeholder sections */}
            {['usage-permissions', 'size-format-limits', 'system-generated', 'templates-documents', 'access-control', 'data-retention', 'activity-logs'].includes(activeSection) && (
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
      <AddLocationDialog open={showAddLocation} onOpenChange={setShowAddLocation} />
      <AddCategoryDialog open={showAddCategory} onOpenChange={setShowAddCategory} />
      <AddRuleDialog open={showAddRule} onOpenChange={setShowAddRule} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const StorageConfigSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Storage Configuration</h2>
            <p className="text-sm text-slate-500 mt-1">Define where and how files are stored</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-4">Last updated by Infrastructure Team on 2024-12-15 at 09:30</p>
      </div>

      {/* Storage Provider */}
      <ContentCard title="Storage Provider" description="Choose your storage backend">
        <div className="space-y-4">
          <FormField label="Provider" required>
            <Select value={settings.storageProvider} onValueChange={(val) => handleSettingChange('storageProvider', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Storage (Development Only)</SelectItem>
                <SelectItem value="s3">Amazon S3 (Recommended)</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="azure">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">Production environments should use cloud storage</p>
          </FormField>

          <FormField label="Environment">
            <Select value={settings.environment} onValueChange={(val) => handleSettingChange('environment', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="sandbox">Sandbox / Testing</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {settings.storageProvider === 's3' && (
            <>
              <FormField label="Default Storage Bucket">
                <Input defaultValue="nisau-production-assets" />
                <p className="text-xs text-slate-500 mt-1">S3 bucket name for primary storage</p>
              </FormField>

              <FormField label="AWS Region">
                <Select defaultValue="eu-west-1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                    <SelectItem value="eu-west-2">EU West (London)</SelectItem>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="ap-south-1">Asia Pacific (Mumbai)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </>
          )}
        </div>
      </ContentCard>

      {/* Security Settings */}
      <ContentCard title="Security Settings" description="Encryption and data protection">
        <div className="space-y-3">
          <SwitchField
            label="Encryption at Rest"
            description="Encrypt files when stored (AES-256)"
            checked={settings.encryptionAtRest}
            onCheckedChange={(val) => handleSettingChange('encryptionAtRest', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Encryption in Transit"
            description="Encrypt files during upload/download (TLS 1.3)"
            checked={settings.encryptionInTransit}
            onCheckedChange={(val) => handleSettingChange('encryptionInTransit', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Separate Storage Per Environment"
            description="Isolate production and sandbox storage buckets"
            checked={settings.separateStoragePerEnv}
            onCheckedChange={(val) => handleSettingChange('separateStoragePerEnv', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const StorageLocationsSection = ({ storageLocations, setShowAddLocation }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Storage Locations</h2>
            <p className="text-sm text-slate-500 mt-1">Organized storage buckets by purpose and retention</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {storageLocations.length} Locations
          </Badge>
        </div>
      </div>

      {/* Storage Locations Table */}
      <ContentCard
        title="Storage Locations"
        description="Configured storage buckets and their usage"
        action={
          <Button onClick={() => setShowAddLocation(true)} className="gap-2">
            <Plus size={16} />
            Add Location
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Location Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Used By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Retention</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Total Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {storageLocations.map((location: StorageLocation) => (
                <StorageLocationRow key={location.id} location={location} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const FileCategoriesSection = ({ fileCategories, setShowAddCategory }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">File Categories & Types</h2>
            <p className="text-sm text-slate-500 mt-1">Define file types and their allowed usage</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      {/* File Categories Table */}
      <ContentCard
        title="File Categories"
        description="Configured file types and access rules"
        action={
          <Button onClick={() => setShowAddCategory(true)} className="gap-2">
            <Plus size={16} />
            Add Category
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Allowed Types</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Default Visibility</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Linked Modules</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Mandatory</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {fileCategories.map((category: FileCategory) => (
                <FileCategoryRow key={category.id} category={category} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const UploadRulesSection = ({ uploadRules, settings, handleSettingChange, setShowAddRule }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Upload Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Configure upload limits and validation rules</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      {/* Global Upload Settings */}
      <ContentCard title="Global Upload Settings" description="Universal upload configuration">
        <div className="space-y-3">
          <SwitchField
            label="Enable Resumable Uploads"
            description="Allow users to resume interrupted uploads"
            checked={settings.resumeUploads}
            onCheckedChange={(val) => handleSettingChange('resumeUploads', val)}
          />
          <SwitchField
            label="Client-side Validation"
            description="Validate file types and sizes before upload"
            checked={settings.clientValidation}
            onCheckedChange={(val) => handleSettingChange('clientValidation', val)}
          />
          <SwitchField
            label="Server-side Validation"
            description="Re-validate files on server for security"
            checked={settings.serverValidation}
            onCheckedChange={(val) => handleSettingChange('serverValidation', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          
          <FormField label="Concurrent Uploads Limit">
            <Input 
              type="number" 
              min={1} 
              max={10} 
              value={settings.concurrentUploadsLimit} 
              onChange={(e) => handleSettingChange('concurrentUploadsLimit', e.target.value)} 
            />
            <p className="text-xs text-slate-500 mt-1">Maximum simultaneous uploads per user (1-10)</p>
          </FormField>
        </div>
      </ContentCard>

      {/* Module-Specific Upload Rules */}
      <ContentCard
        title="Module-Specific Upload Rules"
        description="Per-module upload restrictions"
        action={
          <Button onClick={() => setShowAddRule(true)} className="gap-2">
            <Plus size={16} />
            Add Upload Rule
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Module</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Max File Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Max Files</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Allowed Formats</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {uploadRules.map((rule: UploadRule) => (
                <UploadRuleRow key={rule.id} rule={rule} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const VirusProtectionSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Virus & Malware Protection</h2>
            <p className="text-sm text-slate-500 mt-1">Real-time scanning and threat detection</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      {/* Virus Scanning */}
      <ContentCard title="Virus Scanning" description="Configure file scanning behavior">
        <div className="space-y-3">
          <SwitchField
            label="Enable Virus Scanning"
            description="Scan all uploaded files for malware and viruses"
            checked={settings.virusScanEnabled}
            onCheckedChange={(val) => handleSettingChange('virusScanEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Block File on Detection"
            description="Automatically block files that fail virus scan"
            checked={settings.blockOnDetection}
            onCheckedChange={(val) => handleSettingChange('blockOnDetection', val)}
          />
          <SwitchField
            label="Notify Admins on Threat"
            description="Send email alerts when threats are detected"
            checked={settings.notifyOnThreat}
            onCheckedChange={(val) => handleSettingChange('notifyOnThreat', val)}
          />
          <SwitchField
            label="Quarantine Infected Files"
            description="Move infected files to quarantine for review"
            checked={settings.quarantineInfected}
            onCheckedChange={(val) => handleSettingChange('quarantineInfected', val)}
          />
        </div>
      </ContentCard>

      {/* Threat Detection Stats */}
      <ContentCard title="Threat Detection Statistics" description="Recent scanning activity">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">1,247</div>
            <div className="text-xs text-blue-700 mt-1">Files Scanned Today</div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-2xl font-bold text-amber-900">3</div>
            <div className="text-xs text-amber-700 mt-1">Threats Detected (30 days)</div>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-2xl font-bold text-red-900">3</div>
            <div className="text-xs text-red-700 mt-1">Quarantined Files</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-xs text-green-700 mb-1">Last Scan</div>
            <div className="text-sm font-semibold text-green-900">2 minutes ago</div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const ExportsReportsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Exports & Reports</h2>
            <p className="text-sm text-slate-500 mt-1">Configure export security and storage</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Export Settings" description="Security and branding for exports">
        <div className="space-y-3">
          <SwitchField
            label="Apply Watermark to Exports"
            description="Add organization watermark to exported documents"
            checked={settings.watermarkExports}
            onCheckedChange={(val) => handleSettingChange('watermarkExports', val)}
          />
          <SwitchField
            label="Password-Protect Sensitive Exports"
            description="Require password for finance and compliance exports"
            checked={settings.passwordProtectExports}
            onCheckedChange={(val) => handleSettingChange('passwordProtectExports', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const CleanupArchivalSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Cleanup & Archival</h2>
            <p className="text-sm text-slate-500 mt-1">Automated file retention and cleanup policies</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Automatic Cleanup" description="Configure automated file cleanup">
        <div className="space-y-3">
          <SwitchField
            label="Enable Automatic Cleanup"
            description="Automatically remove expired files based on retention policies"
            checked={settings.autoCleanup}
            onCheckedChange={(val) => handleSettingChange('autoCleanup', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Review Files Before Deletion"
            description="Require admin approval before permanent deletion"
            checked={settings.reviewBeforeDelete}
            onCheckedChange={(val) => handleSettingChange('reviewBeforeDelete', val)}
          />
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
            <h2 className="text-lg font-semibold text-slate-900">Advanced & System</h2>
            <p className="text-sm text-slate-500 mt-1">Advanced configuration and system features</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard title="Advanced Features" description="API and security features">
        <div className="space-y-3">
          <SwitchField
            label="API Upload Enabled"
            description="Allow file uploads via REST API"
            checked={settings.apiUploadEnabled}
            onCheckedChange={(val) => handleSettingChange('apiUploadEnabled', val)}
          />
          <SwitchField
            label="Block Hotlinking"
            description="Prevent direct file access from external websites"
            checked={settings.blockHotlinking}
            onCheckedChange={(val) => handleSettingChange('blockHotlinking', val)}
            badge={<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Security</Badge>}
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

const StorageLocationRow = ({ location }: { location: StorageLocation }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-blue-600" />
          <div>
            <div className="font-medium text-slate-900">{location.name}</div>
            <div className="text-xs text-slate-500">{location.id}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {location.usedBy.map((module, idx) => (
            <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
              {module}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          {location.region}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-700">{location.retentionPolicy}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">{location.totalSize}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          location.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
          location.status === 'degraded' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-slate-100 text-slate-600 border-slate-200'
        }>
          {location.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
          {location.status === 'degraded' && <AlertTriangle size={10} className="mr-1" />}
          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Settings size={14} />
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

const FileCategoryRow = ({ category }: { category: FileCategory }) => {
  const getCategoryIcon = (name: string) => {
    if (name === 'Images') return Image;
    if (name === 'Videos') return Video;
    return FileText;
  };

  const Icon = getCategoryIcon(category.name);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
            <Icon size={16} className="text-blue-600" />
          </div>
          <span className="font-medium text-slate-900">{category.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {category.allowedTypes.map((type, idx) => (
            <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-mono">
              {type}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          category.defaultVisibility === 'public' 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }>
          {category.defaultVisibility.charAt(0).toUpperCase() + category.defaultVisibility.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {category.linkedModules.map((module, idx) => (
            <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              {module}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        {category.mandatory ? (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs gap-1">
            <Lock size={10} />
            Yes
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">No</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Switch checked={true} />
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

const UploadRuleRow = ({ rule }: { rule: UploadRule }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <span className="font-medium text-slate-900">{rule.module}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">{rule.maxFileSize} MB</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-700">{rule.maxFilesPerUpload}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {rule.allowedFormats.map((format, idx) => (
            <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs font-mono">
              {format}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <Switch checked={rule.status === 'active'} />
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

const FormField = ({ label, required, children }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </Label>
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

const AddLocationDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Storage Location</DialogTitle>
          <DialogDescription>
            Create a new storage bucket configuration
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Location Name *</Label>
            <Input placeholder="e.g., Event Media" />
          </div>
          <div className="space-y-2">
            <Label>Retention Policy *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="3">3 years</SelectItem>
                <SelectItem value="7">7 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Storage location created successfully');
            onOpenChange(false);
          }}>
            Create Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddCategoryDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add File Category</DialogTitle>
          <DialogDescription>
            Define a new file type category
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category Name *</Label>
            <Input placeholder="e.g., Audio Files" />
          </div>
          <div className="space-y-2">
            <Label>Allowed File Types *</Label>
            <Input placeholder="e.g., mp3, wav, flac" />
            <p className="text-xs text-slate-500">Comma-separated file extensions</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('File category created successfully');
            onOpenChange(false);
          }}>
            Create Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddRuleDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Upload Rule</DialogTitle>
          <DialogDescription>
            Create module-specific upload restrictions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Module *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="people">People</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max File Size (MB) *</Label>
              <Input type="number" placeholder="50" />
            </div>
            <div className="space-y-2">
              <Label>Max Files per Upload *</Label>
              <Input type="number" placeholder="20" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Upload rule created successfully');
            onOpenChange(false);
          }}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
