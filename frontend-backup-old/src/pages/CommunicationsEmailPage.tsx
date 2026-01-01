import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Mail, ChevronDown, ChevronUp, Save, Plus, Trash2
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Collapsible, CollapsibleContent } from "../components/ui/collapsible";
import { EmailEditorComponent } from "../components/email-config/EmailEditorComponent";
import { toast } from 'sonner';

interface CommunicationsEmailPageProps {
  onBack?: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  subject: string;
  body: string;
  sendTiming: 'immediate' | 'scheduled';
  scheduleOffset?: number;
  scheduleUnit?: 'minutes' | 'hours' | 'days';
  variables: string[];
}

const SYSTEM_VARIABLES = [
  '{{attendee_name}}',
  '{{attendee_email}}',
  '{{event_name}}',
  '{{event_date}}',
  '{{event_time}}',
  '{{venue_name}}',
  '{{organizer_name}}',
  '{{confirmation_number}}',
  '{{ticket_type}}',
  '{{ticket_download_link}}',
  '{{payment_amount}}',
  '{{transaction_id}}'
];

const LIFECYCLE_TRIGGERS = [
  { value: 'registration_complete', label: 'Registration Complete' },
  { value: 'ticket_generated', label: 'Ticket Generated' },
  { value: 'payment_processed', label: 'Payment Processed' },
  { value: 'refund_processed', label: 'Refund Processed' },
  { value: 'event_updated', label: 'Event Updated' },
  { value: 'event_cancelled', label: 'Event Cancelled' },
  { value: 'scheduled_before_event', label: 'Scheduled Before Event' }
];

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    trigger: 'registration_complete',
    enabled: true,
    subject: 'Registration Confirmed - {{event_name}}',
    body: `Hi {{attendee_name}},

Thank you for registering for {{event_name}}!

Event Details:
Date: {{event_date}}
Time: {{event_time}}
Venue: {{venue_name}}

Your confirmation number is: {{confirmation_number}}

Best regards,
{{organizer_name}}`,
    sendTiming: 'immediate',
    variables: SYSTEM_VARIABLES
  },
  {
    id: 'ticket-issued',
    name: 'Ticket Issued',
    trigger: 'ticket_generated',
    enabled: true,
    subject: 'Your Tickets for {{event_name}}',
    body: `Hi {{attendee_name}},

Your tickets for {{event_name}} are now available!

Download: {{ticket_download_link}}

Best regards,
{{organizer_name}}`,
    sendTiming: 'immediate',
    variables: SYSTEM_VARIABLES
  },
  {
    id: 'payment-successful',
    name: 'Payment Successful',
    trigger: 'payment_processed',
    enabled: true,
    subject: 'Payment Received - {{event_name}}',
    body: `Hi {{attendee_name}},

We have received your payment for {{event_name}}.

Amount: {{payment_amount}}
Transaction ID: {{transaction_id}}

Thank you!
{{organizer_name}}`,
    sendTiming: 'immediate',
    variables: SYSTEM_VARIABLES
  },
  {
    id: 'event-reminder',
    name: 'Event Reminder',
    trigger: 'scheduled_before_event',
    enabled: true,
    subject: 'Reminder: {{event_name}} is Coming Up!',
    body: `Hi {{attendee_name}},

{{event_name}} is happening soon!

Date: {{event_date}}
Time: {{event_time}}
Venue: {{venue_name}}

See you there!
{{organizer_name}}`,
    sendTiming: 'scheduled',
    scheduleOffset: 24,
    scheduleUnit: 'hours',
    variables: SYSTEM_VARIABLES
  }
];

