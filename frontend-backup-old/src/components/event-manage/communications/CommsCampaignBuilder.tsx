import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface Props {
  onCancel: () => void;
  onSave: () => void;
}

const STEPS = [
  { id: 1, title: 'Basics' },
  { id: 2, title: 'Audience' },
  { id: 3, title: 'Content' },
  { id: 4, title: 'Schedule' },
  { id: 5, title: 'Review' }
];

export const CommsCampaignBuilder = ({ onCancel, onSave }: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [content, setContent] = useState('');

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    else onSave();
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1d293d]">Create New Campaign</h2>
          <p className="text-sm text-slate-500">
            Step {currentStep} of 5: {STEPS[currentStep - 1].title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="outline">Save Draft</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 p-6 space-y-1 hidden md:block">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                step.id === currentStep ? 'bg-[#0f172b] text-white' :
                step.id < currentStep ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
              }`}
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
                  <Input placeholder="e.g. Welcome Email 2024" />
                </div>

                <div className="grid gap-2">
                  <Label>Channel</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                        channel === 'email' ? 'border-[#0f172b] bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setChannel('email')}
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
                  <RadioGroup className="space-y-2">
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
                      <RadioGroupItem value="triggered" id="t2" className="mt-1" />
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
                  <Button variant="outline" size="sm">+ Create New Segment</Button>
                </div>
                <RadioGroup className="space-y-3">
                  <div className="flex items-center justify-between border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="a1" />
                      <Label htmlFor="a1" className="cursor-pointer font-medium">
                        All Attendees
                      </Label>
                    </div>
                    <Badge variant="secondary">1,250 Recipients</Badge>
                  </div>
                  <div className="flex items-center justify-between border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vip" id="a2" />
                      <Label htmlFor="a2" className="cursor-pointer font-medium">
                        VIP Ticket Holders
                      </Label>
                    </div>
                    <Badge variant="secondary">120 Recipients</Badge>
                  </div>
                  <div className="flex items-center justify-between border p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no-checkin" id="a3" />
                      <Label htmlFor="a3" className="cursor-pointer font-medium">
                        Not Checked In
                      </Label>
                    </div>
                    <Badge variant="secondary">708 Recipients</Badge>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Content */}
            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <Label>Message Content</Label>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Choose Template
                  </Button>
                </div>

                {channel === 'email' ? (
                  <>
                    <div className="grid gap-2">
                      <Label>Subject Line</Label>
                      <Input placeholder="Don't miss out: Event starts tomorrow!" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email Body</Label>
                      <Textarea
                        className="min-h-[300px]"
                        placeholder="Write your email content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                          {`{{FirstName}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                          {`{{EventName}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                          {`{{TicketType}}`}
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                          {`{{QRCode}}`}
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
                <RadioGroup defaultValue="now" className="space-y-4">
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
                        <Input type="date" />
                        <Input type="time" />
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
                    <span className="font-medium">Welcome Email 2024</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Channel:</span>
                    <span className="font-medium">Email</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-500">Audience:</span>
                    <span className="font-medium">All Attendees (1,250)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Schedule:</span>
                    <span className="font-medium">Send Immediately</span>
                  </div>
                </div>
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
        <Button className="bg-[#0f172b]" onClick={handleNext}>
          {currentStep === 5 ? 'Send Campaign' : 'Next'}
          {currentStep < 5 && <ChevronRight size={16} className="ml-2" />}
        </Button>
      </div>
    </div>
  );
};
