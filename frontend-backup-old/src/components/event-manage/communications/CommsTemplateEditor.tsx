import React, { useState } from 'react';
import { ChevronLeft, Save, Copy, Trash2, Mail, MessageSquare, Variable } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface TemplateEditorProps {
  onCancel: () => void;
  onSave: (template: any) => void;
  initialData?: any;
}

const VariableItem = ({ name, code }: { name: string; code: string }) => (
  <div
    className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 group"
    onClick={() => {
      navigator.clipboard.writeText(code);
    }}
  >
    <span className="text-sm font-medium text-slate-700">
      {name}
    </span>
    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 group-hover:bg-white group-hover:border group-hover:border-slate-200">
      {code}
    </code>
  </div>
);

export const CommsTemplateEditor = ({ onCancel, onSave, initialData }: TemplateEditorProps) => {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    channel: "email",
    subject: "",
    content: ""
  });

  const handleSave = () => {
    onSave(formData);
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
              {initialData ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="text-sm text-slate-500">
              Design reusable messages for your team.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Delete Button */}
          <Button
            variant="ghost"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>

          {/* Duplicate Button */}
          <Button variant="outline">
            <Copy size={16} className="mr-2" /> Duplicate
          </Button>

          {/* Save Button */}
          <Button className="bg-[#0f172b]" onClick={handleSave}>
            <Save size={16} className="mr-2" /> Save Template
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Channel Selection */}
              <div className="grid gap-2">
                <Label>Channel</Label>
                <div className="flex gap-4">
                  {/* Email Option */}
                  <div
                    className={`flex-1 border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                      formData.channel === 'email'
                        ? 'border-[#0f172b] bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setFormData({ ...formData, channel: 'email' })}
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Mail size={20} />
                    </div>
                    <div className="font-medium text-slate-900">Email</div>
                  </div>

                  {/* SMS Option */}
                  <div
                    className={`flex-1 border rounded-xl p-4 cursor-pointer flex items-center gap-3 ${
                      formData.channel === 'sms'
                        ? 'border-[#0f172b] bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setFormData({ ...formData, channel: 'sms' })}
                  >
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <MessageSquare size={20} />
                    </div>
                    <div className="font-medium text-slate-900">SMS</div>
                  </div>
                </div>
              </div>

              {/* Subject Line (Email Only) */}
              {formData.channel === 'email' && (
                <div className="grid gap-2">
                  <Label>Subject Line</Label>
                  <Input
                    placeholder="Your event registration details"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              )}

              {/* Content Textarea */}
              <div className="grid gap-2">
                <Label>Content</Label>
                <Textarea
                  className="min-h-[300px] font-mono text-sm"
                  placeholder={
                    formData.channel === 'email'
                      ? "<html>...</html> or plain text"
                      : "SMS content..."
                  }
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />

                {/* Character Count (SMS Only) */}
                {formData.channel === 'sms' && (
                  <p className="text-xs text-slate-500 text-right">
                    {formData.content.length} characters
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
            Click to copy variables to your clipboard.
          </p>

          <div className="space-y-6">
            {/* Section 1: Attendee */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                Attendee
              </h4>
              <div className="space-y-2">
                <VariableItem name="First Name" code="{{FirstName}}" />
                <VariableItem name="Last Name" code="{{LastName}}" />
                <VariableItem name="Email" code="{{Email}}" />
                <VariableItem name="Ticket Type" code="{{TicketType}}" />
                <VariableItem name="Order ID" code="{{OrderId}}" />
              </div>
            </div>

            {/* Section 2: Event */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                Event
              </h4>
              <div className="space-y-2">
                <VariableItem name="Event Name" code="{{EventName}}" />
                <VariableItem name="Event Date" code="{{EventDate}}" />
                <VariableItem name="Location" code="{{Location}}" />
                <VariableItem name="Venue Map" code="{{MapLink}}" />
              </div>
            </div>

            {/* Section 3: System */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                System
              </h4>
              <div className="space-y-2">
                <VariableItem name="QR Code Image" code="{{QRCode}}" />
                <VariableItem name="Add to Calendar" code="{{CalendarLink}}" />
                <VariableItem name="Unsubscribe Link" code="{{Unsubscribe}}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
