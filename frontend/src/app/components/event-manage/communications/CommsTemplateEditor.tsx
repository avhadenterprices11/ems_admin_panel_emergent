import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Copy, Trash2, Mail, MessageSquare, Variable, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { MessageTemplate, CreateTemplateInput } from '../../../api/events.api';

interface TemplateEditorProps {
  eventId: number;
  template?: MessageTemplate | null;
  onCancel: () => void;
  onSave: (data: CreateTemplateInput) => void;
}

const VariableItem = ({ name, code, onClick }: { name: string; code: string; onClick: () => void }) => (
  <div
    className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 group"
    onClick={onClick}
  >
    <span className="text-sm font-medium text-slate-700">
      {name}
    </span>
    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 group-hover:bg-white group-hover:border group-hover:border-slate-200">
      {code}
    </code>
  </div>
);

export const CommsTemplateEditor = ({ eventId, template, onCancel, onSave }: TemplateEditorProps) => {
  const [name, setName] = useState(template?.name || '');
  const [channel, setChannel] = useState<'email' | 'sms'>(template?.channel || 'email');
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.content || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }
    if (!content.trim()) {
      return;
    }

    setLoading(true);
    try {
      const data: CreateTemplateInput = {
        name: name.trim(),
        channel,
        subject: channel === 'email' ? subject.trim() : undefined,
        content: content.trim(),
      };
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (code: string) => {
    setContent(prev => prev + code);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        {/* Left: Back Button + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="-ml-2"
          >
            <ChevronLeft size={24} className="text-slate-400" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#1d293d]">
              {template ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="text-sm text-slate-500">
              Design reusable messages for your team.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Cancel Button */}
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>

          {/* Save Button */}
          <Button 
            className="bg-[#0f172b]" 
            onClick={handleSave}
            disabled={loading || !name.trim() || !content.trim()}
            data-testid="save-template-btn"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor (Left) */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
              {/* Template Name */}
              <div className="grid gap-2">
                <Label>
                  Template Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Registration Confirmation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="template-name-input"
                />
              </div>

              {/* Channel Selection */}
              <div className="grid gap-2">
                <Label>Channel</Label>
                <div className="flex gap-4">
                  {/* Email Option */}
                  <div
                    className={`flex-1 border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                      channel === 'email'
                        ? 'border-[#0f172b] bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setChannel('email')}
                    data-testid="template-channel-email"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Mail size={20} />
                    </div>
                    <div className="font-medium text-slate-900">Email</div>
                  </div>

                  {/* SMS Option */}
                  <div
                    className={`flex-1 border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                      channel === 'sms'
                        ? 'border-[#0f172b] bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setChannel('sms')}
                    data-testid="template-channel-sms"
                  >
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <MessageSquare size={20} />
                    </div>
                    <div className="font-medium text-slate-900">SMS</div>
                  </div>
                </div>
              </div>

              {/* Subject Line (Email Only) */}
              {channel === 'email' && (
                <div className="grid gap-2">
                  <Label>Subject Line</Label>
                  <Input
                    placeholder="Your event registration details"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    data-testid="template-subject-input"
                  />
                </div>
              )}

              {/* Content Textarea */}
              <div className="grid gap-2">
                <Label>Content <span className="text-red-500">*</span></Label>
                <Textarea
                  className="min-h-[300px] font-mono text-sm"
                  placeholder={
                    channel === 'email'
                      ? "Write your email content here...\n\nHi {{FirstName}},\n\nThank you for registering for {{EventName}}!"
                      : "SMS content..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  data-testid="template-content-input"
                />

                {/* Character Count (SMS Only) */}
                {channel === 'sms' && (
                  <p className="text-xs text-slate-500 text-right">
                    {content.length} characters
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Variables Sidebar (Right) */}
        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto hidden lg:block">
          {/* Header */}
          <h3 className="font-bold text-[#1d293d] mb-4 flex items-center gap-2">
            <Variable size={18} /> Available Variables
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Click to insert variables into your template.
          </p>

          <div className="space-y-6">
            {/* Section 1: Attendee */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                Attendee
              </h4>
              <div className="space-y-2">
                <VariableItem name="First Name" code="{{FirstName}}" onClick={() => insertVariable('{{FirstName}}')} />
                <VariableItem name="Last Name" code="{{LastName}}" onClick={() => insertVariable('{{LastName}}')} />
                <VariableItem name="Email" code="{{Email}}" onClick={() => insertVariable('{{Email}}')} />
                <VariableItem name="Ticket Type" code="{{TicketType}}" onClick={() => insertVariable('{{TicketType}}')} />
                <VariableItem name="Order ID" code="{{OrderId}}" onClick={() => insertVariable('{{OrderId}}')} />
              </div>
            </div>

            {/* Section 2: Event */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                Event
              </h4>
              <div className="space-y-2">
                <VariableItem name="Event Name" code="{{EventName}}" onClick={() => insertVariable('{{EventName}}')} />
                <VariableItem name="Event Date" code="{{EventDate}}" onClick={() => insertVariable('{{EventDate}}')} />
                <VariableItem name="Location" code="{{Location}}" onClick={() => insertVariable('{{Location}}')} />
                <VariableItem name="Venue Map" code="{{MapLink}}" onClick={() => insertVariable('{{MapLink}}')} />
              </div>
            </div>

            {/* Section 3: System */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                System
              </h4>
              <div className="space-y-2">
                <VariableItem name="QR Code Image" code="{{QRCode}}" onClick={() => insertVariable('{{QRCode}}')} />
                <VariableItem name="Add to Calendar" code="{{CalendarLink}}" onClick={() => insertVariable('{{CalendarLink}}')} />
                <VariableItem name="Unsubscribe Link" code="{{Unsubscribe}}" onClick={() => insertVariable('{{Unsubscribe}}')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
