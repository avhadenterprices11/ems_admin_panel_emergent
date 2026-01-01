import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Languages, Clock, MapPin, Calendar, Type, FileText, Users, Zap,
  Shield, Activity, Database, Plus, Search, Save, X, Edit, Trash2, Eye,
  ChevronRight, ChevronDown, GripVertical, CheckCircle2, XCircle, AlertCircle,
  Info, AlertTriangle, Download, Upload, Settings, Copy, ExternalLink, RefreshCw,
  Filter, MoreVertical, TrendingUp, Lock, Unlock
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
  | 'supported-languages'
  | 'default-language'
  | 'fallback-logic'
  | 'regions-countries'
  | 'timezones'
  | 'locale-assignment'
  | 'date-time-formats'
  | 'number-currency-formats'
  | 'address-formatting'
  | 'translated-content'
  | 'missing-translation'
  | 'content-overrides'
  | 'user-localization'
  | 'event-localization'
  | 'dynamic-switching'
  | 'geo-detection'
  | 'localization-permissions'
  | 'audit-log'
  | 'data-retention';

interface Language {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  isDefault: boolean;
  coverage: number;
  rtl: boolean;
}

interface Region {
  id: string;
  name: string;
  countries: string[];
  defaultLanguage: string;
  defaultCurrency: string;
  status: 'active' | 'inactive';
}

interface LocaleRule {
  id: string;
  name: string;
  condition: string;
  result: string;
  priority: number;
  status: 'active' | 'inactive';
}

