import React, { useState } from 'react';
import {
  AlertOctagon, AlertTriangle, CheckCircle2, Download, Edit, Eye, History,
  Info, RefreshCw, XCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { FormField } from './SettingsComponents';
import { toast } from 'sonner';

// ==================== POLICY DIALOGS ====================

// 1. CreatePolicyDialog
interface CreatePolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePolicyDialog = ({ open, onOpenChange }: CreatePolicyDialogProps) => {
  const [policyType, setPolicyType] = useState<string>('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Policy</DialogTitle>
          <DialogDescription>
            Add a new legal policy to your organization's policy library
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField label="Policy Name" required>
            <Input placeholder="e.g., Event Attendance Policy" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Policy Type" required>
              <Select value={policyType} onValueChange={setPolicyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terms">Terms of Service</SelectItem>
                  <SelectItem value="privacy">Privacy Policy</SelectItem>
                  <SelectItem value="code-of-conduct">Code of Conduct</SelectItem>
                  <SelectItem value="refund">Refund & Cancellation</SelectItem>
                  <SelectItem value="jury-ethics">Jury Ethics</SelectItem>
                  <SelectItem value="volunteer">Volunteer Agreement</SelectItem>
                  <SelectItem value="dpa">Data Processing Agreement</SelectItem>
                  <SelectItem value="event-specific">Event-Specific Policy</SelectItem>
                  <SelectItem value="award-specific">Award-Specific Policy</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Scope" required>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Users)</SelectItem>
                  <SelectItem value="event">Event-Specific</SelectItem>
                  <SelectItem value="ticket">Ticket Purchase</SelectItem>
                  <SelectItem value="award">Award Application</SelectItem>
                  <SelectItem value="role">Role-Specific</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Policy Content" required>
            <Textarea rows={8} placeholder="Enter the full policy text here..." />
          </FormField>

          <FormField label="Effective Date" required>
            <Input type="date" />
          </FormField>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-900">
              <strong>Legal Review Required:</strong> All new policies must be approved by the legal team before activation.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Policy created successfully and sent for legal review');
            onOpenChange(false);
          }}>
            Create Policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 2. CreateRuleDialog
interface CreateRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRuleDialog = ({ open, onOpenChange }: CreateRuleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Assignment Rule</DialogTitle>
          <DialogDescription>
            Define when and where this policy should be presented to users
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField label="Select Policy" required>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POL001">Terms of Service</SelectItem>
                <SelectItem value="POL002">Privacy Policy</SelectItem>
                <SelectItem value="POL003">Code of Conduct</SelectItem>
                <SelectItem value="POL004">Refund Policy</SelectItem>
                <SelectItem value="POL005">Jury Ethics</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Target Type" required>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="What does this apply to?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-users">All Users</SelectItem>
                <SelectItem value="role">Specific Role</SelectItem>
                <SelectItem value="event">Specific Event</SelectItem>
                <SelectItem value="ticket">Specific Ticket Type</SelectItem>
                <SelectItem value="award">Specific Award</SelectItem>
                <SelectItem value="payment">Payment Flow</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Priority Level" required>
            <Select defaultValue="2">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1 (Global - Highest)</SelectItem>
                <SelectItem value="2">Level 2 (Event/Role - Medium)</SelectItem>
                <SelectItem value="3">Level 3 (Ticket/Specific - Lowest)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-900">
                Priority determines the order policies are presented. Lower numbers = higher priority.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Assignment rule created successfully');
            onOpenChange(false);
          }}>
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 3. VersionHistoryDialog
interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VersionHistoryDialog = ({ open, onOpenChange }: VersionHistoryDialogProps) => {
  const versions = [
    { version: 'v3.2', date: '2024-11-15', changes: 'Updated refund timeline from 14 to 30 days', approved: true, author: 'Legal Team' },
    { version: 'v3.1', date: '2024-08-10', changes: 'Clarified virtual event liability clauses', approved: true, author: 'Legal Team' },
    { version: 'v3.0', date: '2024-05-01', changes: 'Major GDPR compliance update', approved: true, author: 'Legal Team' },
    { version: 'v2.9', date: '2024-01-15', changes: 'Minor clarifications to cancellation policy', approved: true, author: 'Legal Team' },
    { version: 'v2.8', date: '2023-10-05', changes: 'Added sections for international attendees', approved: true, author: 'Legal Team' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Version History: Terms of Service</DialogTitle>
          <DialogDescription>
            Complete change log for this policy with legal approval status
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-[500px] overflow-y-auto">
          {versions.map((v, idx) => (
            <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <code className="font-mono font-semibold text-slate-900 text-sm">{v.version}</code>
                  {v.approved && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 size={12} className="mr-1" />
                      Legally Approved
                    </Badge>
                  )}
                  {idx === 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-500">{v.date}</span>
              </div>
              <p className="text-sm text-slate-700 mb-2">{v.changes}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Author: {v.author}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  <Eye size={12} className="mr-1" />
                  View Full Text
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  <Download size={12} className="mr-1" />
                  Download PDF
                </Button>
                {idx !== 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    <RefreshCw size={12} className="mr-1" />
                    Restore This Version
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={14} />
            Export Full History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==================== SYSTEM DIALOGS ====================

// 4. EmergencyConfirmationDialog
interface EmergencyConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  onConfirm: () => void;
}

export const EmergencyConfirmationDialog = ({ open, onOpenChange, action, onConfirm }: EmergencyConfirmationDialogProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const requiredText = 'CONFIRM';

  const actionDetails: Record<string, { title: string; description: string; impact: string }> = {
    'pause-email': {
      title: 'Pause All Email Sending',
      description: 'This will immediately stop ALL outgoing emails across the entire platform. This includes transactional emails, notifications, and campaigns.',
      impact: 'HIGH - All users will stop receiving emails'
    },
    'disable-registrations': {
      title: 'Disable New Registrations',
      description: 'This will prevent ALL new user signups across the platform. Existing users will not be affected.',
      impact: 'MEDIUM - New users cannot register'
    },
    'block-payments': {
      title: 'Block All Payments',
      description: 'This will immediately disable all payment processing. Users will not be able to purchase tickets or make any payments.',
      impact: 'CRITICAL - All revenue collection will stop'
    },
    'force-logout': {
      title: 'Force Logout All Users',
      description: 'This will immediately log out EVERY user from the platform, including administrators. You will also be logged out.',
      impact: 'CRITICAL - All users including you will be logged out'
    }
  };

  const details = actionDetails[action] || actionDetails['pause-email'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertOctagon size={20} className="text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-900">{details.title}</DialogTitle>
              <DialogDescription className="text-red-700">
                This action requires confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900 mb-2">{details.description}</p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-200">
              <AlertTriangle size={14} className="text-red-600 shrink-0" />
              <p className="text-xs font-semibold text-red-900">IMPACT: {details.impact}</p>
            </div>
          </div>

          <FormField 
            label={`Type "${requiredText}" to confirm`}
            helper="This action will be logged and audited"
          >
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={requiredText}
              className="font-mono"
            />
          </FormField>

          <FormField label="Reason for Emergency Action" required>
            <Textarea 
              rows={3} 
              placeholder="Explain why this emergency action is necessary..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => {
            setConfirmText('');
            setReason('');
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            disabled={confirmText !== requiredText || !reason.trim()}
            onClick={() => {
              onConfirm();
              setConfirmText('');
              setReason('');
              onOpenChange(false);
            }}
          >
            Execute Emergency Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 5. ScheduleMaintenanceDialog
interface ScheduleMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleMaintenanceDialog = ({ open, onOpenChange }: ScheduleMaintenanceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance Window</DialogTitle>
          <DialogDescription>
            Plan a maintenance window with advance user notification
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <Input type="date" />
            </FormField>
            <FormField label="Start Time" required>
              <Input type="time" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="End Date" required>
              <Input type="date" />
            </FormField>
            <FormField label="End Time" required>
              <Input type="time" />
            </FormField>
          </div>

          <FormField label="Maintenance Message" required>
            <Textarea 
              rows={3} 
              placeholder="Message that will be displayed to users during maintenance"
              defaultValue="NISAU is currently undergoing scheduled maintenance. We'll be back shortly."
            />
          </FormField>

          <FormField label="Advance Notification">
            <Select defaultValue="24h">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour before</SelectItem>
                <SelectItem value="6h">6 hours before</SelectItem>
                <SelectItem value="24h">24 hours before</SelectItem>
                <SelectItem value="72h">3 days before</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-900">
                Users will receive email notifications based on your selected advance notification time.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Maintenance window scheduled successfully');
            onOpenChange(false);
          }}>
            Schedule Maintenance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
