import React, { useState } from 'react';
import { Eye, Send } from 'lucide-react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { VariableTextEditor } from "./VariableTextEditor";
import { toast } from 'sonner';

interface EmailType {
  id: string;
  name: string;
  trigger: string;
  variables: string[];
}

interface EmailEditorValue {
  subject: string;
  body: string;
  sendTiming: 'immediate' | 'scheduled';
  scheduleOffset?: number;
  scheduleUnit?: 'minutes' | 'hours' | 'days';
}

interface EmailEditorComponentProps {
  emailType: EmailType;
  value: EmailEditorValue;
  onChange: (value: Partial<EmailEditorValue>) => void;
}

export function EmailEditorComponent({ emailType, value, onChange }: EmailEditorComponentProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const sampleData: Record<string, string> = {
    '{{attendee_name}}': 'John Smith',
    '{{attendee_email}}': 'john.smith@example.com',
    '{{event_name}}': 'Global Tech Summit 2024',
    '{{event_date}}': 'January 15, 2024',
    '{{event_time}}': '9:00 AM',
    '{{venue_name}}': 'ExCeL London',
    '{{ticket_type}}': 'VIP Pass',
    '{{confirmation_number}}': 'CONF-12345',
    '{{organizer_name}}': 'Event Team',
    '{{payment_amount}}': '$250.00',
    '{{transaction_id}}': 'TXN-98765',
    '{{ticket_download_link}}': 'https://example.com/tickets/12345'
  };

  const renderResolvedPreview = () => {
    let previewSubject = value.subject;
    let previewBody = value.body;

    Object.entries(sampleData).forEach(([variable, sampleValue]) => {
      previewSubject = previewSubject.replaceAll(variable, sampleValue);
      previewBody = previewBody.replaceAll(variable, sampleValue);
    });

    return { previewSubject, previewBody };
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSendTest = () => {
    if (!testEmailAddress) return;
    toast.success(`Test email sent to ${testEmailAddress}`);
    setTestEmailOpen(false);
    setTestEmailAddress('');
  };

  return (
    <>
      <div className="space-y-4">
        {/* Send Timing */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Send Timing</Label>
          <Select 
            value={value.sendTiming}
            onValueChange={(val: 'immediate' | 'scheduled') => onChange({ sendTiming: val })}
          >
            <SelectTrigger className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Conditional Schedule Offset */}
          {value.sendTiming === 'scheduled' && (
            <div className="flex items-center gap-2 mt-2">
              <Input 
                type="number"
                className="w-24 bg-white"
                value={value.scheduleOffset || 24}
                onChange={(e) => onChange({ scheduleOffset: parseInt(e.target.value) })}
              />
              <Select 
                value={value.scheduleUnit || 'hours'}
                onValueChange={(val: 'minutes' | 'hours' | 'days') => onChange({ scheduleUnit: val })}
              >
                <SelectTrigger className="w-32 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-500">before event</span>
            </div>
          )}
        </div>

        {/* Subject (VariableTextEditor) */}
        <VariableTextEditor
          label="Email Subject"
          value={value.subject}
          onChange={(subject) => onChange({ subject })}
          placeholder="Enter email subject..."
          variables={emailType.variables}
          multiline={false}
        />

        {/* Body (VariableTextEditor) */}
        <VariableTextEditor
          label="Email Body"
          value={value.body}
          onChange={(body) => onChange({ body })}
          placeholder="Enter email body..."
          variables={emailType.variables}
          multiline={true}
        />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={handlePreview}>
            <Eye size={14} className="mr-2" />
            Preview
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setTestEmailOpen(true)}>
            <Send size={14} className="mr-2" />
            Send Test
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview: {emailType.name}</DialogTitle>
            <DialogDescription>Preview with sample data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Subject */}
            <div>
              <Label className="text-xs uppercase text-slate-500 mb-2 block">Subject</Label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-900">
                {renderResolvedPreview().previewSubject}
              </div>
            </div>
            
            {/* Body */}
            <div>
              <Label className="text-xs uppercase text-slate-500 mb-2 block">Body</Label>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap font-mono text-sm text-slate-900">
                {renderResolvedPreview().previewBody}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Test Dialog */}
      <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send "{emailType.name}" with sample data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Recipient Email</Label>
              <Input 
                type="email"
                placeholder="test@example.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTestEmailOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSendTest}
              disabled={!testEmailAddress}
            >
              <Send size={16} className="mr-2" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
