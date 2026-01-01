import React, { useState } from 'react';
import { Mail, RotateCcw, Save } from 'lucide-react';
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Switch } from "../../ui/switch";
import { Badge } from "../../ui/badge";
import { EmailEditorComponent } from "../../email-config/EmailEditorComponent";
import { InheritanceInfoIcon } from "../../email-config/InheritanceInfoIcon";
import { toast } from "sonner";

interface EmailTrigger {
  id: string;
  trigger: string;
  triggerLabel: string;
  description: string;
  enabled: boolean;
  hasOverride: boolean;
  source: 'global' | 'event' | 'ticket';
  subject?: string;
  body?: string;
  sendTiming?: 'immediate' | 'scheduled';
  scheduleOffset?: number;
  scheduleUnit?: 'minutes' | 'hours' | 'days';
  globalSubject: string;
  globalBody: string;
  variables: string[];
}

const SYSTEM_EMAIL_TRIGGERS: EmailTrigger[] = [
  {
    id: 'registration_complete',
    trigger: 'registration_complete',
    triggerLabel: 'Registration Completed',
    description: 'Sent when attendee completes registration',
    enabled: true,
    hasOverride: false,
    source: 'global',
    globalSubject: 'Registration Confirmed - {{event_name}}',
    globalBody: `Hi {{attendee_name}},\n\nThank you for registering for {{event_name}}!\n\nBest regards,\n{{organizer_name}}`,
    variables: ['{{attendee_name}}', '{{event_name}}', '{{event_date}}', '{{organizer_name}}']
  },
  {
    id: 'payment_successful',
    trigger: 'payment_successful',
    triggerLabel: 'Payment Successful',
    description: 'Sent when payment is processed',
    enabled: true,
    hasOverride: false,
    source: 'global',
    globalSubject: 'Payment Received - {{event_name}}',
    globalBody: `Payment confirmed.\n\nAmount: {{payment_amount}}\nTransaction: {{transaction_id}}`,
    variables: ['{{event_name}}', '{{payment_amount}}', '{{transaction_id}}']
  },
  {
    id: 'event_reminder',
    trigger: 'event_reminder',
    triggerLabel: 'Event Reminder',
    description: 'Scheduled before event starts',
    enabled: true,
    hasOverride: false,
    source: 'global',
    globalSubject: 'Reminder: {{event_name}} is Coming Up!',
    globalBody: `{{event_name}} is happening soon!\n\nDate: {{event_date}}\nTime: {{event_time}}`,
    variables: ['{{event_name}}', '{{event_date}}', '{{event_time}}']
  },
  {
    id: 'event_cancelled',
    trigger: 'event_cancelled',
    triggerLabel: 'Event Cancelled',
    description: 'Sent when event is cancelled',
    enabled: false,
    hasOverride: false,
    source: 'global',
    globalSubject: 'Event Cancelled: {{event_name}}',
    globalBody: `We regret to inform you that {{event_name}} has been cancelled.\n\nRefunds will be processed within 5-7 business days.`,
    variables: ['{{event_name}}', '{{attendee_name}}']
  },
  {
    id: 'post_event_followup',
    trigger: 'post_event_followup',
    triggerLabel: 'Post-Event Follow-up',
    description: 'Sent after event ends',
    enabled: false,
    hasOverride: false,
    source: 'global',
    globalSubject: 'Thank you for attending {{event_name}}',
    globalBody: `Thank you for attending {{event_name}}!\n\nWe hope you enjoyed the experience.`,
    variables: ['{{event_name}}', '{{attendee_name}}']
  }
];

export const SettingsEmail = () => {
  const [emailTriggers, setEmailTriggers] = useState<EmailTrigger[]>(SYSTEM_EMAIL_TRIGGERS);
  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(new Set());

  const toggleEmailTrigger = (id: string) => {
    const newExpanded = new Set(expandedTriggers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTriggers(newExpanded);
  };

  const toggleEmailOverride = (id: string, enabled: boolean) => {
    setEmailTriggers(prev => prev.map(trigger => {
      if (trigger.id === id) {
        if (enabled) {
          return {
            ...trigger,
            hasOverride: true,
            source: 'event',
            subject: trigger.globalSubject,
            body: trigger.globalBody,
            sendTiming: 'immediate' as const
          };
        } else {
          return {
            ...trigger,
            hasOverride: false,
            source: 'global',
            subject: undefined,
            body: undefined,
            sendTiming: undefined
          };
        }
      }
      return trigger;
    }));
  };

  const updateEmailTrigger = (id: string, value: any) => {
    setEmailTriggers(prev => prev.map(trigger =>
      trigger.id === id ? { ...trigger, ...value } : trigger
    ));
  };

  const toggleTriggerEnabled = (id: string, enabled: boolean) => {
    setEmailTriggers(prev => prev.map(trigger =>
      trigger.id === id ? { ...trigger, enabled } : trigger
    ));
  };

  const resetEmailToGlobal = (id: string) => {
    toggleEmailOverride(id, false);
    toast.success('Reset to global template');
  };

  const getSourceBadge = (source: 'global' | 'event' | 'ticket') => {
    if (source === 'ticket') {
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-xs">Ticket Override</Badge>;
    } else if (source === 'event') {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-xs">Event Override</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">Using Global</Badge>;
    }
  };

  const handleSave = () => {
    toast.success('Email configuration saved successfully');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-[#1d293d]">Email Configuration</h3>
          <InheritanceInfoIcon context="event" />
        </div>
        <Button className="bg-[#0f172b]" onClick={handleSave}>
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>
      <Separator />

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Event-Level Email Overrides:</strong> Customize email templates specifically for this event. 
            When override is disabled, emails use the Global template configuration. Ticket-level overrides take precedence over event-level.
          </p>
        </div>

        <div className="space-y-3">
          {emailTriggers.map((trigger) => {
            const isExpanded = expandedTriggers.has(trigger.id);

            return (
              <div 
                key={trigger.id} 
                className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleEmailTrigger(trigger.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-[#1d293d]">{trigger.triggerLabel}</h3>
                          {getSourceBadge(trigger.source)}
                          {trigger.enabled ? (
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
                          checked={trigger.enabled}
                          onCheckedChange={(enabled) => toggleTriggerEnabled(trigger.id, enabled)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-600">Override</Label>
                        <Switch 
                          checked={trigger.hasOverride}
                          onCheckedChange={(enabled) => toggleEmailOverride(trigger.id, enabled)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50">
                    {trigger.hasOverride ? (
                      <>
                        <EmailEditorComponent
                          emailType={{
                            id: trigger.id,
                            name: trigger.triggerLabel,
                            trigger: trigger.trigger,
                            variables: trigger.variables
                          }}
                          value={{
                            subject: trigger.subject || '',
                            body: trigger.body || '',
                            sendTiming: trigger.sendTiming || 'immediate',
                            scheduleOffset: trigger.scheduleOffset,
                            scheduleUnit: trigger.scheduleUnit
                          }}
                          onChange={(value) => updateEmailTrigger(trigger.id, value)}
                        />
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => resetEmailToGlobal(trigger.id)}
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
