import React, { useState, useEffect } from 'react';
import { Mail, RotateCcw, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Badge } from "../../ui/badge";
import { EmailEditorComponent } from "../../email-config/EmailEditorComponent";
import { InheritanceInfoIcon } from "../../email-config/InheritanceInfoIcon";
import { toast } from "sonner";
import { 
  emailTemplatesAPI, 
  EmailScenarioConfig, 
  EmailScenario,
  EmailProviderStatus 
} from '../../../api/events.api';

interface SettingsEmailProps {
  eventId: number;
}

export const SettingsEmail: React.FC<SettingsEmailProps> = ({ eventId }) => {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Data states
  const [emailTriggers, setEmailTriggers] = useState<EmailScenarioConfig[]>([]);
  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(new Set());
  const [emailProviderStatus, setEmailProviderStatus] = useState<EmailProviderStatus>({ available: false });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch templates on load
  useEffect(() => {
    fetchTemplates();
  }, [eventId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailTemplatesAPI.getEventTemplates(eventId);
      setEmailTriggers(response.templates);
      setEmailProviderStatus(response.emailProviderStatus);
      setHasChanges(false);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailTrigger = (scenario: string) => {
    const newExpanded = new Set(expandedTriggers);
    if (newExpanded.has(scenario)) {
      newExpanded.delete(scenario);
    } else {
      newExpanded.add(scenario);
    }
    setExpandedTriggers(newExpanded);
  };

  const toggleEmailOverride = (scenario: string, enabled: boolean) => {
    setEmailTriggers(prev => prev.map(trigger => {
      if (trigger.scenario === scenario) {
        if (enabled) {
          return {
            ...trigger,
            has_override: true,
            source: 'event' as const,
            // Copy global values as starting point
            subject: trigger.globalSubject,
            body: trigger.globalBody,
            send_timing: trigger.send_timing || 'immediate'
          };
        } else {
          return {
            ...trigger,
            has_override: false,
            source: 'global' as const,
            // Revert to global values
            subject: trigger.globalSubject,
            body: trigger.globalBody
          };
        }
      }
      return trigger;
    }));
    setHasChanges(true);
  };

  const updateEmailTrigger = (scenario: string, value: Partial<EmailScenarioConfig>) => {
    setEmailTriggers(prev => prev.map(trigger =>
      trigger.scenario === scenario ? { ...trigger, ...value } : trigger
    ));
    setHasChanges(true);
  };

  const toggleTriggerEnabled = (scenario: string, enabled: boolean) => {
    setEmailTriggers(prev => prev.map(trigger =>
      trigger.scenario === scenario ? { ...trigger, is_enabled: enabled } : trigger
    ));
    setHasChanges(true);
  };

  const resetEmailToGlobal = async (scenario: string) => {
    toggleEmailOverride(scenario, false);
    toast.success('Reset to global template');
  };

  const getSourceBadge = (source: 'global' | 'event') => {
    if (source === 'event') {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-xs">Event Override</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Using Global</Badge>;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const scenarios = emailTriggers.map(t => ({
        scenario: t.scenario,
        is_enabled: t.is_enabled,
        has_override: t.has_override,
        subject: t.has_override ? t.subject : null,
        body: t.has_override ? t.body : null,
        send_timing: t.send_timing,
        schedule_offset: t.schedule_offset,
        schedule_unit: t.schedule_unit
      }));

      const result = await emailTemplatesAPI.saveEventTemplates(eventId, { scenarios });
      setEmailTriggers(result.templates);
      setHasChanges(false);
      toast.success(result.message || 'Email configuration saved successfully');
    } catch (error) {
      console.error('Error saving email templates:', error);
      toast.error('Failed to save email configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToGlobal = async () => {
    try {
      setResetting(true);
      const result = await emailTemplatesAPI.resetToGlobal(eventId);
      setEmailTriggers(result.templates);
      setHasChanges(false);
      toast.success(result.message || 'Reset to global defaults');
    } catch (error) {
      console.error('Error resetting templates:', error);
      toast.error('Failed to reset to global defaults');
    } finally {
      setResetting(false);
    }
  };

  const handleSendTest = async (scenario: EmailScenario, email: string): Promise<boolean> => {
    try {
      const result = await emailTemplatesAPI.sendTestEmail(eventId, scenario, email);
      toast.success(result.message);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send test email';
      toast.error(message);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading email configuration...</span>
        </div>
      </div>
    );
  }

  // Check if any trigger has an override
  const hasAnyOverride = emailTriggers.some(t => t.has_override);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6" data-testid="settings-email">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-[#1d293d]">Email Configuration</h3>
          <InheritanceInfoIcon context="event" />
        </div>
        <div className="flex gap-2">
          {hasAnyOverride && (
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
            data-testid="save-email-btn"
          >
            {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
      <Separator />

      <div className="space-y-4">
        {/* Email Provider Status */}
        {!emailProviderStatus.available && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Email Provider Not Configured:</strong> {emailProviderStatus.error || 'Please configure your email provider in the Integrations settings to enable email sending.'}
            </div>
          </div>
        )}

        {emailProviderStatus.available && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <Mail size={16} className="text-green-600" />
            <span className="text-sm text-green-800">
              Email Provider: <strong className="capitalize">{emailProviderStatus.provider}</strong> (Connected)
            </span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Event-Level Email Overrides:</strong> Customize email templates specifically for this event. 
            When override is disabled, emails use the Global template configuration.
          </p>
        </div>

        <div className="space-y-3">
          {emailTriggers.map((trigger) => {
            const isExpanded = expandedTriggers.has(trigger.scenario);

            return (
              <div 
                key={trigger.scenario} 
                className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden"
                data-testid={`email-scenario-${trigger.scenario}`}
              >
                {/* Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleEmailTrigger(trigger.scenario)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-[#1d293d]">{trigger.triggerLabel}</h3>
                          {getSourceBadge(trigger.source)}
                          {trigger.is_enabled ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs">
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{trigger.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-600">Enabled</Label>
                        <Switch 
                          checked={trigger.is_enabled}
                          onCheckedChange={(enabled) => toggleTriggerEnabled(trigger.scenario, enabled)}
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`${trigger.scenario}-enabled-switch`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-600">Override</Label>
                        <Switch 
                          checked={trigger.has_override}
                          onCheckedChange={(enabled) => toggleEmailOverride(trigger.scenario, enabled)}
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`${trigger.scenario}-override-switch`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50">
                    {trigger.has_override ? (
                      <>
                        <EmailEditorComponent
                          emailType={{
                            id: trigger.scenario,
                            name: trigger.triggerLabel,
                            trigger: trigger.scenario,
                            variables: trigger.variables
                          }}
                          value={{
                            subject: trigger.subject || '',
                            body: trigger.body || '',
                            sendTiming: trigger.send_timing || 'immediate',
                            scheduleOffset: trigger.schedule_offset || undefined,
                            scheduleUnit: trigger.schedule_unit || undefined
                          }}
                          onChange={(value) => updateEmailTrigger(trigger.scenario, {
                            subject: value.subject,
                            body: value.body,
                            send_timing: value.sendTiming,
                            schedule_offset: value.scheduleOffset,
                            schedule_unit: value.scheduleUnit
                          })}
                          onSendTest={(email) => handleSendTest(trigger.scenario as EmailScenario, email)}
                          emailProviderAvailable={emailProviderStatus.available}
                        />
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => resetEmailToGlobal(trigger.scenario)}
                          >
                            <RotateCcw size={14} className="mr-2" />
                            Reset to Global
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-medium">Inherited from Global Template</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Subject:</div>
                            <div className="text-sm text-slate-700 font-mono bg-white p-3 rounded border border-slate-200">
                              {trigger.globalSubject}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Body:</div>
                            <div className="text-sm text-slate-700 font-mono bg-white p-3 rounded border border-slate-200 whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                              {trigger.globalBody}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">Enable override above to customize for this event</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
