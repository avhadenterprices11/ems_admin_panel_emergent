import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
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
  integrationsAPI, 
  IntegrationsResponse,
  EmailProvider,
  SmsProvider
} from '../../../api/events.api';

interface SettingsIntegrationsProps {
  eventId: number;
}

export const SettingsIntegrations: React.FC<SettingsIntegrationsProps> = ({ eventId }) => {
  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSms, setTestingSms] = useState(false);
  const [testingMaps, setTestingMaps] = useState(false);

  // Password visibility
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [showMapsKey, setShowMapsKey] = useState(false);

  // Config IDs for testing
  const [emailConfigId, setEmailConfigId] = useState<number | null>(null);
  const [smsConfigId, setSmsConfigId] = useState<number | null>(null);
  const [mapsConfigId, setMapsConfigId] = useState<number | null>(null);

  // Email Integration State
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailProvider, setEmailProvider] = useState<EmailProvider>('sendgrid');
  const [emailStatus, setEmailStatus] = useState<'not_configured' | 'connected' | 'error'>('not_configured');
  // SendGrid
  const [sendgridApiKey, setSendgridApiKey] = useState('');
  const [sendgridFromEmail, setSendgridFromEmail] = useState('');
  const [sendgridFromName, setSendgridFromName] = useState('');
  // SMTP
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState<'none' | 'tls' | 'ssl'>('tls');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');

  // SMS Integration State
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsProvider, setSmsProvider] = useState<SmsProvider>('twilio');
  const [smsStatus, setSmsStatus] = useState<'not_configured' | 'connected' | 'error'>('not_configured');
  // Twilio
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');
  // MessageBird
  const [messagebirdApiKey, setMessagebirdApiKey] = useState('');
  const [messagebirdOriginator, setMessagebirdOriginator] = useState('');

  // Maps Integration State
  const [mapsEnabled, setMapsEnabled] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [mapsStatus, setMapsStatus] = useState<'not_configured' | 'connected' | 'error'>('not_configured');

  // Fetch integrations
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationsAPI.getEventIntegrations(eventId);
      
      // Populate Email state
      if (data.email) {
        setEmailConfigId(data.email.id);
        setEmailEnabled(data.email.is_enabled);
        setEmailProvider(data.email.provider as EmailProvider);
        setEmailStatus(data.email.status);
        
        if (data.email.provider === 'sendgrid') {
          setSendgridApiKey(data.email.config.api_key || '');
          setSendgridFromEmail(data.email.config.from_email || '');
          setSendgridFromName(data.email.config.from_name || '');
        } else {
          setSmtpHost(data.email.config.host || '');
          setSmtpPort(data.email.config.port?.toString() || '587');
          setSmtpUsername(data.email.config.username || '');
          setSmtpPassword(data.email.config.password || '');
          setSmtpEncryption(data.email.config.encryption || 'tls');
          setSmtpFromEmail(data.email.config.from_email || '');
          setSmtpFromName(data.email.config.from_name || '');
        }
      }

      // Populate SMS state
      if (data.sms) {
        setSmsConfigId(data.sms.id);
        setSmsEnabled(data.sms.is_enabled);
        setSmsProvider(data.sms.provider as SmsProvider);
        setSmsStatus(data.sms.status);
        
        if (data.sms.provider === 'twilio') {
          setTwilioAccountSid(data.sms.config.account_sid || '');
          setTwilioAuthToken(data.sms.config.auth_token || '');
          setTwilioFromNumber(data.sms.config.from_number || '');
        } else {
          setMessagebirdApiKey(data.sms.config.api_key || '');
          setMessagebirdOriginator(data.sms.config.originator || '');
        }
      }

      // Populate Maps state
      if (data.maps) {
        setMapsConfigId(data.maps.id);
        setMapsEnabled(data.maps.is_enabled);
        setMapsApiKey(data.maps.config.api_key || '');
        setMapsStatus(data.maps.status);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [eventId]);

  // Save all integrations
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload: any = {};

      // Build email config
      if (emailProvider === 'sendgrid') {
        payload.email = {
          provider: 'sendgrid',
          is_enabled: emailEnabled,
          config: {
            api_key: sendgridApiKey,
            from_email: sendgridFromEmail,
            from_name: sendgridFromName
          }
        };
      } else {
        payload.email = {
          provider: 'smtp',
          is_enabled: emailEnabled,
          config: {
            host: smtpHost,
            port: parseInt(smtpPort) || 587,
            username: smtpUsername,
            password: smtpPassword,
            encryption: smtpEncryption,
            from_email: smtpFromEmail,
            from_name: smtpFromName
          }
        };
      }

      // Build SMS config
      if (smsProvider === 'twilio') {
        payload.sms = {
          provider: 'twilio',
          is_enabled: smsEnabled,
          config: {
            account_sid: twilioAccountSid,
            auth_token: twilioAuthToken,
            from_number: twilioFromNumber
          }
        };
      } else {
        payload.sms = {
          provider: 'messagebird',
          is_enabled: smsEnabled,
          config: {
            api_key: messagebirdApiKey,
            originator: messagebirdOriginator
          }
        };
      }

      // Build Maps config
      payload.maps = {
        provider: 'google_maps',
        is_enabled: mapsEnabled,
        config: {
          api_key: mapsApiKey
        }
      };

      await integrationsAPI.saveEventIntegrations(eventId, payload);
      toast.success('Integrations saved successfully');
      await fetchIntegrations(); // Refresh to get updated status
    } catch (error) {
      console.error('Error saving integrations:', error);
      toast.error('Failed to save integrations');
    } finally {
      setSaving(false);
    }
  };

  // Test connection handlers
  const handleTestEmail = async () => {
    if (!emailConfigId) {
      toast.error('Please save the configuration first');
      return;
    }
    try {
      setTestingEmail(true);
      const result = await integrationsAPI.testConnection(eventId, emailConfigId);
      if (result.success) {
        toast.success(result.message);
        setEmailStatus('connected');
      } else {
        toast.error(result.message);
        setEmailStatus('error');
      }
    } catch (error) {
      toast.error('Connection test failed');
      setEmailStatus('error');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestSms = async () => {
    if (!smsConfigId) {
      toast.error('Please save the configuration first');
      return;
    }
    try {
      setTestingSms(true);
      const result = await integrationsAPI.testConnection(eventId, smsConfigId);
      if (result.success) {
        toast.success(result.message);
        setSmsStatus('connected');
      } else {
        toast.error(result.message);
        setSmsStatus('error');
      }
    } catch (error) {
      toast.error('Connection test failed');
      setSmsStatus('error');
    } finally {
      setTestingSms(false);
    }
  };

  const handleTestMaps = async () => {
    if (!mapsConfigId) {
      toast.error('Please save the configuration first');
      return;
    }
    try {
      setTestingMaps(true);
      const result = await integrationsAPI.testConnection(eventId, mapsConfigId);
      if (result.success) {
        toast.success(result.message);
        setMapsStatus('connected');
      } else {
        toast.error(result.message);
        setMapsStatus('error');
      }
    } catch (error) {
      toast.error('Connection test failed');
      setMapsStatus('error');
    } finally {
      setTestingMaps(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: 'not_configured' | 'connected' | 'error' }) => {
    if (status === 'connected') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle2 size={12} className="mr-1" /> Connected
        </Badge>
      );
    }
    if (status === 'error') {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle size={12} className="mr-1" /> Error
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <AlertCircle size={12} className="mr-1" /> Not Configured
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-[#1d293d]">Integrations</h3>
            <p className="text-sm text-slate-500 mt-1">
              Connect third-party services for email, SMS, and maps functionality.
            </p>
          </div>
          <Button 
            className="bg-[#0f172b]" 
            onClick={handleSave}
            disabled={saving}
            data-testid="save-integrations-btn"
          >
            {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Email Integration */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1d293d]">Email Service</h4>
              <p className="text-sm text-slate-500">Send transactional emails and notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={emailStatus} />
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
              data-testid="email-enabled-switch"
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <Label>Email Provider</Label>
            <Select value={emailProvider} onValueChange={(v) => setEmailProvider(v as EmailProvider)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="smtp">Custom SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {emailProvider === 'sendgrid' ? (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="SG.xxxxxxxxxxxxxxxx"
                    value={sendgridApiKey}
                    onChange={(e) => setSendgridApiKey(e.target.value)}
                    data-testid="sendgrid-api-key"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    placeholder="noreply@example.com"
                    value={sendgridFromEmail}
                    onChange={(e) => setSendgridFromEmail(e.target.value)}
                    className="mt-1"
                    data-testid="sendgrid-from-email"
                  />
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    placeholder="My Event"
                    value={sendgridFromName}
                    onChange={(e) => setSendgridFromName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.example.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="mt-1"
                    data-testid="smtp-host"
                  />
                </div>
                <div>
                  <Label>Port</Label>
                  <Input
                    type="number"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    placeholder="username"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSmtpPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    >
                      {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label>Encryption</Label>
                <Select value={smtpEncryption} onValueChange={(v) => setSmtpEncryption(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    placeholder="noreply@example.com"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    placeholder="My Event"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestEmail}
            disabled={testingEmail || !emailConfigId}
            data-testid="test-email-btn"
          >
            {testingEmail ? <Loader2 size={14} className="mr-2 animate-spin" /> : <TestTube size={14} className="mr-2" />}
            Test Connection
          </Button>
        </div>
      </div>

      {/* SMS Integration */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1d293d]">SMS Gateway</h4>
              <p className="text-sm text-slate-500">Send SMS notifications and alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={smsStatus} />
            <Switch
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
              data-testid="sms-enabled-switch"
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <Label>SMS Provider</Label>
            <Select value={smsProvider} onValueChange={(v) => setSmsProvider(v as SmsProvider)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="messagebird">MessageBird</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {smsProvider === 'twilio' ? (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label>Account SID</Label>
                <Input
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                  className="mt-1"
                  data-testid="twilio-account-sid"
                />
              </div>
              <div>
                <Label>Auth Token</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showTwilioToken ? 'text' : 'password'}
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={twilioAuthToken}
                    onChange={(e) => setTwilioAuthToken(e.target.value)}
                    data-testid="twilio-auth-token"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                  >
                    {showTwilioToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
              <div>
                <Label>From Number</Label>
                <Input
                  placeholder="+1234567890"
                  value={twilioFromNumber}
                  onChange={(e) => setTwilioFromNumber(e.target.value)}
                  className="mt-1"
                  data-testid="twilio-from-number"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={messagebirdApiKey}
                  onChange={(e) => setMessagebirdApiKey(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Originator (Sender ID)</Label>
                <Input
                  placeholder="MyEvent"
                  value={messagebirdOriginator}
                  onChange={(e) => setMessagebirdOriginator(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestSms}
            disabled={testingSms || !smsConfigId}
            data-testid="test-sms-btn"
          >
            {testingSms ? <Loader2 size={14} className="mr-2 animate-spin" /> : <TestTube size={14} className="mr-2" />}
            Test Connection
          </Button>
        </div>
      </div>

      {/* Google Maps Integration */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-[#1d293d]">Google Maps</h4>
              <p className="text-sm text-slate-500">Display event location and venue maps</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={mapsStatus} />
            <Switch
              checked={mapsEnabled}
              onCheckedChange={setMapsEnabled}
              data-testid="maps-enabled-switch"
            />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <Label>Google Maps API Key</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type={showMapsKey ? 'text' : 'password'}
                placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={mapsApiKey}
                onChange={(e) => setMapsApiKey(e.target.value)}
                data-testid="maps-api-key"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowMapsKey(!showMapsKey)}
              >
                {showMapsKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Get your API key from the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestMaps}
            disabled={testingMaps || !mapsConfigId}
            data-testid="test-maps-btn"
          >
            {testingMaps ? <Loader2 size={14} className="mr-2 animate-spin" /> : <TestTube size={14} className="mr-2" />}
            Test Connection
          </Button>
        </div>
      </div>

      {/* Webhooks Section - HIDDEN/COMMENTED OUT */}
      {/* 
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm opacity-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Webhook className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1d293d]">Webhooks</h4>
            <p className="text-sm text-slate-500">Coming soon - Configure webhook endpoints</p>
          </div>
        </div>
      </div>
      */}

      {/* Developer API Section - HIDDEN/COMMENTED OUT */}
      {/*
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm opacity-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Code className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-[#1d293d]">Developer API</h4>
            <p className="text-sm text-slate-500">Coming soon - API keys and access tokens</p>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};
