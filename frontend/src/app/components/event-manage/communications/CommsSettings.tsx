import React, { useState, useEffect } from 'react';
import { Save, Mail, MessageSquare, Clock, ShieldCheck, BarChart2, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { eventsAPI, CommunicationSettings } from '../../../api/events.api';
import { toast } from 'sonner';

interface CommsSettingsProps {
  eventId: number;
}

export const CommsSettings = ({ eventId }: CommsSettingsProps) => {
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [defaultSenderName, setDefaultSenderName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [smsSenderId, setSmsSenderId] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('');
  const [quietHoursEnd, setQuietHoursEnd] = useState('');
  const [optOutEnabled, setOptOutEnabled] = useState(true);
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [unsubscribePageUrl, setUnsubscribePageUrl] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [eventId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getCommunicationSettings(eventId);
      setSettings(data);
      populateForm(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load communication settings');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: CommunicationSettings) => {
    setDefaultSenderName(data.default_sender_name || '');
    setReplyToEmail(data.reply_to_email || '');
    setSmsSenderId(data.sms_sender_id || '');
    setEmailEnabled(data.email_enabled);
    setSmsEnabled(data.sms_enabled);
    setQuietHoursStart(data.quiet_hours_start?.substring(0, 5) || '');
    setQuietHoursEnd(data.quiet_hours_end?.substring(0, 5) || '');
    setOptOutEnabled(data.opt_out_enabled);
    setTrackOpens(data.track_opens);
    setTrackClicks(data.track_clicks);
    setUnsubscribePageUrl(data.unsubscribe_page_url || '');
    setHasChanges(false);
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await eventsAPI.updateCommunicationSettings(eventId, {
        default_sender_name: defaultSenderName || undefined,
        reply_to_email: replyToEmail || undefined,
        sms_sender_id: smsSenderId || undefined,
        email_enabled: emailEnabled,
        sms_enabled: smsEnabled,
        quiet_hours_start: quietHoursStart || undefined,
        quiet_hours_end: quietHoursEnd || undefined,
        opt_out_enabled: optOutEnabled,
        track_opens: trackOpens,
        track_clicks: trackClicks,
        unsubscribe_page_url: unsubscribePageUrl || undefined,
      });
      setSettings(updated);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to default?')) return;
    
    try {
      setSaving(true);
      const updated = await eventsAPI.resetCommunicationSettings(eventId);
      setSettings(updated);
      populateForm(updated);
      toast.success('Settings reset to default');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#1d293d]">Communication Settings</h3>
          <p className="text-sm text-slate-500">Configure email and SMS delivery settings for this event.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RefreshCw size={16} className="mr-2" /> Reset to Default
          </Button>
          <Button 
            className="bg-[#0f172b]" 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            data-testid="save-settings-btn"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Sender Configuration */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Mail size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#1d293d]">Sender Configuration</h4>
            <p className="text-sm text-slate-500">Configure how your communications appear to recipients</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label>Default Sender Name</Label>
            <Input
              placeholder="e.g. Event Team"
              value={defaultSenderName}
              onChange={(e) => { setDefaultSenderName(e.target.value); handleChange(); }}
              data-testid="sender-name-input"
            />
            <p className="text-xs text-slate-500">Name shown to recipients</p>
          </div>

          <div className="grid gap-2">
            <Label>Reply-To Email</Label>
            <Input
              type="email"
              placeholder="hello@example.com"
              value={replyToEmail}
              onChange={(e) => { setReplyToEmail(e.target.value); handleChange(); }}
              data-testid="reply-to-input"
            />
            <p className="text-xs text-slate-500">Replies will be sent to this address</p>
          </div>

          <div className="grid gap-2">
            <Label>SMS Sender ID</Label>
            <Input
              placeholder="e.g. MYEVENT"
              maxLength={11}
              value={smsSenderId}
              onChange={(e) => { setSmsSenderId(e.target.value); handleChange(); }}
              data-testid="sms-sender-input"
            />
            <p className="text-xs text-slate-500">Max 11 characters, alphanumeric</p>
          </div>
        </div>
      </div>

      {/* Channel Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <MessageSquare size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#1d293d]">Channel Controls</h4>
            <p className="text-sm text-slate-500">Enable or disable communication channels</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-blue-600" />
              <div>
                <Label className="font-medium">Email Channel</Label>
                <p className="text-sm text-slate-500">Enable email communications</p>
              </div>
            </div>
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={(v) => { setEmailEnabled(v); handleChange(); }}
              data-testid="email-enabled-switch"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-purple-600" />
              <div>
                <Label className="font-medium">SMS Channel</Label>
                <p className="text-sm text-slate-500">Enable SMS communications</p>
              </div>
            </div>
            <Switch 
              checked={smsEnabled} 
              onCheckedChange={(v) => { setSmsEnabled(v); handleChange(); }}
              data-testid="sms-enabled-switch"
            />
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#1d293d]">Quiet Hours</h4>
            <p className="text-sm text-slate-500">Prevent sending during specific hours</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              value={quietHoursStart}
              onChange={(e) => { setQuietHoursStart(e.target.value); handleChange(); }}
              data-testid="quiet-start-input"
            />
          </div>
          <div className="grid gap-2">
            <Label>End Time</Label>
            <Input
              type="time"
              value={quietHoursEnd}
              onChange={(e) => { setQuietHoursEnd(e.target.value); handleChange(); }}
              data-testid="quiet-end-input"
            />
          </div>
        </div>

        {quietHoursStart && quietHoursEnd && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
            <AlertCircle size={16} />
            <span>Messages scheduled during {quietHoursStart} - {quietHoursEnd} will be delayed.</span>
          </div>
        )}
      </div>

      {/* Privacy & Tracking */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#1d293d]">Privacy & Opt-Out</h4>
            <p className="text-sm text-slate-500">Manage recipient privacy settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="font-medium">Respect Opt-Out Preferences</Label>
              <p className="text-sm text-slate-500">Automatically exclude unsubscribed recipients</p>
            </div>
            <Switch 
              checked={optOutEnabled} 
              onCheckedChange={(v) => { setOptOutEnabled(v); handleChange(); }}
              data-testid="opt-out-switch"
            />
          </div>

          <div className="grid gap-2">
            <Label>Custom Unsubscribe Page URL</Label>
            <Input
              type="url"
              placeholder="https://yourdomain.com/unsubscribe"
              value={unsubscribePageUrl}
              onChange={(e) => { setUnsubscribePageUrl(e.target.value); handleChange(); }}
            />
            <p className="text-xs text-slate-500">Leave empty to use default unsubscribe page</p>
          </div>
        </div>
      </div>

      {/* Tracking */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#1d293d]">Tracking & Analytics</h4>
            <p className="text-sm text-slate-500">Configure engagement tracking</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="font-medium">Track Opens</Label>
              <p className="text-sm text-slate-500">Track when recipients open emails</p>
            </div>
            <Switch 
              checked={trackOpens} 
              onCheckedChange={(v) => { setTrackOpens(v); handleChange(); }}
              data-testid="track-opens-switch"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="font-medium">Track Clicks</Label>
              <p className="text-sm text-slate-500">Track when recipients click links</p>
            </div>
            <Switch 
              checked={trackClicks} 
              onCheckedChange={(v) => { setTrackClicks(v); handleChange(); }}
              data-testid="track-clicks-switch"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
