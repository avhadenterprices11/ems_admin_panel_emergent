import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Shield,
  Download,
  Lock,
  Loader2,
  RotateCcw,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { toast } from 'sonner';
import { 
  privacySettingsAPI, 
  PrivacySettings, 
  UpdatePrivacySettingsInput 
} from '../../../api/events.api';

interface SettingsDataPrivacyProps {
  eventId: number;
}

export const SettingsDataPrivacy: React.FC<SettingsDataPrivacyProps> = ({ eventId }) => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Settings state
  const [gdprEnabled, setGdprEnabled] = useState(false);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [customConsentText, setCustomConsentText] = useState('');
  const [dataRetention, setDataRetention] = useState<'90' | '180' | '365' | 'forever'>('365');
  const [cookieConsentEnabled, setCookieConsentEnabled] = useState(false);
  const [isGlobalDefault, setIsGlobalDefault] = useState(true);

  // Fetch settings on load
  useEffect(() => {
    fetchSettings();
  }, [eventId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await privacySettingsAPI.getEventSettings(eventId);
      
      setGdprEnabled(data.gdpr_consent_enabled);
      setPrivacyPolicyUrl(data.privacy_policy_url || '');
      setCustomConsentText(data.custom_consent_text || '');
      setDataRetention(data.data_retention_days);
      setCookieConsentEnabled(data.cookie_consent_enabled);
      setIsGlobalDefault(data.is_global_default || false);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const input: UpdatePrivacySettingsInput = {
        gdpr_consent_enabled: gdprEnabled,
        privacy_policy_url: privacyPolicyUrl || null,
        custom_consent_text: customConsentText || null,
        data_retention_days: dataRetention,
        cookie_consent_enabled: cookieConsentEnabled
      };

      const result = await privacySettingsAPI.updateEventSettings(eventId, input);
      setIsGlobalDefault(false);
      toast.success(result.message || 'Privacy settings saved successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToGlobal = async () => {
    try {
      setResetting(true);
      const result = await privacySettingsAPI.resetToGlobal(eventId);
      
      // Update state with global defaults
      if (result.settings) {
        setGdprEnabled(result.settings.gdpr_consent_enabled);
        setPrivacyPolicyUrl(result.settings.privacy_policy_url || '');
        setCustomConsentText(result.settings.custom_consent_text || '');
        setDataRetention(result.settings.data_retention_days);
        setCookieConsentEnabled(result.settings.cookie_consent_enabled);
        setIsGlobalDefault(true);
      }
      
      toast.success(result.message || 'Settings reset to global defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    } finally {
      setResetting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await privacySettingsAPI.exportEventData(eventId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event_${eventId}_data_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Event data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export event data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading privacy settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6" data-testid="settings-data-privacy">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg text-[#1d293d]">Data & Privacy</h3>
          {isGlobalDefault && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <Info size={12} className="mr-1" />
              Using Global Defaults
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {!isGlobalDefault && (
            <Button 
              variant="outline" 
              onClick={handleResetToGlobal}
              disabled={resetting}
              data-testid="reset-to-global-btn"
            >
              {resetting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RotateCcw size={16} className="mr-2" />}
              Reset to Global
            </Button>
          )}
          <Button 
            className="bg-[#0f172b]" 
            onClick={handleSave}
            disabled={saving}
            data-testid="save-privacy-btn"
          >
            {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
      <Separator />
      
      <div className="space-y-8">
        {/* GDPR & Compliance Section */}
        <div className="space-y-4">
          <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
            <Shield size={18} className="text-slate-400" /> Compliance
          </h4>
          
          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">GDPR Consent Field</Label>
              <p className="text-sm text-slate-500">Require attendees to agree to data processing during registration.</p>
            </div>
            <Switch 
              checked={gdprEnabled} 
              onCheckedChange={setGdprEnabled}
              data-testid="gdpr-consent-switch"
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Cookie Consent Banner</Label>
              <p className="text-sm text-slate-500">Show cookie consent banner on event pages.</p>
            </div>
            <Switch 
              checked={cookieConsentEnabled} 
              onCheckedChange={setCookieConsentEnabled}
              data-testid="cookie-consent-switch"
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Privacy Policy URL</Label>
            <Input 
              placeholder="https://example.com/privacy" 
              value={privacyPolicyUrl}
              onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
              data-testid="privacy-policy-url-input"
            />
            <p className="text-xs text-slate-500">Link to your organization's privacy policy page.</p>
          </div>

          {gdprEnabled && (
            <div className="grid gap-2">
              <Label>Custom Consent Text (Optional)</Label>
              <Textarea 
                placeholder="I consent to the processing of my personal data as described in the privacy policy..."
                value={customConsentText}
                onChange={(e) => setCustomConsentText(e.target.value)}
                rows={3}
                className="resize-none"
                data-testid="custom-consent-text-input"
              />
              <p className="text-xs text-slate-500">Custom text shown next to the consent checkbox. Leave blank for default text.</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Data Retention Section */}
        <div className="space-y-4">
          <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
            <Lock size={18} className="text-slate-400" /> Data Retention
          </h4>
          <div className="grid gap-2 max-w-md">
            <Label>Automatic Deletion</Label>
            <Select 
              value={dataRetention} 
              onValueChange={(val) => setDataRetention(val as '90' | '180' | '365' | 'forever')}
            >
              <SelectTrigger data-testid="data-retention-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 Days after event</SelectItem>
                <SelectItem value="180">6 Months after event</SelectItem>
                <SelectItem value="365">1 Year after event</SelectItem>
                <SelectItem value="forever">Never (Manual deletion only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Personally Identifiable Information (PII) will be scrubbed after this period.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Important:</strong> Data retention applies to attendee information including names, emails, and registration details. 
              Aggregate statistics and anonymized data will be preserved.
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Export Section */}
        <div className="space-y-4">
          <h4 className="font-bold text-[#1d293d] flex items-center gap-2">
            <Download size={18} className="text-slate-400" /> Data Export
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="font-medium text-[#1d293d]">Full Event Data (CSV)</div>
              <p className="text-xs text-slate-500">
                Includes all registrations, attendees, bookings, and issued tickets. 
                Use this for GDPR data subject access requests or migration purposes.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleExportCSV}
                disabled={exporting}
                data-testid="export-csv-btn"
              >
                {exporting ? (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                ) : (
                  <Download size={14} className="mr-2" />
                )}
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
