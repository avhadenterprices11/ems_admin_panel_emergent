import React, { useState } from 'react';
import { ChevronLeft, Save, Plus, Trash2, Users, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

interface AudienceBuilderProps {
  onCancel: () => void;
  onSave: (segment: any) => void;
}

interface Rule {
  id: number;
  field: string;
  operator: string;
  value: string;
}

export const CommsAudienceBuilder = ({ onCancel, onSave }: AudienceBuilderProps) => {
  const [segmentName, setSegmentName] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, field: 'ticket_type', operator: 'is', value: '' }
  ]);

  const addRule = () => {
    setRules([...rules, {
      id: Date.now(),
      field: 'ticket_type',
      operator: 'is',
      value: ''
    }]);
  };

  const removeRule = (id: number) => {
    if (rules.length > 1) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    onSave({ name: segmentName, rules });
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
              Create Audience Segment
            </h2>
            <p className="text-sm text-slate-500">
              Filter attendees based on specific criteria.
            </p>
          </div>
        </div>

        {/* Right: Save Button */}
        <div className="flex items-center gap-2">
          <Button className="bg-[#0f172b]" onClick={handleSave}>
            <Save size={16} className="mr-2" /> Save Segment
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
              <Label>Segment Name</Label>
              <Input
                placeholder="e.g. VIPs from London"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
              />
            </div>

            {/* Filter Rules Section */}
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <Label>Filter Rules</Label>
                <span className="text-xs text-slate-400 uppercase font-bold">
                  Match All (AND)
                </span>
              </div>

              {/* Rules List */}
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 relative group"
                >
                  {/* AND Badge (Not on first rule) */}
                  {index > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                      AND
                    </div>
                  )}

                  {/* Delete Button (Hover) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 size={14} />
                  </Button>

                  {/* Field Selector */}
                  <Select defaultValue={rule.field}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ticket_type">Ticket Type</SelectItem>
                      <SelectItem value="status">Check-in Status</SelectItem>
                      <SelectItem value="reg_date">Registration Date</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="tag">Tags</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Operator + Value */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Operator Selector */}
                    <Select defaultValue={rule.operator}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="is">Is</SelectItem>
                        <SelectItem value="is_not">Is Not</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Value Input */}
                    <Input className="bg-white" placeholder="Value..." />
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
                  Previewing results based on current rules.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-600 border-emerald-100"
              >
                124 Matches
              </Badge>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
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
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-[#1d293d]">
                        John Doe {i}
                      </TableCell>
                      <TableCell>General Admission</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-slate-500">
                          Registered
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        john.doe{i}@example.com
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <RefreshCw size={14} className="mr-2" /> Refresh Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};