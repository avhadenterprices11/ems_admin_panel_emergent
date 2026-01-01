import React, { useState } from 'react';
import { Mail, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface EmailOverrideSectionProps {
  control: any;
  watch: any;
  setValue: any;
}

export const EmailOverrideSection: React.FC<EmailOverrideSectionProps> = ({ control, watch, setValue }) => {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  const EMAIL_TYPES = [
    {
      id: 'booking-confirmation',
      name: 'Booking Confirmation',
      description: 'Sent when attendee completes registration',
      globalSubject: 'Registration Confirmed - {{event_name}}',
      globalBody: 'Thank you for registering!'
    },
    {
      id: 'ticket-issued',
      name: 'Ticket Issued',
      description: 'Sent when tickets are ready',
      globalSubject: 'Your Tickets for {{event_name}}',
      globalBody: 'Your tickets are now available!'
    },
    {
      id: 'payment-successful',
      name: 'Payment Successful',
      description: 'Sent when payment is processed',
      globalSubject: 'Payment Received - {{event_name}}',
      globalBody: 'Payment successful!'
    },
    {
      id: 'event-reminder',
      name: 'Event Reminder',
      description: 'Sent before event starts',
      globalSubject: 'Reminder: {{event_name}} is Coming Up!',
      globalBody: 'Don\'t forget about our event!'
    }
  ];

  const toggleEmail = (id: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEmails(newExpanded);
  };

  const getEmailOverride = (emailId: string) => {
    const overrides = watch('email_overrides') || {};
    return overrides[emailId];
  };

  const setEmailOverride = (emailId: string, data: any) => {
    const overrides = watch('email_overrides') || {};
    setValue('email_overrides', {
      ...overrides,
      [emailId]: data
    });
  };

  const toggleOverride = (emailId: string, enabled: boolean) => {
    if (enabled) {
      setEmailOverride(emailId, {
        enabled: true,
        subject: '',
        body: '',
        sendTiming: 'immediate'
      });
    } else {
      const overrides = watch('email_overrides') || {};
      const newOverrides = { ...overrides };
      delete newOverrides[emailId];
      setValue('email_overrides', newOverrides);
    }
  };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="text-slate-400" size={20} />
          <h3 className="text-lg font-bold text-[#1d293d]">Email Configuration</h3>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-0">Event-Level Overrides</Badge>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-blue-700">
            Override global email templates for this event. Enable an override to customize subject, body, and timing. When disabled, global templates are used.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {EMAIL_TYPES.map((emailType) => {
          const override = getEmailOverride(emailType.id);
          const isOverridden = !!override?.enabled;
          const isExpanded = expandedEmails.has(emailType.id);

          return (
            <div key={emailType.id} className="border border-slate-200 rounded-xl bg-slate-50/50 overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                onClick={() => toggleEmail(emailType.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Mail className="text-slate-400" size={18} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[#1d293d]">{emailType.name}</h4>
                        {isOverridden ? (
                          <Badge variant="default" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-xs">
                            Custom
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Using Global</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{emailType.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-600">Override</Label>
                      <Switch 
                        checked={isOverridden}
                        onCheckedChange={(enabled) => toggleOverride(emailType.id, enabled)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-slate-400" size={18} />
                    ) : (
                      <ChevronDown className="text-slate-400" size={18} />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-200 pt-4 bg-white">
                  {isOverridden ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Email Subject</Label>
                        <Input 
                          value={override?.subject || ''}
                          onChange={(e) => setEmailOverride(emailType.id, { ...override, subject: e.target.value })}
                          placeholder={emailType.globalSubject}
                          className="border-slate-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Email Body</Label>
                        <Textarea 
                          value={override?.body || ''}
                          onChange={(e) => setEmailOverride(emailType.id, { ...override, body: e.target.value })}
                          placeholder={emailType.globalBody}
                          className="min-h-[120px] border-slate-200 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Send Timing</Label>
                        <Select 
                          value={override?.sendTiming || 'immediate'}
                          onValueChange={(val) => setEmailOverride(emailType.id, { ...override, sendTiming: val })}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediately</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {override?.sendTiming === 'scheduled' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Offset</Label>
                            <Input 
                              type="number"
                              value={override?.scheduleOffset || ''}
                              onChange={(e) => setEmailOverride(emailType.id, { ...override, scheduleOffset: parseInt(e.target.value) })}
                              placeholder="e.g. 24"
                              className="border-slate-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Unit</Label>
                            <Select 
                              value={override?.scheduleUnit || 'hours'}
                              onValueChange={(val) => setEmailOverride(emailType.id, { ...override, scheduleUnit: val })}
                            >
                              <SelectTrigger className="border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">
                        Currently using global template. Enable override to customize.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};