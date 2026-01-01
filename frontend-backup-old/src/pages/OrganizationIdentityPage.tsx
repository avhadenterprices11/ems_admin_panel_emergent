import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building, Palette, Globe, Eye, Shield, CheckCircle2, Settings, Database,
  Activity, Save, RefreshCw, Info, AlertTriangle, Lock, Unlock, Upload,
  ExternalLink, FileText, Check, X, ChevronDown, ChevronRight, Mail, Calendar,
  DollarSign, MapPin, Award, AlertCircle, ShieldCheck, ShieldAlert, Copy, Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { cn } from '../components/ui/utils';

export const OrganizationIdentityPage = () => {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedAddress, setExpandedAddress] = useState(false);
  
  const [settings, setSettings] = useState({
    // Organization Profile
    legalName: 'National Indian Students & Alumni Union UK',
    displayName: 'NISAU',
    shortCode: 'NISAU',
    orgType: 'non-profit',
    yearEstablished: '2018',
    primaryCountry: 'GB',
    headquartersCity: 'London',
    registeredAddress: {
      line1: '123 Westminster Road',
      line2: 'Suite 400',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom'
    },
    legalNameLocked: true,
    
    // Brand & Visual Identity
    primaryColor: '#1d4ed8',
    secondaryColor: '#0ea5e9',
    accentColor: '#f59e0b',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    applyBrandingWebsite: true,
    applyBrandingEvents: true,
    applyBrandingCertificates: true,
    applyBrandingEmails: true,
    applyBrandingPDFs: true,
    
    // Domains & Email Trust
    primaryDomain: 'nisau.org',
    emailSendingDomain: 'mail.nisau.org',
    allowOnlyVerifiedDomains: true,
    defaultFallbackSender: 'noreply@nisau.org',
    
    // Public Identity
    showOnPublicDirectory: true,
    showOnEventPages: true,
    showOnAwardPages: true,
    allowLogoOnPartnerSites: false,
    publicDescription: 'Supporting Indian students and alumni across the United Kingdom through events, awards, and community programs.',
    tagline: 'Empowering the Indian diaspora in the UK',
    
    // Legal & Compliance
    legalEntityType: 'registered-charity',
    registrationNumber: 'CH123456',
    vatTaxId: 'GB123456789',
    countryOfRegistration: 'GB',
    requireLegalConsent: true,
    attachLegalEntityToInvoices: true,
    lockLegalEditing: true,
    
    // Verification
    verificationStatus: 'verified',
    verificationMethod: 'domain-trust',
    lastVerifiedDate: '2024-01-15',
    verifiedBy: 'System Admin',
    
    // Organization Defaults
    defaultTimezone: 'Europe/London',
    defaultCurrency: 'GBP',
    defaultLanguage: 'en',
    defaultSenderIdentity: 'NISAU Team',
    defaultBrandingProfile: 'primary',
    
    // Data Governance
    dataControllerName: 'NISAU Board of Directors',
    dataProcessorRole: 'Event & Program Management',
    dataRequestEmail: 'data@nisau.org',
    allowCrossProgramReuse: true,
    allowAlumniPersistence: true,
    autoArchiveInactive: true
  });

  const [domainVerification] = useState({
    primaryDomain: { status: 'verified', verifiedDate: '2024-01-15' },
    emailDomain: { status: 'verified', verifiedDate: '2024-01-15' },
    spf: { status: 'valid', lastChecked: '2024-12-20' },
    dkim: { status: 'valid', lastChecked: '2024-12-20' },
    dmarc: { status: 'valid', lastChecked: '2024-12-20' }
  });

  const [auditLogs] = useState({
    lastUpdatedBy: 'Sarah Johnson',
    lastUpdatedDate: '2024-12-15 14:30 GMT',
    changeCount: 47
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1000);
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  const getOverallStatus = () => {
    if (settings.verificationStatus === 'verified' && domainVerification.spf.status === 'valid') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 size={12} className="mr-1" />
          Fully Configured
        </Badge>
      );
    }
    if (settings.verificationStatus === 'pending') {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <AlertCircle size={12} className="mr-1" />
          Partial
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <AlertTriangle size={12} className="mr-1" />
        Requires Attention
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Organization & Identity</span>
          </div>

          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Organization & Identity
              </h1>
              <p className="text-sm text-slate-500">
                Manage core organization profile, branding, domains, and trust configuration
              </p>
            </div>

            <div className="flex items-center gap-3">
              {getOverallStatus()}
              {hasChanges && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Reset
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* Section 1: Organization Profile */}
        <SectionCard
          icon={Building}
          title="Organization Profile"
          description="Core identity information used across all events, programs, and communications"
          status="configured"
        >
          <div className="space-y-5">
            {/* Legal Name (Locked) */}
            <FormField
              label="Organization Legal Name"
              required
              helper="Used for compliance, contracts, and invoicing"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={settings.legalName}
                  onChange={(e) => handleSettingChange('legalName', e.target.value)}
                  disabled={settings.legalNameLocked}
                  className={settings.legalNameLocked ? 'bg-slate-50' : ''}
                />
                {settings.legalNameLocked && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Lock size={16} className="text-purple-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Locked after verification. Contact support to change.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </FormField>

            {/* Display Name */}
            <FormField
              label="Public Display Name"
              helper="Used on website, certificates, and emails"
            >
              <Input
                value={settings.displayName}
                onChange={(e) => handleSettingChange('displayName', e.target.value)}
              />
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                <Info size={12} className="inline mr-1" />
                Appears in: Event pages, certificates, email headers
              </div>
            </FormField>

            {/* Short Code (Immutable) */}
            <FormField
              label="Organization Short Code / Slug"
              helper="Used internally (immutable after first save)"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={settings.shortCode}
                  disabled
                  className="bg-slate-50 font-mono"
                />
                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                  <Lock size={10} className="mr-1" />
                  Immutable
                </Badge>
              </div>
            </FormField>

            {/* Org Type + Year Established */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Organization Type" required>
                <Select value={settings.orgType} onValueChange={(val) => handleSettingChange('orgType', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational Institution</SelectItem>
                    <SelectItem value="non-profit">Non-Profit</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Year Established">
                <Input
                  type="number"
                  value={settings.yearEstablished}
                  onChange={(e) => handleSettingChange('yearEstablished', e.target.value)}
                  placeholder="2018"
                />
              </FormField>
            </div>

            {/* Primary Country + HQ City */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Primary Country" required>
                <Select value={settings.primaryCountry} onValueChange={(val) => handleSettingChange('primaryCountry', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Headquarters City">
                <Input
                  value={settings.headquartersCity}
                  onChange={(e) => handleSettingChange('headquartersCity', e.target.value)}
                  placeholder="London"
                />
              </FormField>
            </div>

            {/* Expandable Registered Address */}
            <div className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setExpandedAddress(!expandedAddress)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-600" />
                  <span className="font-medium text-slate-900 text-sm">Registered Address</span>
                </div>
                {expandedAddress ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedAddress && (
                <div className="px-4 pb-4 space-y-3">
                  <Input
                    placeholder="Address Line 1"
                    value={settings.registeredAddress.line1}
                    onChange={(e) => handleSettingChange('registeredAddress', { ...settings.registeredAddress, line1: e.target.value })}
                  />
                  <Input
                    placeholder="Address Line 2 (optional)"
                    value={settings.registeredAddress.line2}
                    onChange={(e) => handleSettingChange('registeredAddress', { ...settings.registeredAddress, line2: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="City"
                      value={settings.registeredAddress.city}
                      onChange={(e) => handleSettingChange('registeredAddress', { ...settings.registeredAddress, city: e.target.value })}
                    />
                    <Input
                      placeholder="Postcode"
                      value={settings.registeredAddress.postcode}
                      onChange={(e) => handleSettingChange('registeredAddress', { ...settings.registeredAddress, postcode: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Section 2: Brand & Visual Identity */}
        <SectionCard
          icon={Palette}
          title="Brand & Visual Identity"
          description="Logo, colors, fonts, and branding application controls"
          status="configured"
        >
          <div className="space-y-6">
            {/* Visual Identity */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Visual Identity</h3>
              <div className="grid grid-cols-3 gap-4">
                <LogoUploadCard label="Primary Logo" sublabel="Light backgrounds" />
                <LogoUploadCard label="Secondary Logo" sublabel="Dark backgrounds" />
                <LogoUploadCard label="Favicon" sublabel="Browser tab icon" />
              </div>
            </div>

            <Separator />

            {/* Brand Colors */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Brand Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                <ColorPickerField
                  label="Primary"
                  value={settings.primaryColor}
                  onChange={(val) => handleSettingChange('primaryColor', val)}
                />
                <ColorPickerField
                  label="Secondary"
                  value={settings.secondaryColor}
                  onChange={(val) => handleSettingChange('secondaryColor', val)}
                />
                <ColorPickerField
                  label="Accent"
                  value={settings.accentColor}
                  onChange={(val) => handleSettingChange('accentColor', val)}
                />
              </div>
            </div>

            <Separator />

            {/* Font Stack */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Font Stack</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Heading Font">
                  <Select value={settings.fontHeading} onValueChange={(val) => handleSettingChange('fontHeading', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Body Font">
                  <Select value={settings.fontBody} onValueChange={(val) => handleSettingChange('fontBody', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <Separator />

            {/* Usage Controls */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Apply Branding To</h3>
              <div className="space-y-2">
                <SwitchField
                  label="Public Website"
                  checked={settings.applyBrandingWebsite}
                  onCheckedChange={(val) => handleSettingChange('applyBrandingWebsite', val)}
                />
                <SwitchField
                  label="Event Pages"
                  checked={settings.applyBrandingEvents}
                  onCheckedChange={(val) => handleSettingChange('applyBrandingEvents', val)}
                />
                <SwitchField
                  label="Certificates"
                  checked={settings.applyBrandingCertificates}
                  onCheckedChange={(val) => handleSettingChange('applyBrandingCertificates', val)}
                />
                <SwitchField
                  label="Email Templates"
                  checked={settings.applyBrandingEmails}
                  onCheckedChange={(val) => handleSettingChange('applyBrandingEmails', val)}
                />
                <SwitchField
                  label="PDF Exports"
                  checked={settings.applyBrandingPDFs}
                  onCheckedChange={(val) => handleSettingChange('applyBrandingPDFs', val)}
                />
              </div>
            </div>

            <Separator />

            {/* Preview Panel */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Live Preview</h3>
              <div className="grid grid-cols-3 gap-3">
                <PreviewCard type="Email Header" color={settings.primaryColor} />
                <PreviewCard type="Certificate" color={settings.primaryColor} />
                <PreviewCard type="Event Page" color={settings.primaryColor} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 3: Domains & Sender Trust */}
        <SectionCard
          icon={Mail}
          title="Domains & Sender Trust"
          description="Email domain verification and DNS configuration"
          status="configured"
        >
          <div className="space-y-5">
            {/* Primary Domain */}
            <FormField label="Primary Website Domain" required>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-400" />
                <Input
                  value={settings.primaryDomain}
                  onChange={(e) => handleSettingChange('primaryDomain', e.target.value)}
                  placeholder="nisau.org"
                />
                {domainVerification.primaryDomain.status === 'verified' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <CheckCircle2 size={10} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </FormField>

            {/* Email Domain */}
            <FormField label="Email Sending Domain" required>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <Input
                  value={settings.emailSendingDomain}
                  onChange={(e) => handleSettingChange('emailSendingDomain', e.target.value)}
                  placeholder="mail.nisau.org"
                />
                {domainVerification.emailDomain.status === 'verified' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <CheckCircle2 size={10} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </FormField>

            <Separator />

            {/* DNS Verification Checklist */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">DNS Verification Status</h3>
              <div className="space-y-2">
                <DNSRecordRow
                  type="SPF"
                  status={domainVerification.spf.status}
                  lastChecked={domainVerification.spf.lastChecked}
                />
                <DNSRecordRow
                  type="DKIM"
                  status={domainVerification.dkim.status}
                  lastChecked={domainVerification.dkim.lastChecked}
                />
                <DNSRecordRow
                  type="DMARC"
                  status={domainVerification.dmarc.status}
                  lastChecked={domainVerification.dmarc.lastChecked}
                />
              </div>
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                <ExternalLink size={14} />
                View DNS Setup Guide
              </Button>
            </div>

            <Separator />

            {/* Sender Trust Rules */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Sender Trust Rules</h3>
              <SwitchField
                label="Allow Sending Only from Verified Domains"
                description="Block emails from unverified domains (recommended for security)"
                checked={settings.allowOnlyVerifiedDomains}
                onCheckedChange={(val) => handleSettingChange('allowOnlyVerifiedDomains', val)}
                badge={
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Recommended
                  </Badge>
                }
              />
              <div className="mt-4">
                <FormField label="Default Fallback Sender">
                  <Input
                    type="email"
                    value={settings.defaultFallbackSender}
                    onChange={(e) => handleSettingChange('defaultFallbackSender', e.target.value)}
                    placeholder="noreply@nisau.org"
                  />
                </FormField>
              </div>
            </div>

            {/* Warning Banner */}
            {!settings.allowOnlyVerifiedDomains && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-900">
                    Unverified domains may cause email deliverability issues and reduce trust scores.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Section 4: Public Identity Controls */}
        <SectionCard
          icon={Eye}
          title="Public Identity Controls"
          description="Control visibility and public-facing information"
          status="configured"
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Visibility Toggles</h3>
              <div className="space-y-2">
                <SwitchField
                  label="Show on Public Directory"
                  description="Make organization visible in public search directory"
                  checked={settings.showOnPublicDirectory}
                  onCheckedChange={(val) => handleSettingChange('showOnPublicDirectory', val)}
                />
                <SwitchField
                  label="Show on Event Pages"
                  description="Display organization branding on public event pages"
                  checked={settings.showOnEventPages}
                  onCheckedChange={(val) => handleSettingChange('showOnEventPages', val)}
                />
                <SwitchField
                  label="Show on Award Pages"
                  description="Display organization logo on award certificates"
                  checked={settings.showOnAwardPages}
                  onCheckedChange={(val) => handleSettingChange('showOnAwardPages', val)}
                />
                <SwitchField
                  label="Allow Logo on Partner Sites"
                  description="Allow external partners to display your logo"
                  checked={settings.allowLogoOnPartnerSites}
                  onCheckedChange={(val) => handleSettingChange('allowLogoOnPartnerSites', val)}
                />
              </div>
            </div>

            <Separator />

            <FormField label="Public Description">
              <Textarea
                value={settings.publicDescription}
                onChange={(e) => handleSettingChange('publicDescription', e.target.value)}
                placeholder="Enter a public description of your organization"
                rows={4}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-slate-500">Shown on public profiles and directories</p>
                <p className="text-xs text-slate-500">{settings.publicDescription.length}/500</p>
              </div>
            </FormField>

            <FormField label="Tagline">
              <Input
                value={settings.tagline}
                onChange={(e) => handleSettingChange('tagline', e.target.value)}
                placeholder="A short, memorable tagline"
              />
            </FormField>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Public Appearance Preview</h3>
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {settings.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{settings.displayName}</h4>
                    <p className="text-sm text-slate-600 mb-2">{settings.tagline}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{settings.publicDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 5: Legal & Compliance Identity */}
        <SectionCard
          icon={FileText}
          title="Legal & Compliance Identity"
          description="Legal entity details and compliance controls"
          status="configured"
          badge={
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              Compliance
            </Badge>
          }
        >
          <div className="space-y-5">
            <FormField label="Legal Entity Type" required>
              <Select value={settings.legalEntityType} onValueChange={(val) => handleSettingChange('legalEntityType', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered-charity">Registered Charity</SelectItem>
                  <SelectItem value="non-profit">Non-Profit Corporation</SelectItem>
                  <SelectItem value="limited-company">Limited Company</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="sole-trader">Sole Trader</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Registration Number">
                <Input
                  value={settings.registrationNumber}
                  onChange={(e) => handleSettingChange('registrationNumber', e.target.value)}
                  placeholder="CH123456"
                />
              </FormField>

              <FormField label="VAT / Tax ID">
                <Input
                  value={settings.vatTaxId}
                  onChange={(e) => handleSettingChange('vatTaxId', e.target.value)}
                  placeholder="GB123456789"
                />
              </FormField>
            </div>

            <FormField label="Country of Registration" required>
              <Select value={settings.countryOfRegistration} onValueChange={(val) => handleSettingChange('countryOfRegistration', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Compliance Toggles</h3>
              <div className="space-y-2">
                <SwitchField
                  label="Require Legal Consent"
                  description="Require users to accept terms and conditions"
                  checked={settings.requireLegalConsent}
                  onCheckedChange={(val) => handleSettingChange('requireLegalConsent', val)}
                />
                <SwitchField
                  label="Attach Legal Entity to Invoices"
                  description="Include legal entity details on all invoices"
                  checked={settings.attachLegalEntityToInvoices}
                  onCheckedChange={(val) => handleSettingChange('attachLegalEntityToInvoices', val)}
                />
                <SwitchField
                  label="Lock Legal Information Editing"
                  description="Prevent unauthorized changes to legal details"
                  checked={settings.lockLegalEditing}
                  onCheckedChange={(val) => handleSettingChange('lockLegalEditing', val)}
                />
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-900">
                  Compliance health: All required legal fields configured
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 6: Verification & Trust */}
        <SectionCard
          icon={ShieldCheck}
          title="Verification & Trust"
          description="Organization verification status and trust indicators"
          status="configured"
          badge={
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
              Read-Only
            </Badge>
          }
        >
          <div className="space-y-5">
            <FormField label="Verification Status">
              <div className="flex items-center gap-2">
                <Input
                  value={settings.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  disabled
                  className="bg-slate-50"
                />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <CheckCircle2 size={10} className="mr-1" />
                  Verified
                </Badge>
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Verification Method">
                <Input
                  value="Domain Trust"
                  disabled
                  className="bg-slate-50"
                />
              </FormField>

              <FormField label="Last Verified Date">
                <Input
                  value={settings.lastVerifiedDate}
                  disabled
                  className="bg-slate-50"
                />
              </FormField>
            </div>

            <FormField label="Verified By">
              <Input
                value={settings.verifiedBy}
                disabled
                className="bg-slate-50"
              />
            </FormField>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Verification Methods</p>
                  <p className="text-xs">Domain verification, legal documentation, or manual review by platform administrators</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload size={14} />
                Upload Documents
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink size={14} />
                View Audit Trail
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Section 7: Organization Defaults */}
        <SectionCard
          icon={Settings}
          title="Organization Defaults"
          description="Default settings applied to new events and programs"
          status="configured"
        >
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-900">
                  These defaults affect all future programs, events, and communications unless overridden
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Default Timezone" required>
                <Select value={settings.defaultTimezone} onValueChange={(val) => handleSettingChange('defaultTimezone', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Default Currency" required>
                <Select value={settings.defaultCurrency} onValueChange={(val) => handleSettingChange('defaultCurrency', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Default Language">
                <Select value={settings.defaultLanguage} onValueChange={(val) => handleSettingChange('defaultLanguage', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Default Sender Identity">
                <Input
                  value={settings.defaultSenderIdentity}
                  onChange={(e) => handleSettingChange('defaultSenderIdentity', e.target.value)}
                  placeholder="NISAU Team"
                />
              </FormField>
            </div>

            <FormField label="Default Branding Profile">
              <Select value={settings.defaultBrandingProfile} onValueChange={(val) => handleSettingChange('defaultBrandingProfile', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary (Default)</SelectItem>
                  <SelectItem value="events">Events Branding</SelectItem>
                  <SelectItem value="awards">Awards Branding</SelectItem>
                  <SelectItem value="minimal">Minimal Branding</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </SectionCard>

        {/* Section 8: Data Ownership & Governance */}
        <SectionCard
          icon={Database}
          title="Data Ownership & Governance"
          description="Data controller, processor roles, and governance policies"
          status="configured"
          badge={
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              GDPR
            </Badge>
          }
        >
          <div className="space-y-5">
            <FormField label="Data Controller Name" required>
              <Input
                value={settings.dataControllerName}
                onChange={(e) => handleSettingChange('dataControllerName', e.target.value)}
                placeholder="NISAU Board of Directors"
              />
            </FormField>

            <FormField label="Data Processor Role">
              <Input
                value={settings.dataProcessorRole}
                onChange={(e) => handleSettingChange('dataProcessorRole', e.target.value)}
                placeholder="Event & Program Management"
              />
            </FormField>

            <FormField label="Data Request Email" required>
              <Input
                type="email"
                value={settings.dataRequestEmail}
                onChange={(e) => handleSettingChange('dataRequestEmail', e.target.value)}
                placeholder="data@nisau.org"
              />
            </FormField>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Data Management Policies</h3>
              <div className="space-y-2">
                <SwitchField
                  label="Allow Cross-Program Data Reuse"
                  description="Share person data across different programs and events"
                  checked={settings.allowCrossProgramReuse}
                  onCheckedChange={(val) => handleSettingChange('allowCrossProgramReuse', val)}
                />
                <SwitchField
                  label="Allow Alumni Data Persistence"
                  description="Keep alumni records indefinitely for historical purposes"
                  checked={settings.allowAlumniPersistence}
                  onCheckedChange={(val) => handleSettingChange('allowAlumniPersistence', val)}
                />
                <SwitchField
                  label="Auto-Archive Inactive Records"
                  description="Automatically archive person records after 3 years of inactivity"
                  checked={settings.autoArchiveInactive}
                  onCheckedChange={(val) => handleSettingChange('autoArchiveInactive', val)}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 9: Audit Log Summary */}
        <SectionCard
          icon={Activity}
          title="Audit Log Summary"
          description="Recent changes and activity tracking"
          status="configured"
          badge={
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
              Read-Only
            </Badge>
          }
        >
          <div className="space-y-5">
            <FormField label="Last Updated By">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  SJ
                </div>
                <Input
                  value={auditLogs.lastUpdatedBy}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </FormField>

            <FormField label="Last Updated Date">
              <Input
                value={auditLogs.lastUpdatedDate}
                disabled
                className="bg-slate-50"
              />
            </FormField>

            <FormField label="Total Changes">
              <div className="flex items-center gap-2">
                <Input
                  value={auditLogs.changeCount}
                  disabled
                  className="bg-slate-50"
                />
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {auditLogs.changeCount} changes
                </Badge>
              </div>
            </FormField>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={14} />
                Export Audit Log
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink size={14} />
                View Full Trail
              </Button>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
};

// Reusable Components
const SectionCard = ({ icon: Icon, title, description, status, badge, children }: any) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'configured':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            <CheckCircle2 size={10} className="mr-1" />
            Configured
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
            <AlertCircle size={10} className="mr-1" />
            Partial
          </Badge>
        );
      case 'not-set':
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
            Not Set
          </Badge>
        );
      case 'requires-attention':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
            <AlertTriangle size={10} className="mr-1" />
            Requires Attention
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Icon className="text-slate-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                {getStatusBadge()}
                {badge}
              </div>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
};

const FormField = ({ label, required, helper, locked, children }: any) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {locked && (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
            <Lock size={8} className="mr-1" />
            Locked
          </Badge>
        )}
      </div>
      {children}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
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

const ColorPickerField = ({ label, value, onChange }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          placeholder="#1d4ed8"
        />
      </div>
    </div>
  );
};

const DNSRecordRow = ({ type, status, lastChecked }: any) => {
  const isValid = status === 'valid';
  return (
    <div className="flex items-center justify-between py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        {isValid ? (
          <CheckCircle2 size={16} className="text-green-600" />
        ) : (
          <X size={16} className="text-red-600" />
        )}
        <div>
          <span className="font-medium text-slate-900 text-sm">{type}</span>
          <p className="text-xs text-slate-500">Last checked: {lastChecked}</p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          isValid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        )}
      >
        {status}
      </Badge>
    </div>
  );
};

const LogoUploadCard = ({ label, sublabel }: any) => {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors cursor-pointer">
      <div className="w-full aspect-square bg-slate-50 rounded-lg flex flex-col items-center justify-center mb-2">
        <Upload size={24} className="text-slate-400 mb-2" />
        <span className="text-xs text-slate-500">Upload</span>
      </div>
      <h4 className="font-medium text-slate-900 text-sm">{label}</h4>
      <p className="text-xs text-slate-500">{sublabel}</p>
    </div>
  );
};

const PreviewCard = ({ type, color }: any) => {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
      <div className="w-full h-20 rounded mb-2" style={{ backgroundColor: color }}>
        <div className="p-2 text-white text-xs opacity-75">{type}</div>
      </div>
      <p className="text-xs text-slate-600 text-center">{type} Preview</p>
    </div>
  );
};
