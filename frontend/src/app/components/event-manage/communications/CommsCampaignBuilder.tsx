import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { eventsAPI, Campaign, MessageTemplate, AudienceSegment, CreateCampaignInput } from '../../../api/events.api';
import { toast } from 'sonner';

interface Props {
  eventId: number;
  campaign?: Campaign | null;
  templates: MessageTemplate[];
  onCancel: () => void;
  onSave: (data: CreateCampaignInput, sendNow: boolean) => void;
}

const STEPS = [
  { id: 1, title: 'Basics' },
  { id: 2, title: 'Audience' },
  { id: 3, title: 'Content' },
  { id: 4, title: 'Schedule' },
  { id: 5, title: 'Review' }
];

export const CommsCampaignBuilder = ({ eventId, campaign, templates, onCancel, onSave }: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  
  // Form state
  const [name, setName] = useState(campaign?.name || '');
  const [channel, setChannel] = useState<'email' | 'sms'>(campaign?.channel || 'email');
  const [campaignType, setCampaignType] = useState<'one-time' | 'trigger-based'>(campaign?.campaign_type || 'one-time');
  const [audienceType, setAudienceType] = useState<string>(
    campaign?.audience_rule?.type || 'all'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    campaign?.template_id?.toString() || ''
  );
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [content, setContent] = useState(campaign?.content || '');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>(
    campaign?.scheduled_at ? 'later' : 'now'
  );
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sendNow, setSendNow] = useState(false);

  // Fetch audience segments
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const data = await eventsAPI.getAudienceSegments(eventId);
        setSegments(data);
      } catch (error) {
        console.error('Error fetching segments:', error);
      }
    };
    fetchSegments();
  }, [eventId]);

  // Load template content when selected
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id.toString() === selectedTemplateId);
      if (template) {
        setContent(template.content);
        if (template.subject) setSubject(template.subject);
      }
    }
  }, [selectedTemplateId, templates]);

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    
    if (currentStep === 3 && channel === 'email' && !subject.trim()) {
      toast.error('Subject line is required for email campaigns');
      return;
    }
    
    if (currentStep === 3 && !content.trim() && !selectedTemplateId) {
      toast.error('Content is required');
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    const data: CreateCampaignInput = {
      name,
      channel,
      campaign_type: campaignType,
      template_id: selectedTemplateId ? parseInt(selectedTemplateId) : undefined,
      subject: channel === 'email' ? subject : undefined,
      content: content || undefined,
      audience_rule: { type: audienceType as any },
      scheduled_at: scheduleType === 'later' && scheduleDate && scheduleTime 
        ? `${scheduleDate}T${scheduleTime}:00Z` 
        : undefined,
    };
    
    onSave(data, sendNow && scheduleType === 'now');
  };

  const handleSaveDraft = () => {
    const data: CreateCampaignInput = {
      name: name || 'Untitled Campaign',
      channel,
      campaign_type: campaignType,
      template_id: selectedTemplateId ? parseInt(selectedTemplateId) : undefined,
      subject: channel === 'email' ? subject : undefined,
      content: content || undefined,
      audience_rule: { type: audienceType as any },
    };
    
    onSave(data, false);
  };

  // Get selected segment info
  const selectedSegment = segments.find(s => s.type === audienceType);
  const selectedTemplate = templates.find(t => t.id.toString() === selectedTemplateId);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1d293d]">
            {campaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <p className="text-sm text-slate-500">
            Step {currentStep} of 5: {STEPS[currentStep - 1].title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-1 hidden md:block">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                step.id === currentStep ? 'bg-[#0f172b] text-white' :
                step.id < currentStep ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs border ${
                step.id === currentStep ? 'border-white text-white' :
                step.id < currentStep ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
              }`}>
                {step.id < currentStep ? <CheckCircle2 size={14} /> : step.id}
              </div>
              {step.title}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <div className="grid gap-2">
                  <Label>Campaign Name <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Welcome Email 2024" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="campaign-name-input"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Channel</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                        channel === 'email' ? 'border-[#0f172b] bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setChannel('email')}
                      data-testid="channel-email"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Mail size={20} />
                      </div>
                      <div className="font-medium text-slate-900">Email</div>
                    </div>
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                        channel === 'sms' ? 'border-[#0f172b] bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setChannel('sms')}
                      data-testid="channel-sms"
                    >
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <MessageSquare size={20} />
                      </div>
                      <div className="font-medium text-slate-900">SMS</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Campaign Type</Label>
                  <RadioGroup value={campaignType} onValueChange={(v) => setCampaignType(v as any)} className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="one-time" id="t1" className="mt-1" />
                      <div>
                        <Label htmlFor="t1" className="font-bold cursor-pointer">
                          One-time Broadcast
                        </Label>
                        <p className="text-sm text-slate-500">
                          Send immediately or schedule for a specific time.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="trigger-based" id="t2" className="mt-1" />
                      <div>
                        <Label htmlFor="t2" className="font-bold cursor-pointer">
                          Trigger-based
                        </Label>
                        <p className="text-sm text-slate-500">
                          Send automatically when a user performs an action (e.g. registers).
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Audience */}
            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Select Audience</h3>
                </div>
                <RadioGroup value={audienceType} onValueChange={setAudienceType} className="space-y-3">
                  {segments.map((segment) => (
                    <div 
                      key={segment.type}
                      className="flex items-center justify-between border p-4 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={segment.type} id={segment.type} />
                        <Label htmlFor={segment.type} className="cursor-pointer font-medium">
                          {segment.name}
                        </Label>
                      </div>
                      <Badge variant="secondary">{segment.count} Recipients</Badge>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <Label>Message Content</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Choose Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No template</SelectItem>
                      {templates.filter(t => t.channel === channel).map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {channel === 'email' ? (
                  <>
                    <div className="grid gap-2">
                      <Label>Subject Line <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Don't miss out: Event starts tomorrow!" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        data-testid="campaign-subject-input"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email Body</Label>
                      <Textarea
                        className="min-h-[300px]"
                        placeholder="Write your email content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        data-testid="campaign-content-input"
                      />
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setContent(c => c + '{{FirstName}}')}>
                          {`{{FirstName}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setContent(c => c + '{{EventName}}')}>
                          {`{{EventName}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setContent(c => c + '{{TicketType}}')}>
                          {`{{TicketType}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setContent(c => c + '{{QRCode}}')}>
                          {`{{QRCode}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setContent(c => c + '{{EventDate}}')}>
                          {`{{EventDate}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => setContent(c => c + '{{Location}}')}>
                          {`{{Location}}`}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label>Message</Label>
                      <Textarea
                        className="min-h-[150px]"
                        placeholder="Enter SMS text..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        data-testid="campaign-sms-content"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Variables: {`{{FirstName}}`}, {`{{EventName}}`}</span>
                        <span>{content.length} / 160 characters</span>
                      </div>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <Label className="text-xs text-slate-500 uppercase mb-2 block">Preview</Label>
                      <div className="bg-white p-3 rounded border border-slate-200 text-sm max-w-[250px]">
                        {content || "Message preview will appear here..."}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 4 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as any)} className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="now" id="s1" className="mt-1" />
                    <div>
                      <Label htmlFor="s1" className="font-bold cursor-pointer">
                        Send Immediately
                      </Label>
                      <p className="text-sm text-slate-500">
                        Campaign will start sending as soon as you confirm.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="later" id="s2" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="s2" className="font-bold cursor-pointer">
                        Schedule for Later
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-2 max-w-sm">
                        <Input 
                          type="date" 
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          disabled={scheduleType !== 'later'}
                        />
                        <Input 
                          type="time" 
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          disabled={scheduleType !== 'later'}
                        />
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg text-[#1d293d] mb-4">Review & Confirm</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Campaign Name:</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Channel:</span>
                    <span className="font-medium capitalize">{channel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-medium capitalize">{campaignType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Audience:</span>
                    <span className="font-medium">
                      {selectedSegment?.name || 'All Attendees'} ({selectedSegment?.count || 0})
                    </span>
                  </div>
                  {selectedTemplate && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">Template:</span>
                      <span className="font-medium">{selectedTemplate.name}</span>
                    </div>
                  )}
                  {channel === 'email' && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-500">Subject:</span>
                      <span className="font-medium">{subject}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Schedule:</span>
                    <span className="font-medium">
                      {scheduleType === 'now' ? 'Send Immediately' : `${scheduleDate} at ${scheduleTime}`}
                    </span>
                  </div>
                </div>

                {scheduleType === 'now' && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Clicking "Send Campaign" will immediately send this campaign to {selectedSegment?.count || 0} recipients.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
          <ChevronLeft size={16} className="mr-2" /> Previous
        </Button>
        <Button 
          className="bg-[#0f172b]" 
          onClick={() => {
            if (currentStep === 5 && scheduleType === 'now') {
              setSendNow(true);
            }
            handleNext();
          }}
          disabled={loading}
          data-testid="campaign-next-btn"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {currentStep === 5 ? (scheduleType === 'now' ? 'Send Campaign' : 'Schedule Campaign') : 'Next'}
          {currentStep < 5 && <ChevronRight size={16} className="ml-2" />}
        </Button>
      </div>
    </div>
  );
};