export function CommunicationsEmailPage({ onBack }: CommunicationsEmailPageProps) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmailName, setNewEmailName] = useState('');
  const [newEmailTrigger, setNewEmailTrigger] = useState('');
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const toggleTemplate = (id: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTemplates(newExpanded);
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
    const isSystemTemplate = DEFAULT_TEMPLATES.some(t => t.id === id);
    if (isSystemTemplate) {
      toast.error('System templates cannot be deleted');
      return;
    }
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Email template deleted');
  };

  const getTriggerLabel = (triggerValue: string) => {
    return LIFECYCLE_TRIGGERS.find(t => t.value === triggerValue)?.label || triggerValue;
  };

  const handleSave = () => {
    toast.success('Email templates saved successfully');
  };

  const createNewEmail = () => {
    if (!newEmailName || !newEmailTrigger) {
      toast.error('Name and trigger are required');
      return;
    }

    const newTemplate: EmailTemplate = {
      id: `email-${Date.now()}`,
      name: newEmailName,
      trigger: newEmailTrigger,
      enabled: true,
      subject: '',
      body: '',
      sendTiming: 'immediate',
      variables: SYSTEM_VARIABLES
    };

    setTemplates([...templates, newTemplate]);
    setCreateDialogOpen(false);
    setNewEmailName('');
    setNewEmailTrigger('');
    toast.success('New email type created');
    setExpandedTemplates(new Set([...expandedTemplates, newTemplate.id]));
  };

  return (
    <div className="space-y-6 p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left Side: Back + Title */}
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-slate-600 -ml-2"
            onClick={() => navigate('/communications')}
          >
            <ChevronLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#1d293d]">Email Templates</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500">Global attendee email configuration</p>
              <button 
                type="button"
                onClick={() => setLearnMoreOpen(!learnMoreOpen)}
                className="text-sm text-[#4f39f6] hover:underline"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => navigate('/communications')}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSave}
            className="bg-[#4f39f6] hover:bg-[#3d2cdb]"
          >
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
          <Button 
            type="button"
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#0f172b] hover:bg-[#1d293d]"
          >
            <Plus size={16} className="mr-2" />
            Create Email Type
          </Button>
        </div>
      </div>

      {/* LEARN MORE SECTION (Collapsible) */}
      <Collapsible open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
        <CollapsibleContent>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
            {/* System Architecture */}
            <div>
              <h3 className="font-bold text-[#1d293d] mb-2">System Architecture</h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li>• Email types are defined globally and serve as the source of truth</li>
                <li>• Events and ticket types can override global templates but cannot create new email types</li>
                <li>• Only one email is sent per trigger per attendee (no merging across levels)</li>
              </ul>
            </div>

            {/* Priority Order */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-bold text-[#1d293d] mb-2">Priority Order</h3>
              <p className="text-sm text-slate-700 mb-2">
                When multiple configuration levels exist, the system uses this priority:
              </p>
              <div className="bg-white border border-slate-200 rounded p-3 text-sm text-slate-700">
                <span className="font-bold">Ticket Override</span> → <span className="font-bold">Event Override</span> → <span className="font-bold">Global Template</span>
              </div>
            </div>

            {/* Critical Rules */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-bold text-[#1d293d] mb-2">Critical Rules</h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li>• <span className="font-bold">Master Kill Switch:</span> Disabling a global email prevents all event and ticket overrides from sending</li>
                <li>• <span className="font-bold">Inheritance:</span> Override fields remain read-only until the override toggle is enabled</li>
                <li>• <span className="font-bold">Variables:</span> System-defined variables cannot be created or modified; they resolve automatically at send time</li>
                <li>• <span className="font-bold">Scope:</span> This page defines global defaults only; overrides are configured in event and ticket management</li>
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* EMAIL TEMPLATE LIST */}
      <div className="space-y-4">
        {templates.map((template) => {
          const isExpanded = expandedTemplates.has(template.id);
          const isSystemTemplate = DEFAULT_TEMPLATES.some(t => t.id === template.id);

          return (
            <div key={template.id} className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden">
              {/* Header (Clickable) */}
              <div 
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleTemplate(template.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Mail className="text-slate-400" size={20} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#1d293d]">{template.name}</h3>
                        <Badge 
                          variant={template.enabled ? "default" : "secondary"}
                          className={template.enabled ? "bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs" : "text-xs"}
                        >
                          {template.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <span className="text-xs text-slate-500">• {getTriggerLabel(template.trigger)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={template.enabled}
                      onCheckedChange={(checked) => updateTemplate(template.id, { enabled: checked })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50">
                  <EmailEditorComponent
                    emailType={{
                      id: template.id,
                      name: template.name,
                      trigger: template.trigger,
                      variables: template.variables
                    }}
                    value={{
                      subject: template.subject,
                      body: template.body,
                      sendTiming: template.sendTiming,
                      scheduleOffset: template.scheduleOffset,
                      scheduleUnit: template.scheduleUnit
                    }}
                    onChange={(value) => updateTemplate(template.id, value)}
                  />
                  
                  {!isSystemTemplate && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete Email Type
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE NEW EMAIL DIALOG */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Type</DialogTitle>
            <DialogDescription>
              Define a new attendee lifecycle email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Name</Label>
              <Input 
                placeholder="e.g., Welcome Email"
                value={newEmailName}
                onChange={(e) => setNewEmailName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Lifecycle Trigger</Label>
              <Select value={newEmailTrigger} onValueChange={setNewEmailTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger..." />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE_TRIGGERS.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={createNewEmail}>
              Create Email Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
