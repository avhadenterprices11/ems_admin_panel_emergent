import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Save, Plus, Trash2, Users, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  eventsAPI, 
  AudienceSegment, 
  SegmentRule, 
  SegmentMember, 
  FilterField,
  CreateSegmentInput 
} from '../../../api/events.api';
import { toast } from 'sonner';
import { debounce } from 'lodash';

interface AudienceBuilderProps {
  eventId: number;
  segment?: AudienceSegment | null;
  onCancel: () => void;
  onSave: (data: CreateSegmentInput) => void;
}

interface Rule extends SegmentRule {
  id: number;
}

const operatorLabels: Record<string, string> = {
  equals: 'Is',
  not_equals: 'Is Not',
  contains: 'Contains',
  not_contains: 'Does Not Contain',
  in: 'Is One Of',
  not_in: 'Is Not One Of',
  greater_than: 'After',
  less_than: 'Before',
  between: 'Between',
  is_empty: 'Is Empty',
  is_not_empty: 'Is Not Empty',
};

const checkInStatusOptions = [
  { value: 'checked_in', label: 'Checked In' },
  { value: 'not_checked_in', label: 'Not Checked In' },
  { value: 'no_show', label: 'No Show' },
];

const registrationStatusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const CommsAudienceBuilder = ({ eventId, segment, onCancel, onSave }: AudienceBuilderProps) => {
  const [name, setName] = useState(segment?.name || '');
  const [description, setDescription] = useState(segment?.description || '');
  const [matchType, setMatchType] = useState<'ALL' | 'ANY'>(segment?.match_type || 'ALL');
  const [isActive, setIsActive] = useState(segment?.is_active !== false);
  const [rules, setRules] = useState<Rule[]>(
    segment?.rules_json?.map((r, i) => ({ ...r, id: i + 1 })) || 
    [{ id: 1, field: 'checkin_status', operator: 'equals', value: '' }]
  );
  const [filterFields, setFilterFields] = useState<FilterField[]>([]);
  
  // Preview state
  const [previewMembers, setPreviewMembers] = useState<SegmentMember[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch filter fields
  useEffect(() => {
    const fetchFilterFields = async () => {
      try {
        const fields = await eventsAPI.getFilterFields(eventId);
        setFilterFields(fields);
      } catch (error) {
        console.error('Error fetching filter fields:', error);
      }
    };
    fetchFilterFields();
  }, [eventId]);

  // Debounced preview function
  const fetchPreview = useCallback(
    debounce(async (rulesData: SegmentRule[], match: 'ALL' | 'ANY') => {
      if (rulesData.length === 0) return;
      
      // Only preview if at least one rule has a value (except for is_empty/is_not_empty operators)
      const hasValidRule = rulesData.some(r => 
        r.value || r.operator === 'is_empty' || r.operator === 'is_not_empty'
      );
      if (!hasValidRule) {
        setPreviewMembers([]);
        setPreviewTotal(0);
        return;
      }

      setPreviewLoading(true);
      try {
        const result = await eventsAPI.previewSegment(eventId, rulesData, match, 10);
        setPreviewMembers(result.members);
        setPreviewTotal(result.total);
      } catch (error) {
        console.error('Error previewing segment:', error);
      } finally {
        setPreviewLoading(false);
      }
    }, 500),
    [eventId]
  );

  // Update preview when rules change
  useEffect(() => {
    const segmentRules = rules.map(({ field, operator, value }) => ({ field, operator, value })) as SegmentRule[];
    fetchPreview(segmentRules, matchType);
  }, [rules, matchType, fetchPreview]);

  const addRule = () => {
    setRules([...rules, {
      id: Date.now(),
      field: 'checkin_status',
      operator: 'equals',
      value: ''
    }]);
  };

  const removeRule = (id: number) => {
    if (rules.length > 1) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const updateRule = (id: number, updates: Partial<Rule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    setSaving(true);
    try {
      const segmentRules = rules.map(({ field, operator, value }) => ({ 
        field, 
        operator: operator as SegmentRule['operator'], 
        value 
      }));

      const data: CreateSegmentInput = {
        name: name.trim(),
        description: description.trim() || undefined,
        match_type: matchType,
        rules_json: segmentRules,
        is_active: isActive,
      };

      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const getFieldOptions = (field: string): { value: string; label: string }[] => {
    if (field === 'checkin_status') return checkInStatusOptions;
    if (field === 'registration_status') return registrationStatusOptions;
    return [];
  };

  const isSelectField = (field: string) => {
    return ['checkin_status', 'registration_status'].includes(field);
  };

  const needsValueInput = (operator: string) => {
    return !['is_empty', 'is_not_empty'].includes(operator);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
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
              {segment ? 'Edit Segment' : 'Create Audience Segment'}
            </h2>
            <p className="text-sm text-slate-500">
              Filter attendees based on specific criteria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            className="bg-[#0f172b]" 
            onClick={handleSave}
            disabled={saving}
            data-testid="save-segment-btn"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Segment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Rules Builder (Left) */}
        <div className="w-[450px] bg-white border-r border-slate-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Segment Name */}
            <div className="grid gap-2">
              <Label>Segment Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. VIP Attendees"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="segment-name-input"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the purpose of this segment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Match Type */}
            <div className="grid gap-2">
              <Label>Match Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={matchType === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMatchType('ALL')}
                  className={matchType === 'ALL' ? 'bg-[#0f172b]' : ''}
                >
                  Match ALL (AND)
                </Button>
                <Button
                  variant={matchType === 'ANY' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMatchType('ANY')}
                  className={matchType === 'ANY' ? 'bg-[#0f172b]' : ''}
                >
                  Match ANY (OR)
                </Button>
              </div>
            </div>

            {/* Filter Rules Section */}
            <div className="space-y-4">
              <Label>Filter Rules</Label>

              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative group"
                >
                  {/* AND/OR Badge */}
                  {index > 0 && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded ${
                      matchType === 'ALL' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {matchType === 'ALL' ? 'AND' : 'OR'}
                    </div>
                  )}

                  {/* Delete Button */}
                  {rules.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                      onClick={() => removeRule(rule.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}

                  {/* Field Selector */}
                  <Select 
                    value={rule.field} 
                    onValueChange={(v) => updateRule(rule.id, { field: v, value: '' })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filterFields.map(f => (
                        <SelectItem key={f.field} value={f.field}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator + Value */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Operator Selector */}
                    <Select 
                      value={rule.operator}
                      onValueChange={(v) => updateRule(rule.id, { operator: v as SegmentRule['operator'] })}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterFields.find(f => f.field === rule.field)?.operators.map(op => (
                          <SelectItem key={op} value={op}>{operatorLabels[op] || op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value Input */}
                    {needsValueInput(rule.operator) && (
                      isSelectField(rule.field) ? (
                        <Select 
                          value={rule.value as string}
                          onValueChange={(v) => updateRule(rule.id, { value: v })}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldOptions(rule.field).map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          className="bg-white" 
                          placeholder="Value..." 
                          value={rule.value as string || ''}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        />
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* Add Rule Button */}
              <Button
                variant="outline"
                className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700"
                onClick={addRule}
              >
                <Plus size={16} className="mr-2" /> Add Rule
              </Button>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-slate-500">Enable this segment for campaigns</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </div>

        {/* Live Preview (Right) */}
        <div className="flex-1 bg-slate-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-[#1d293d] flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  Matched Attendees
                </h3>
                <p className="text-xs text-slate-500">
                  Live preview based on current rules.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-600 border-emerald-100"
              >
                {previewLoading ? '...' : `${previewTotal} Match${previewTotal !== 1 ? 'es' : ''}`}
              </Badge>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {previewLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : previewMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                  <Users size={32} className="mb-2 text-slate-300" />
                  <p className="text-sm">No matches found</p>
                  <p className="text-xs">Adjust your filter rules</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-[#253154] font-bold">Name</TableHead>
                      <TableHead className="text-[#253154] font-bold">Ticket</TableHead>
                      <TableHead className="text-[#253154] font-bold">Status</TableHead>
                      <TableHead className="text-[#253154] font-bold">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewMembers.map((member) => (
                      <TableRow key={member.attendee_id}>
                        <TableCell className="font-medium text-[#1d293d]">
                          {member.attendee_name}
                        </TableCell>
                        <TableCell>{member.ticket_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-normal ${
                            member.checkin_status === 'checked_in' 
                              ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                              : 'text-slate-500'
                          }`}>
                            {member.checkin_status === 'checked_in' ? 'Checked In' : 'Not Checked In'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {member.attendee_email || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Footer */}
            {previewTotal > 10 && (
              <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                Showing 10 of {previewTotal} matches
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