export const LocalizationRegionsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('supported-languages');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);

  const [settings, setSettings] = useState({
    // Languages
    globalDefaultLanguage: 'en',
    adminDefaultLanguage: 'en',
    publicDefaultLanguage: 'en',
    emailDefaultLanguage: 'en',

    // Language Availability
    adminUILanguages: true,
    publicPagesLanguages: true,
    emailLanguages: true,
    formLanguages: true,
    certificateLanguages: false,

    // Timezones
    globalTimezone: 'Europe/London',
    autoDetectTimezone: true,
    handleDST: true,

    // Formats
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    decimalSeparator: '.',
    thousandSeparator: ',',
    currencySymbolPosition: 'before',

    // Locale Assignment
    ipCountryEnabled: true,
    userProfileEnabled: true,
    eventLocationEnabled: true,
    browserLanguageEnabled: true,

    // User Localization
    allowUserLanguageChange: true,
    persistLanguage: true,
    b2bLocaleLock: false,

    // Event Localization
    multiLanguageEvents: true,
    eventTimezoneEnforcement: true,

    // Dynamic Switching
    showLanguageSwitcher: true,
    persistAcrossSessions: true,

    // Geo Detection
    geoProvider: 'maxmind',
    accuracyThreshold: 95,
    handleVPN: true,

    // Missing Translation
    missingTranslationBehavior: 'fallback',
    showPlaceholder: false,
    blockPublish: false
  });

  const [languages] = useState<Language[]>([
    { id: 'L001', name: 'English', code: 'en', status: 'active', isDefault: true, coverage: 100, rtl: false },
    { id: 'L002', name: 'Hindi', code: 'hi', status: 'active', isDefault: false, coverage: 87, rtl: false },
    { id: 'L003', name: 'French', code: 'fr', status: 'active', isDefault: false, coverage: 72, rtl: false },
    { id: 'L004', name: 'Spanish', code: 'es', status: 'inactive', isDefault: false, coverage: 45, rtl: false }
  ]);

  const [regions] = useState<Region[]>([
    { id: 'R001', name: 'United Kingdom & Ireland', countries: ['UK', 'IE'], defaultLanguage: 'English', defaultCurrency: 'GBP', status: 'active' },
    { id: 'R002', name: 'India & South Asia', countries: ['IN', 'PK', 'BD'], defaultLanguage: 'English', defaultCurrency: 'INR', status: 'active' },
    { id: 'R003', name: 'European Union', countries: ['FR', 'DE', 'IT', 'ES'], defaultLanguage: 'English', defaultCurrency: 'EUR', status: 'active' }
  ]);

  const [localeRules] = useState<LocaleRule[]>([
    { id: 'LR001', name: 'India → Hindi', condition: 'IP Country = IN', result: 'Language: hi', priority: 1, status: 'active' },
    { id: 'LR002', name: 'France → French', condition: 'IP Country = FR', result: 'Language: fr', priority: 2, status: 'active' },
    { id: 'LR003', name: 'Browser Language', condition: 'Browser = fr', result: 'Language: fr', priority: 3, status: 'active' }
  ]);

  const menuStructure = [
    {
      category: 'Languages',
      items: [
        { id: 'supported-languages' as SectionType, label: 'Supported Languages', status: 'configured' },
        { id: 'default-language' as SectionType, label: 'Default Language Rules', status: 'configured' },
        { id: 'fallback-logic' as SectionType, label: 'Fallback Language Logic', status: 'configured' }
      ]
    },
    {
      category: 'Regional Configuration',
      items: [
        { id: 'regions-countries' as SectionType, label: 'Regions & Countries', status: 'configured' },
        { id: 'timezones' as SectionType, label: 'Timezones', status: 'configured' },
        { id: 'locale-assignment' as SectionType, label: 'Locale Assignment Rules', status: 'configured' }
      ]
    },
    {
      category: 'Formatting & Display',
      items: [
        { id: 'date-time-formats' as SectionType, label: 'Date & Time Formats', status: 'configured' },
        { id: 'number-currency-formats' as SectionType, label: 'Number & Currency Formatting', status: 'configured' },
        { id: 'address-formatting' as SectionType, label: 'Address Formatting', status: 'not-set' }
      ]
    },
    {
      category: 'Content Localization',
      items: [
        { id: 'translated-content' as SectionType, label: 'Translated Content Management', status: 'attention' },
        { id: 'missing-translation' as SectionType, label: 'Missing Translation Rules', status: 'configured' },
        { id: 'content-overrides' as SectionType, label: 'Content Override Rules', status: 'not-set' }
      ]
    },
    {
      category: 'User & Event Localization',
      items: [
        { id: 'user-localization' as SectionType, label: 'User Localization Rules', status: 'configured' },
        { id: 'event-localization' as SectionType, label: 'Event Localization Rules', status: 'configured' },
        { id: 'dynamic-switching' as SectionType, label: 'Dynamic Locale Switching', status: 'configured' }
      ]
    },
    {
      category: 'Advanced',
      items: [
        { id: 'geo-detection' as SectionType, label: 'Geo Detection Rules', status: 'configured' },
        { id: 'localization-permissions' as SectionType, label: 'Localization Permissions', status: 'configured' },
        { id: 'audit-log' as SectionType, label: 'Localization Audit Log', status: 'configured' },
        { id: 'data-retention' as SectionType, label: 'Localization Data Retention', status: 'configured' }
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
    toast.success('Localization settings saved successfully');
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    toast.info('Changes discarded');
    setHasChanges(false);
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'configured':
        return 'bg-green-500';
      case 'attention':
        return 'bg-amber-500';
      case 'not-set':
        return 'bg-slate-300';
      default:
        return 'bg-slate-300';
    }
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
            <span className="text-slate-900 font-medium">Localization & Regions</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Localization & Regions
              </h1>
              <p className="text-sm text-slate-500">
                Manage languages, regions, timezones, and formatting rules
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Search localization settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Eye size={16} />
                View Localization Audit Log
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
                    placeholder="Search..."
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
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg mb-1 transition-all text-sm flex items-center justify-between",
                            isActive
                              ? "bg-blue-50 text-blue-900 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          <span>{item.label}</span>
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
            {activeSection === 'supported-languages' && (
              <SupportedLanguagesSection 
                languages={languages} 
                settings={settings} 
                handleSettingChange={handleSettingChange}
                setShowAddLanguage={setShowAddLanguage}
              />
            )}

            {activeSection === 'default-language' && (
              <DefaultLanguageSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'fallback-logic' && (
              <PlaceholderSection title="Fallback Language Logic" />
            )}

            {activeSection === 'regions-countries' && (
              <RegionsCountriesSection regions={regions} setShowAddRegion={setShowAddRegion} />
            )}

            {activeSection === 'timezones' && (
              <TimezonesSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'locale-assignment' && (
              <LocaleAssignmentSection 
                settings={settings} 
                handleSettingChange={handleSettingChange}
                localeRules={localeRules}
                setShowAddRule={setShowAddRule}
              />
            )}

            {activeSection === 'date-time-formats' && (
              <DateTimeFormatsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'number-currency-formats' && (
              <NumberCurrencyFormatsSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'address-formatting' && (
              <PlaceholderSection title="Address Formatting" status="not-set" />
            )}

            {activeSection === 'translated-content' && (
              <TranslatedContentSection languages={languages} />
            )}

            {activeSection === 'missing-translation' && (
              <MissingTranslationSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'content-overrides' && (
              <PlaceholderSection title="Content Override Rules" status="not-set" />
            )}

            {activeSection === 'user-localization' && (
              <UserLocalizationSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'event-localization' && (
              <EventLocalizationSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'dynamic-switching' && (
              <DynamicSwitchingSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'geo-detection' && (
              <GeoDetectionSection settings={settings} handleSettingChange={handleSettingChange} />
            )}

            {activeSection === 'localization-permissions' && (
              <PlaceholderSection title="Localization Permissions" />
            )}

            {activeSection === 'audit-log' && (
              <PlaceholderSection title="Localization Audit Log" />
            )}

            {activeSection === 'data-retention' && (
              <PlaceholderSection title="Localization Data Retention" />
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
      <AddLanguageDialog open={showAddLanguage} onOpenChange={setShowAddLanguage} />
      <AddRegionDialog open={showAddRegion} onOpenChange={setShowAddRegion} />
      <AddRuleDialog open={showAddRule} onOpenChange={setShowAddRule} />
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const SupportedLanguagesSection = ({ languages, settings, handleSettingChange, setShowAddLanguage }: any) => {
  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Supported Languages</h2>
            <p className="text-sm text-slate-500 mt-1">Manage languages available across your platform</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-4">Last updated by Sarah Johnson on 2024-12-18 at 10:22</p>
      </div>

      {/* Enabled Languages */}
      <ContentCard
        title="Enabled Languages"
        description="Languages available across your organization"
        action={
          <Button onClick={() => setShowAddLanguage(true)} className="gap-2">
            <Plus size={16} />
            Add Language
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Language</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Default</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Coverage</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {languages.map((language: Language) => (
                <LanguageRow key={language.id} language={language} />
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Language Availability */}
      <ContentCard
        title="Language Availability"
        description="Control where language selection is enabled"
      >
        <div className="space-y-3">
          <SwitchField
            label="Admin UI Languages"
            description="Allow admins to switch languages in admin interface"
            checked={settings.adminUILanguages}
            onCheckedChange={(val) => handleSettingChange('adminUILanguages', val)}
          />
          <SwitchField
            label="Public Pages & Forms Languages"
            description="Enable language switcher on public event pages"
            checked={settings.publicPagesLanguages}
            onCheckedChange={(val) => handleSettingChange('publicPagesLanguages', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Email Languages"
            description="Send emails in recipient's preferred language"
            checked={settings.emailLanguages}
            onCheckedChange={(val) => handleSettingChange('emailLanguages', val)}
          />
          <SwitchField
            label="Form Languages"
            description="Multi-language support for custom forms"
            checked={settings.formLanguages}
            onCheckedChange={(val) => handleSettingChange('formLanguages', val)}
          />
          <SwitchField
            label="Certificate Languages"
            description="Generate certificates in multiple languages"
            checked={settings.certificateLanguages}
            onCheckedChange={(val) => handleSettingChange('certificateLanguages', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const DefaultLanguageSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Default Language Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Configure default languages for different contexts</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Default Language Configuration"
        description="Set default languages for various system areas"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Global Default Language">
            <Select value={settings.globalDefaultLanguage} onValueChange={(val) => handleSettingChange('globalDefaultLanguage', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Admin Default Language">
            <Select value={settings.adminDefaultLanguage} onValueChange={(val) => handleSettingChange('adminDefaultLanguage', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Public Default Language">
            <Select value={settings.publicDefaultLanguage} onValueChange={(val) => handleSettingChange('publicDefaultLanguage', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Email Default Language">
            <Select value={settings.emailDefaultLanguage} onValueChange={(val) => handleSettingChange('emailDefaultLanguage', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </ContentCard>
    </div>
  );
};

const RegionsCountriesSection = ({ regions, setShowAddRegion }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Regions & Countries</h2>
            <p className="text-sm text-slate-500 mt-1">Define regional groupings and default settings</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Regional Settings"
        description="Manage regional configurations and defaults"
        action={
          <Button onClick={() => setShowAddRegion(true)} className="gap-2">
            <Plus size={16} />
            Add Region
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Countries</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Default Language</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Default Currency</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {regions.map((region: Region) => (
                <tr key={region.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-blue-600" />
                      <span className="font-medium text-slate-900">{region.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {region.countries.map((country, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{region.defaultLanguage}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {region.defaultCurrency}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      region.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }>
                      {region.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                      {region.status.charAt(0).toUpperCase() + region.status.slice(1)}
                    </Badge>
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
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
};

const TimezonesSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Timezones</h2>
            <p className="text-sm text-slate-500 mt-1">Configure timezone handling and detection</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Timezone Settings"
        description="Global timezone configuration"
      >
        <div className="space-y-4">
          <FormField label="Global Timezone">
            <Select value={settings.globalTimezone} onValueChange={(val) => handleSettingChange('globalTimezone', val)}>
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

          <Separator />

          <div className="space-y-3">
            <SwitchField
              label="Auto-Detect User Timezone"
              description="Automatically detect and use user's timezone"
              checked={settings.autoDetectTimezone}
              onCheckedChange={(val) => handleSettingChange('autoDetectTimezone', val)}
              badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
            />
            <SwitchField
              label="Handle Daylight Saving Time (DST)"
              description="Automatically adjust for DST transitions"
              checked={settings.handleDST}
              onCheckedChange={(val) => handleSettingChange('handleDST', val)}
            />
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const LocaleAssignmentSection = ({ settings, handleSettingChange, localeRules, setShowAddRule }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Locale Assignment Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Configure how users are assigned locales automatically</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Locale Assignment Factors"
        description="Enable detection methods for automatic locale assignment"
      >
        <div className="space-y-3">
          <SwitchField
            label="IP Country Detection"
            description="Detect locale from user's IP address geolocation"
            checked={settings.ipCountryEnabled}
            onCheckedChange={(val) => handleSettingChange('ipCountryEnabled', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="User Profile Settings"
            description="Use language/region from user's profile preferences"
            checked={settings.userProfileEnabled}
            onCheckedChange={(val) => handleSettingChange('userProfileEnabled', val)}
          />
          <SwitchField
            label="Event Location"
            description="Use event's physical location for locale assignment"
            checked={settings.eventLocationEnabled}
            onCheckedChange={(val) => handleSettingChange('eventLocationEnabled', val)}
          />
          <SwitchField
            label="Browser Language"
            description="Detect language from browser's Accept-Language header"
            checked={settings.browserLanguageEnabled}
            onCheckedChange={(val) => handleSettingChange('browserLanguageEnabled', val)}
          />
        </div>
      </ContentCard>

      <ContentCard
        title="Locale Assignment Rules"
        description="Priority-ordered rules for locale assignment"
        action={
          <Button onClick={() => setShowAddRule(true)} className="gap-2">
            <Plus size={16} />
            Add Rule
          </Button>
        }
      >
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Rule Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Condition</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Result</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {localeRules.map((rule: LocaleRule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <GripVertical size={16} className="text-slate-400 cursor-move" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        #{rule.priority}
                      </Badge>
                      <span className="font-medium text-slate-900">{rule.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {rule.condition}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {rule.result}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{rule.priority}</span>
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Rule Priority:</strong> Rules are evaluated in priority order (1 = highest). 
              The first matching rule determines the locale. Drag to reorder.
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const DateTimeFormatsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Date & Time Formats</h2>
            <p className="text-sm text-slate-500 mt-1">Configure date and time display formats</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Date & Time Configuration"
        description="Set default date and time formatting"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date Format">
              <Select value={settings.dateFormat} onValueChange={(val) => handleSettingChange('dateFormat', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (29/12/2024)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/29/2024)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-29)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Time Format">
              <Select value={settings.timeFormat} onValueChange={(val) => handleSettingChange('timeFormat', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <Separator />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Preview</h4>
            <div className="space-y-1 text-sm text-slate-600">
              <div>Date: <span className="font-mono">29/12/2024</span></div>
              <div>Time: <span className="font-mono">14:30</span></div>
              <div>DateTime: <span className="font-mono">29/12/2024 14:30</span></div>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const NumberCurrencyFormatsSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Number & Currency Formatting</h2>
            <p className="text-sm text-slate-500 mt-1">Configure number and currency display formats</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Number & Currency Configuration"
        description="Set decimal and currency formatting rules"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Decimal Separator">
              <Select value={settings.decimalSeparator} onValueChange={(val) => handleSettingChange('decimalSeparator', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=".">Period (.)</SelectItem>
                  <SelectItem value=",">Comma (,)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Thousand Separator">
              <Select value={settings.thousandSeparator} onValueChange={(val) => handleSettingChange('thousandSeparator', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=".">Period (.)</SelectItem>
                  <SelectItem value=" ">Space ( )</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Currency Symbol Position">
            <Select value={settings.currencySymbolPosition} onValueChange={(val) => handleSettingChange('currencySymbolPosition', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before Amount (£100.00)</SelectItem>
                <SelectItem value="after">After Amount (100.00£)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <Separator />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Preview</h4>
            <div className="space-y-1 text-sm text-slate-600">
              <div>Number: <span className="font-mono">1,234,567.89</span></div>
              <div>Currency: <span className="font-mono">£1,234.56</span></div>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const TranslatedContentSection = ({ languages }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Translated Content Management</h2>
            <p className="text-sm text-slate-500 mt-1">Monitor translation coverage and manage content gaps</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Requires Attention</Badge>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900 mb-1">Content Gaps Detected</h4>
            <p className="text-sm text-amber-800">
              2 languages have incomplete translations. Spanish has only 45% coverage, French has 72% coverage.
            </p>
          </div>
        </div>
      </div>

      <ContentCard
        title="Translation Coverage by Language"
        description="Track translation completeness for each language"
        action={
          <Button variant="outline" className="gap-2">
            <Download size={14} />
            Export Report
          </Button>
        }
      >
        <div className="space-y-4">
          {languages.map((language: Language) => (
            <div key={language.id} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Languages size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{language.name}</div>
                    <code className="text-xs font-mono text-slate-500">{language.code}</code>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye size={14} />
                  View Gaps
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full ${
                      language.coverage >= 90 ? 'bg-green-500' :
                      language.coverage >= 70 ? 'bg-blue-500' :
                      language.coverage >= 50 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${language.coverage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-slate-900 w-16 text-right">
                  {language.coverage}%
                </span>
              </div>
              <div className="mt-2 text-xs">
                {language.coverage < 100 ? (
                  <span className="text-amber-700">
                    {Math.round((100 - language.coverage) * 1.5)} strings missing
                  </span>
                ) : (
                  <span className="text-green-700">✓ All strings translated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ContentCard>
    </div>
  );
};

const MissingTranslationSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Missing Translation Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Configure behavior when translations are missing</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Missing Translation Behavior"
        description="Define what happens when a translation is missing"
      >
        <div className="space-y-4">
          <FormField label="Behavior">
            <Select value={settings.missingTranslationBehavior} onValueChange={(val) => handleSettingChange('missingTranslationBehavior', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fallback">Fallback to Default Language</SelectItem>
                <SelectItem value="placeholder">Show Placeholder Text</SelectItem>
                <SelectItem value="block">Block Content Display</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <Separator />

          <div className="space-y-3">
            <SwitchField
              label="Show Translation Placeholder"
              description="Display [MISSING_TRANSLATION] in development"
              checked={settings.showPlaceholder}
              onCheckedChange={(val) => handleSettingChange('showPlaceholder', val)}
            />
            <SwitchField
              label="Block Publish if Incomplete"
              description="Prevent publishing content with missing translations"
              checked={settings.blockPublish}
              onCheckedChange={(val) => handleSettingChange('blockPublish', val)}
            />
          </div>
        </div>
      </ContentCard>
    </div>
  );
};

const UserLocalizationSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">User Localization Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Control user language preferences and switching</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="User Localization Settings"
        description="User language preference controls"
      >
        <div className="space-y-3">
          <SwitchField
            label="Allow User Language Change"
            description="Users can change their preferred language"
            checked={settings.allowUserLanguageChange}
            onCheckedChange={(val) => handleSettingChange('allowUserLanguageChange', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
          <SwitchField
            label="Persist Language Preference"
            description="Remember user's language selection across sessions"
            checked={settings.persistLanguage}
            onCheckedChange={(val) => handleSettingChange('persistLanguage', val)}
          />
          <SwitchField
            label="B2B Organization Locale Lock"
            description="Force organization-wide locale for B2B accounts"
            checked={settings.b2bLocaleLock}
            onCheckedChange={(val) => handleSettingChange('b2bLocaleLock', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const EventLocalizationSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Event Localization Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Configure event-specific localization behavior</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Event Localization Settings"
        description="Event-specific locale handling"
      >
        <div className="space-y-3">
          <SwitchField
            label="Enable Multi-Language Events"
            description="Allow events to support multiple languages"
            checked={settings.multiLanguageEvents}
            onCheckedChange={(val) => handleSettingChange('multiLanguageEvents', val)}
          />
          <SwitchField
            label="Event Timezone Enforcement"
            description="Always display event times in event's timezone"
            checked={settings.eventTimezoneEnforcement}
            onCheckedChange={(val) => handleSettingChange('eventTimezoneEnforcement', val)}
            badge={<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Recommended</Badge>}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const DynamicSwitchingSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dynamic Locale Switching</h2>
            <p className="text-sm text-slate-500 mt-1">Real-time language switching configuration</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Dynamic Switching Settings"
        description="Configure language switcher behavior"
      >
        <div className="space-y-3">
          <SwitchField
            label="Show Language Switcher"
            description="Display language selector in user interface"
            checked={settings.showLanguageSwitcher}
            onCheckedChange={(val) => handleSettingChange('showLanguageSwitcher', val)}
          />
          <SwitchField
            label="Persist Across Sessions"
            description="Remember language selection after logout"
            checked={settings.persistAcrossSessions}
            onCheckedChange={(val) => handleSettingChange('persistAcrossSessions', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const GeoDetectionSection = ({ settings, handleSettingChange }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Geo Detection Rules</h2>
            <p className="text-sm text-slate-500 mt-1">Configure IP geolocation detection</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
        </div>
      </div>

      <ContentCard
        title="Geo Detection Settings"
        description="IP-based location detection configuration"
      >
        <div className="space-y-4">
          <FormField label="Geolocation Provider">
            <Select value={settings.geoProvider} onValueChange={(val) => handleSettingChange('geoProvider', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maxmind">MaxMind GeoIP2</SelectItem>
                <SelectItem value="ip2location">IP2Location</SelectItem>
                <SelectItem value="cloudflare">CloudFlare</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Accuracy Threshold (%)">
            <div className="space-y-2">
              <Input
                type="number"
                value={settings.accuracyThreshold}
                onChange={(e) => handleSettingChange('accuracyThreshold', parseInt(e.target.value))}
                min={0}
                max={100}
              />
              <p className="text-xs text-slate-500">Minimum confidence level for geo detection</p>
            </div>
          </FormField>

          <Separator />

          <SwitchField
            label="Handle VPN/Proxy Detection"
            description="Attempt to detect and handle VPN/proxy usage"
            checked={settings.handleVPN}
            onCheckedChange={(val) => handleSettingChange('handleVPN', val)}
          />
        </div>
      </ContentCard>
    </div>
  );
};

const PlaceholderSection = ({ title, status }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">Configuration section coming soon</p>
          </div>
          {status === 'not-set' ? (
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Not Set</Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Configured</Badge>
          )}
        </div>
      </div>

      <ContentCard
        title={title}
        description="This feature is currently under development"
      >
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

const LanguageRow = ({ language }: { language: Language }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Languages size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{language.name}</div>
            {language.rtl && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs mt-1">
                RTL
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {language.code}
        </code>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={
          language.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
          'bg-slate-100 text-slate-600 border-slate-200'
        }>
          {language.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
          {language.status.charAt(0).toUpperCase() + language.status.slice(1)}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {language.isDefault ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs gap-1">
            <CheckCircle2 size={10} />
            Default
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${
                language.coverage >= 90 ? 'bg-green-500' :
                language.coverage >= 70 ? 'bg-blue-500' :
                language.coverage >= 50 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${language.coverage}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-slate-700 w-12 text-right">
            {language.coverage}%
          </span>
        </div>
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

const AddLanguageDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Language</DialogTitle>
          <DialogDescription>
            Add a new language to your platform
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Language *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language Code *</Label>
            <Input placeholder="e.g., de" />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox />
            <label className="text-sm text-slate-700">Set as default language</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Language added successfully');
            onOpenChange(false);
          }}>
            Add Language
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddRegionDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Region</DialogTitle>
          <DialogDescription>
            Create a new regional configuration
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Region Name *</Label>
            <Input placeholder="e.g., North America" />
          </div>

          <div className="space-y-2">
            <Label>Countries *</Label>
            <Input placeholder="e.g., US, CA, MX" />
            <p className="text-xs text-slate-500">Comma-separated country codes</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input placeholder="e.g., USD" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Region added successfully');
            onOpenChange(false);
          }}>
            Add Region
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
          <DialogTitle>Add Locale Assignment Rule</DialogTitle>
          <DialogDescription>
            Create a new automatic locale assignment rule
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rule Name *</Label>
            <Input placeholder="e.g., Spain → Spanish" />
          </div>

          <div className="space-y-2">
            <Label>Condition *</Label>
            <Input placeholder="e.g., IP Country = ES" />
          </div>

          <div className="space-y-2">
            <Label>Result *</Label>
            <Input placeholder="e.g., Language: es" />
          </div>

          <div className="space-y-2">
            <Label>Priority *</Label>
            <Input type="number" placeholder="1" />
            <p className="text-xs text-slate-500">Lower numbers = higher priority</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Locale rule created successfully');
            onOpenChange(false);
          }}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
